/**
 * WaterfallBar — a plain div/CSS stacked bar for one HAR entry's timing phases.
 * No charting library; see src/utils/waterfall.ts for the underlying proportions.
 */

import { computeWaterfall } from '@/utils/waterfall';
import type { HarTimings } from '@/utils/harParse';

interface WaterfallBarProps {
  timings: HarTimings;
  captureSpanMs: number;
  /** Accessible description of the bar (phase-by-phase breakdown), e.g.
   *  "blocked 1 ms, dns 4 ms, connect 12 ms, send 0 ms, wait 80 ms, receive 3 ms". */
  label: string;
}

export function WaterfallBar({ timings, captureSpanMs, label }: WaterfallBarProps) {
  const { segments } = computeWaterfall(timings, captureSpanMs);
  return (
    <div class="har-wf" role="img" aria-label={label} title={label} data-testid="waterfall-bar">
      {segments.map((s) =>
        s.pct > 0 ? (
          <span
            key={s.phase}
            class={`har-wf__seg har-wf__seg--${s.phase}`}
            style={{ width: `${Math.min(100, s.pct)}%` }}
          />
        ) : null
      )}
    </div>
  );
}
