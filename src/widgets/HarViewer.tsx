/**
 * HarViewer — the tool's only non-frozen widget.
 *
 * Opens a .har file chosen from the picker or dropped anywhere on the page (via the
 * frozen GlobalDropZone's `filesDropped` CustomEvent<File[]>). A HAR file is plain JSON
 * (`src/utils/harParse.ts` does `JSON.parse` + shape validation, nothing more), so
 * everything here runs synchronously in the browser on bytes already in memory.
 *
 * The request list reuses the exact windowing math from csv-viewer's
 * `virtualWindow.ts` (`computeWindow`) so a capture with thousands of entries stays
 * responsive. Every entry's headers, query-string values, and cookie values are scanned
 * for common secret/token shapes on load (`src/utils/secretDetect.ts`) — matches are
 * flagged in the list and highlighted (never redacted) in the detail panel. Bodies are
 * never scanned; that is explicitly out of scope for this version (issue #86).
 *
 * The island receives `locale` as a prop (present during SSR) and reads all strings
 * from the i18n table, so SSR and client render identically.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'preact/hooks';
import { AppCard } from './AppCard';
import { AppButton } from './AppButton';
import { WaterfallBar } from './WaterfallBar';
import { ui, type UiStrings } from '@/i18n/ui';
import { validateFile, type ValidationCode } from '@/utils/fileValidation';
import {
  parseHarFile,
  computeCaptureSpanMs,
  humanBytes,
  shortMimeType,
  formatDurationMs,
  statusClass,
  prepareBody,
  type HarEntry,
  type HarFile,
  type HarNameValue,
  type HarParseErrorCode,
} from '@/utils/harParse';
import { computeWindow } from '@/utils/virtualWindow';
import {
  scanEntrySecrets,
  classifyHeader,
  classifyQueryParam,
  classifyCookie,
  type SecretKind,
  type SecretMatch,
} from '@/utils/secretDetect';
import { WATERFALL_PHASES, describeWaterfall, type WaterfallPhase } from '@/utils/waterfall';

/** Fixed rendered row height (px). Must match the CSS on th/td. */
const ROW_HEIGHT = 34;
/** Below this entry count everything is rendered; above it, only a window. */
const VIRTUALIZE_THRESHOLD = 200;
/** flag + method + url + status + type + size + time + waterfall + action */
const COLUMN_COUNT = 9;

type ErrorCode = ValidationCode | HarParseErrorCode;

interface EntryRow {
  index: number;
  entry: HarEntry;
  secrets: SecretMatch[];
}

interface ReadyState {
  fileName: string;
  har: HarFile;
}

interface HarViewerProps {
  locale?: string;
}

const SECRET_KIND_UI_KEY: Record<SecretKind, keyof UiStrings> = {
  bearerToken: 'secretBearerToken',
  jwt: 'secretJwt',
  awsKey: 'secretAwsKey',
  githubToken: 'secretGithubToken',
  apiKeyPrefix: 'secretApiKeyPrefix',
  secretQueryParam: 'secretQueryParam',
  cookieHeader: 'secretCookieHeader',
};

const TIMING_LABEL_KEY: Record<WaterfallPhase, keyof UiStrings> = {
  blocked: 'timingBlocked',
  dns: 'timingDns',
  connect: 'timingConnect',
  send: 'timingSend',
  wait: 'timingWait',
  receive: 'timingReceive',
};

function secretKindLabels(kinds: SecretKind[], t: UiStrings): string {
  return [...new Set(kinds)].map((k) => t[SECRET_KIND_UI_KEY[k]]).join(', ');
}

function phaseLabels(t: UiStrings): Record<WaterfallPhase, string> {
  const out = {} as Record<WaterfallPhase, string>;
  for (const phase of WATERFALL_PHASES) out[phase] = t[TIMING_LABEL_KEY[phase]];
  return out;
}

/** A name/value table (headers / query params / cookies) with secret values highlighted
 *  — never hidden — via classify(name, value). Renders nothing when items is empty. */
function NameValueTable({
  items,
  classify,
  t,
  testId,
}: {
  items: HarNameValue[];
  classify: (name: string, value: string) => SecretKind[];
  t: UiStrings;
  testId: string;
}) {
  if (items.length === 0) return null;
  return (
    <table class="har-kv" data-testid={testId}>
      <tbody>
        {items.map((item, i) => {
          const kinds = classify(item.name, item.value);
          const flagged = kinds.length > 0;
          const label = flagged ? secretKindLabels(kinds, t) : '';
          return (
            <tr key={i}>
              <th scope="row">{item.name}</th>
              <td class="har-kv__value">
                {flagged ? (
                  <mark class="har-secret-value" title={label} data-testid="secret-value">
                    {item.value}
                  </mark>
                ) : (
                  item.value
                )}
                {flagged && (
                  <span class="visually-hidden">
                    {' '}
                    ({t.secretMatchAria.replace('{kind}', label)})
                  </span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function BodySection({
  body,
  t,
  testId,
}: {
  body: ReturnType<typeof prepareBody>;
  t: UiStrings;
  testId: string;
}) {
  if (body.kind === 'empty') return <p class="har-detail__note">{t.noBody}</p>;
  if (body.kind === 'binary') return <p class="har-detail__note">{t.bodyBinaryNote}</p>;
  return (
    <pre
      class={`har-body${body.kind === 'json' ? ' har-body--json' : ''}`}
      data-testid={testId}
    >
      {body.content}
    </pre>
  );
}

function EntryDetail({
  row,
  captureSpanMs,
  t,
  onClose,
  panelRef,
}: {
  row: EntryRow;
  captureSpanMs: number;
  t: UiStrings;
  onClose: () => void;
  panelRef: (el: HTMLDivElement | null) => void;
}) {
  const { entry, secrets } = row;
  const reqBody = useMemo(
    () => prepareBody(entry.request.postData?.text, entry.request.postData?.mimeType ?? ''),
    [entry]
  );
  const resBody = useMemo(
    () =>
      prepareBody(
        entry.response.content.text,
        entry.response.content.mimeType,
        entry.response.content.encoding
      ),
    [entry]
  );
  const labels = phaseLabels(t);
  const wfLabel = describeWaterfall(entry.timings, labels);
  const hasSecrets = secrets.length > 0;

  return (
    <div
      id="har-detail-panel"
      class="har-detail"
      role="region"
      aria-label={t.detailHeading}
      tabIndex={-1}
      ref={panelRef}
      data-testid="detail-panel"
    >
      <div class="har-detail__head">
        <h3 class="har-detail__title">
          <span class={`har-method har-method--${entry.request.method.toLowerCase()}`}>
            {entry.request.method}
          </span>{' '}
          <span class="har-detail__url" data-testid="detail-url">
            {entry.request.url}
          </span>
        </h3>
        <button
          type="button"
          class="har-fs-close"
          onClick={onClose}
          aria-label={t.closeDetail}
          title={t.closeDetail}
          data-testid="close-detail"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>

      {hasSecrets && (
        <p class="har-secrets-summary har-secrets-summary--entry" data-testid="detail-secrets-note">
          {t.secretMatchAria.replace('{kind}', secretKindLabels(
            secrets.map((s) => s.kind),
            t
          ))}
        </p>
      )}

      <dl class="har-detail__summary">
        <div>
          <dt>{t.statusLabel}</dt>
          <dd data-testid="detail-status">
            {entry.response.status || '–'} {entry.response.statusText ?? ''}
          </dd>
        </div>
        <div>
          <dt>{t.httpVersionLabel}</dt>
          <dd>{entry.request.httpVersion || '–'}</dd>
        </div>
        <div>
          <dt>{t.colTime}</dt>
          <dd class="num">{formatDurationMs(entry.time)}</dd>
        </div>
        <div>
          <dt>{t.colType}</dt>
          <dd>{entry.response.content.mimeType || '–'}</dd>
        </div>
      </dl>

      <section class="har-detail__section">
        <h4>{t.timingHeading}</h4>
        <WaterfallBar timings={entry.timings} captureSpanMs={captureSpanMs} label={wfLabel} />
        <ul class="har-timing-list">
          {WATERFALL_PHASES.map((phase) => {
            const raw = entry.timings[phase];
            const text = typeof raw === 'number' && raw >= 0 ? `${Math.round(raw)} ms` : '–';
            return (
              <li key={phase}>
                <span class={`har-wf__swatch har-wf__seg--${phase}`} aria-hidden="true" />
                {labels[phase]}: <span class="num">{text}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {entry.request.queryString.length > 0 && (
        <section class="har-detail__section">
          <h4>{t.queryParamsHeading}</h4>
          <NameValueTable
            items={entry.request.queryString}
            classify={classifyQueryParam}
            t={t}
            testId="detail-query-params"
          />
        </section>
      )}

      <section class="har-detail__section">
        <h4>{t.requestHeadersHeading}</h4>
        <NameValueTable
          items={entry.request.headers}
          classify={classifyHeader}
          t={t}
          testId="detail-request-headers"
        />
      </section>

      <section class="har-detail__section">
        <h4>{t.requestBodyHeading}</h4>
        <BodySection body={reqBody} t={t} testId="detail-request-body" />
      </section>

      <section class="har-detail__section">
        <h4>{t.responseHeadersHeading}</h4>
        <NameValueTable
          items={entry.response.headers}
          classify={classifyHeader}
          t={t}
          testId="detail-response-headers"
        />
      </section>

      <section class="har-detail__section">
        <h4>{t.responseBodyHeading}</h4>
        <BodySection body={resBody} t={t} testId="detail-response-body" />
      </section>

      {(entry.request.cookies.length > 0 || entry.response.cookies.length > 0) && (
        <section class="har-detail__section" data-testid="detail-cookies">
          <h4>{t.cookiesHeading}</h4>
          {entry.request.cookies.length > 0 && (
            <>
              <h5>{t.requestCookiesHeading}</h5>
              <NameValueTable
                items={entry.request.cookies}
                classify={classifyCookie}
                t={t}
                testId="detail-request-cookies"
              />
            </>
          )}
          {entry.response.cookies.length > 0 && (
            <>
              <h5>{t.responseCookiesHeading}</h5>
              <NameValueTable
                items={entry.response.cookies}
                classify={classifyCookie}
                t={t}
                testId="detail-response-cookies"
              />
            </>
          )}
        </section>
      )}
    </div>
  );
}

export function HarViewer({ locale = 'en' }: HarViewerProps) {
  const t = (ui as any)[locale] ?? ui.en;

  const [ready, setReady] = useState<ReadyState | null>(null);
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null);
  const [errorName, setErrorName] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(420);

  const finish = useCallback(() => {
    window.dispatchEvent(new CustomEvent('filesProcessed'));
  }, []);

  const reset = useCallback(() => {
    setReady(null);
    setErrorCode(null);
    setErrorName('');
    setSelectedIndex(null);
    setScrollTop(0);
    const input = document.getElementById('har-file-input') as HTMLInputElement | null;
    if (input) input.value = '';
  }, []);

  const handleFile = useCallback(async (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setReady(null);
      setSelectedIndex(null);
      setErrorName(file.name);
      setErrorCode('wrongType');
      return;
    }
    const result = await parseHarFile(file);
    if (!result.ok) {
      setReady(null);
      setSelectedIndex(null);
      setErrorName(file.name);
      setErrorCode(result.code);
      return;
    }
    setErrorCode(null);
    setReady({ fileName: file.name, har: result.har });
    setSelectedIndex(null);
    setScrollTop(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  const handleFiles = useCallback(
    async (files: File[]) => {
      // A viewer shows one capture; take the first if several are dropped.
      if (files.length > 0) await handleFile(files[0]);
      finish();
    },
    [handleFile, finish]
  );

  useEffect(() => {
    (globalThis as Record<string, unknown>).__toolReady = true;
  }, []);

  useEffect(() => {
    const handler = (e: Event) => void handleFiles((e as CustomEvent<File[]>).detail ?? []);
    window.addEventListener('filesDropped', handler);
    return () => window.removeEventListener('filesDropped', handler);
  }, [handleFiles]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setViewportHeight(el.clientHeight || 420);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ready !== null]);

  // While the fullscreen viewer is open: Escape closes it and clears the file,
  // background scroll is locked, and focus moves into the dialog.
  useEffect(() => {
    if (!ready) return;
    overlayRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        reset();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [ready, reset]);

  // Move focus into the detail panel whenever a new row is selected, so keyboard and
  // screen-reader users notice it appeared.
  useEffect(() => {
    if (selectedIndex !== null) detailRef.current?.focus();
  }, [selectedIndex]);

  const onPick = (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    void handleFiles(files);
    input.value = '';
  };

  const errorText = (code: ErrorCode): string => {
    switch (code) {
      case 'wrongType':
        return t.errWrongType.replace('{name}', errorName);
      case 'unreadable':
        return t.errUnreadable.replace('{name}', errorName);
      case 'empty':
        return t.errEmpty.replace('{name}', errorName);
      case 'invalidJson':
        return t.errInvalidJson.replace('{name}', errorName);
      case 'notHar':
        return t.errNotHar.replace('{name}', errorName);
    }
  };

  const entries = ready?.har.log.entries ?? [];
  const rows: EntryRow[] = useMemo(
    () => entries.map((entry, index) => ({ index, entry, secrets: scanEntrySecrets(entry) })),
    [entries]
  );
  const captureSpanMs = useMemo(() => computeCaptureSpanMs(entries), [entries]);
  const flaggedCount = useMemo(() => rows.filter((r) => r.secrets.length > 0).length, [rows]);
  const selectedRow = selectedIndex !== null ? (rows[selectedIndex] ?? null) : null;

  const virtualize = rows.length > VIRTUALIZE_THRESHOLD;
  const win = virtualize
    ? computeWindow({ scrollTop, viewportHeight, rowHeight: ROW_HEIGHT, rowCount: rows.length })
    : { startIndex: 0, endIndex: rows.length, topPad: 0, bottomPad: 0, totalHeight: rows.length * ROW_HEIGHT };
  const visible = rows.slice(win.startIndex, win.endIndex);
  const labels = phaseLabels(t);

  return (
    <div>
      <AppCard>
        <div style="margin-bottom: var(--space-4);">
          <h2 style="margin: 0 0 var(--space-1) 0; font-size: var(--fs-4); font-weight: 600;">
            {t.uploadHeading}
          </h2>
          <p style="margin: 0; font-size: var(--fs-2); color: var(--color-subtle);">
            {t.uploadSubtitle}
          </p>
        </div>

        <button
          type="button"
          class="har-dropzone"
          onClick={() => document.getElementById('har-file-input')?.click()}
        >
          <span class="har-dropzone__icon" aria-hidden="true">
            🌐
          </span>
          <span class="har-dropzone__title">{t.dropClick}</span>
          <span class="har-dropzone__hint">{t.dropOr}</span>
          <span class="har-dropzone__hint">{t.dropSupported}</span>
        </button>
        <input
          id="har-file-input"
          type="file"
          accept=".har,application/json"
          onChange={onPick}
          style="display: none;"
        />
      </AppCard>

      {errorCode && (
        <div class="har-error" role="alert" data-testid="error">
          <span class="har-error__icon" aria-hidden="true">
            ⚠
          </span>
          <span data-testid="error-message">{errorText(errorCode)}</span>
        </div>
      )}

      {ready && (
        <div
          class="har-viewer-fs"
          role="dialog"
          aria-modal="true"
          aria-label={t.tableLabel}
          ref={overlayRef}
          tabIndex={-1}
        >
          <div class="har-viewer-fs__inner">
            <div class="har-toolbar">
              <div class="har-meta">
                <span class="har-meta__file" title={ready.fileName} data-testid="file-name">
                  {ready.fileName}
                </span>
                <span class="har-meta__stat">
                  {t.entryCountLabel}:{' '}
                  <strong data-testid="entry-count" class="num">
                    {String(rows.length)}
                  </strong>
                </span>
                <span class="har-meta__stat">
                  {t.durationLabel}:{' '}
                  <strong data-testid="duration" class="num">
                    {formatDurationMs(captureSpanMs)}
                  </strong>
                </span>
                {flaggedCount > 0 && (
                  <span class="har-meta__stat har-meta__stat--flagged" data-testid="flagged-count">
                    <span aria-hidden="true">⚠</span> {t.flaggedCountLabel}:{' '}
                    <strong class="num">{String(flaggedCount)}</strong>
                  </span>
                )}
              </div>
              <button
                type="button"
                class="har-fs-close"
                onClick={reset}
                aria-label={t.close}
                title={t.close}
                data-testid="close-viewer"
              >
                <kbd class="har-fs-close__kbd">ESC</kbd>
                <span class="har-fs-close__x" aria-hidden="true">
                  ×
                </span>
              </button>
            </div>

            {flaggedCount > 0 && (
              <p class="har-secrets-summary" data-testid="secrets-summary">
                <span aria-hidden="true">⚠ </span>
                {t.secretsSummary.replace('{count}', String(flaggedCount))}
              </p>
            )}

            <div class="har-body">
              <div
                class="har-table-scroll"
                ref={scrollRef}
                role="region"
                aria-label={t.tableLabel}
                tabIndex={0}
                onScroll={(e) => setScrollTop((e.currentTarget as HTMLDivElement).scrollTop)}
              >
                <table class="har-table" data-testid="har-table">
                  <thead>
                    <tr>
                      <th class="har-table__flagcol" scope="col">
                        <span class="visually-hidden">{t.colFlag}</span>
                      </th>
                      <th scope="col">{t.colMethod}</th>
                      <th scope="col">{t.colUrl}</th>
                      <th scope="col">{t.colStatus}</th>
                      <th scope="col">{t.colType}</th>
                      <th scope="col">{t.colSize}</th>
                      <th scope="col">{t.colTime}</th>
                      <th scope="col">{t.colWaterfall}</th>
                      <th scope="col">
                        <span class="visually-hidden">{t.colAction}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {win.topPad > 0 && (
                      <tr aria-hidden="true" class="har-table__spacer">
                        <td colSpan={COLUMN_COUNT} style={{ height: `${win.topPad}px` }} />
                      </tr>
                    )}
                    {visible.map((row) => {
                      const { entry, index, secrets } = row;
                      const hasSecret = secrets.length > 0;
                      const isSelected = selectedIndex === index;
                      const wfLabel = describeWaterfall(entry.timings, labels);
                      return (
                        <tr
                          key={index}
                          data-row
                          data-testid="har-row"
                          class={isSelected ? 'har-row is-selected' : 'har-row'}
                        >
                          <td class="har-table__flagcol">
                            {hasSecret && (
                              <span
                                class="har-flag"
                                title={`${t.secretFlagAria}: ${secretKindLabels(
                                  secrets.map((s) => s.kind),
                                  t
                                )}`}
                                data-testid="secret-flag"
                                aria-hidden="true"
                              >
                                ⚠
                              </span>
                            )}
                          </td>
                          <td>
                            <span
                              class={`har-method har-method--${entry.request.method.toLowerCase()}`}
                            >
                              {entry.request.method}
                            </span>
                          </td>
                          <td class="har-table__url" title={entry.request.url}>
                            {entry.request.url}
                          </td>
                          <td>
                            <span class={`har-status har-status--${statusClass(entry.response.status)}`}>
                              {entry.response.status || '–'}
                            </span>
                          </td>
                          <td class="har-table__type" title={entry.response.content.mimeType}>
                            {shortMimeType(entry.response.content.mimeType)}
                          </td>
                          <td class="num">{humanBytes(entry.response.content.size)}</td>
                          <td class="num">{formatDurationMs(entry.time)}</td>
                          <td class="har-table__wf">
                            <WaterfallBar
                              timings={entry.timings}
                              captureSpanMs={captureSpanMs}
                              label={wfLabel}
                            />
                          </td>
                          <td class="har-table__action">
                            <button
                              type="button"
                              class="har-row-btn"
                              aria-expanded={isSelected}
                              aria-controls="har-detail-panel"
                              aria-label={`${t.viewDetailsAction} ${entry.request.method} ${entry.request.url}`}
                              onClick={() => setSelectedIndex(isSelected ? null : index)}
                            >
                              <span aria-hidden="true">{isSelected ? '▾' : '▸'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {win.bottomPad > 0 && (
                      <tr aria-hidden="true" class="har-table__spacer">
                        <td colSpan={COLUMN_COUNT} style={{ height: `${win.bottomPad}px` }} />
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {selectedRow && (
                <EntryDetail
                  row={selectedRow}
                  captureSpanMs={captureSpanMs}
                  t={t}
                  onClose={() => setSelectedIndex(null)}
                  panelRef={(el) => {
                    detailRef.current = el;
                  }}
                />
              )}
            </div>

            <div class="har-actions">
              <AppButton
                variant="secondary"
                onClick={() => document.getElementById('har-file-input')?.click()}
              >
                {t.loadAnother}
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
