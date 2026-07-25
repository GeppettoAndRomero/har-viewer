/**
 * Waterfall bar math — no charting library, just proportions.
 *
 * Each of the six HAR timing phases (blocked/dns/connect/send/wait/receive — `ssl` is
 * deliberately excluded: per the HAR spec it is already included inside `connect`, so
 * stacking it too would double-count) becomes one stacked div segment. Segment widths
 * are a percentage of the *whole capture's* wall-clock span (see
 * `computeCaptureSpanMs` in `harParse.ts`), not of the request's own time — so a
 * request that accounted for a large share of the whole session draws a long bar, and a
 * quick one draws a short bar, comparable at a glance across every row.
 */

import type { HarTimings } from './harParse';

export const WATERFALL_PHASES = ['blocked', 'dns', 'connect', 'send', 'wait', 'receive'] as const;
export type WaterfallPhase = (typeof WATERFALL_PHASES)[number];

export interface WaterfallSegment {
  phase: WaterfallPhase;
  ms: number;
  /** Width as a percentage of the capture span (>= 0; not clamped individually). */
  pct: number;
}

export interface WaterfallResult {
  segments: WaterfallSegment[];
  /** Total bar width (sum of segment pct), clamped to [0, 100]. */
  totalPct: number;
}

/** A phase value of `-1` or absent means "not measured / not applicable" (HAR spec) —
 *  treated as zero contribution, never as negative width. */
function phaseMs(raw: number | undefined): number {
  return typeof raw === 'number' && raw > 0 ? raw : 0;
}

export function computeWaterfall(timings: HarTimings, captureSpanMs: number): WaterfallResult {
  const span = captureSpanMs > 0 ? captureSpanMs : 1;
  const segments: WaterfallSegment[] = WATERFALL_PHASES.map((phase) => {
    const ms = phaseMs(timings[phase]);
    return { phase, ms, pct: (ms / span) * 100 };
  });
  const totalPct = Math.min(100, segments.reduce((sum, s) => sum + s.pct, 0));
  return { segments, totalPct };
}

/** A textual, phase-by-phase breakdown ("blocked 1 ms, dns 4 ms, ...") for use as the
 *  bar's accessible name/tooltip — a bar's meaning must not rely on color alone. */
export function describeWaterfall(
  timings: HarTimings,
  labels: Record<WaterfallPhase, string>
): string {
  return WATERFALL_PHASES.map((phase) => {
    const raw = timings[phase];
    const text = typeof raw === 'number' && raw >= 0 ? `${Math.round(raw)} ms` : '–';
    return `${labels[phase]} ${text}`;
  }).join(', ');
}
