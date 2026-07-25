import { describe, it, expect } from 'vitest';
import { computeWaterfall, describeWaterfall, WATERFALL_PHASES } from '@/utils/waterfall';
import type { HarTimings } from '@/utils/harParse';

describe('computeWaterfall', () => {
  it('sizes each phase as a percentage of the capture span, not the entry\'s own time', () => {
    const timings: HarTimings = { blocked: 10, dns: 0, connect: 0, send: 5, wait: 80, receive: 5 };
    // Entry's own total is 100ms, but the capture spans 1000ms — segments should be
    // sized against the 1000ms span (1%, 0%, 0%, 0.5%, 8%, 0.5%), not against 100ms.
    const { segments, totalPct } = computeWaterfall(timings, 1000);
    const blocked = segments.find((s) => s.phase === 'blocked')!;
    const wait = segments.find((s) => s.phase === 'wait')!;
    expect(blocked.pct).toBeCloseTo(1, 5); // 10 / 1000 * 100
    expect(wait.pct).toBeCloseTo(8, 5); // 80 / 1000 * 100
    expect(totalPct).toBeCloseTo(10, 5); // 100 / 1000 * 100
  });

  it('excludes ssl from the stack (it is already inside connect per the HAR spec)', () => {
    const timings: HarTimings = { send: 0, wait: 0, receive: 0, connect: 50, ssl: 30 };
    const { segments } = computeWaterfall(timings, 100);
    expect(segments.map((s) => s.phase)).toEqual([...WATERFALL_PHASES]);
    expect(segments.find((s) => s.phase === 'connect')!.ms).toBe(50);
  });

  it('treats -1 (not applicable) and absent phases as zero contribution', () => {
    const timings: HarTimings = { blocked: -1, send: 0, wait: 0, receive: 0 };
    const { segments } = computeWaterfall(timings, 100);
    expect(segments.find((s) => s.phase === 'blocked')!.ms).toBe(0);
    expect(segments.find((s) => s.phase === 'dns')!.ms).toBe(0); // absent from `timings`
  });

  it('clamps totalPct to 100 even if the entry outlasts the given span (defensive)', () => {
    const timings: HarTimings = { send: 0, wait: 2000, receive: 0 };
    const { totalPct } = computeWaterfall(timings, 100);
    expect(totalPct).toBe(100);
  });

  it('never divides by zero when the capture span is 0', () => {
    const timings: HarTimings = { send: 1, wait: 1, receive: 1 };
    const { segments } = computeWaterfall(timings, 0);
    expect(segments.every((s) => Number.isFinite(s.pct))).toBe(true);
  });
});

describe('describeWaterfall', () => {
  const labels = {
    blocked: 'Blocked',
    dns: 'DNS',
    connect: 'Connect',
    send: 'Send',
    wait: 'Wait',
    receive: 'Receive',
  };

  it('describes every phase with its millisecond value', () => {
    const timings: HarTimings = { blocked: 1, dns: 2, connect: 3, send: 4, wait: 5, receive: 6 };
    expect(describeWaterfall(timings, labels)).toBe(
      'Blocked 1 ms, DNS 2 ms, Connect 3 ms, Send 4 ms, Wait 5 ms, Receive 6 ms'
    );
  });

  it('shows an en-dash for a phase that was not measured', () => {
    const timings: HarTimings = { send: 0, wait: 0, receive: 0 }; // blocked/dns/connect absent
    const text = describeWaterfall(timings, labels);
    expect(text).toContain('Blocked –');
    expect(text).toContain('DNS –');
  });
});
