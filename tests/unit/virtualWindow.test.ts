import { describe, it, expect } from 'vitest';
import { computeWindow } from '@/utils/virtualWindow';

describe('computeWindow', () => {
  it('returns an empty window with no rows', () => {
    expect(
      computeWindow({ scrollTop: 0, viewportHeight: 400, rowHeight: 34, rowCount: 0 })
    ).toEqual({ startIndex: 0, endIndex: 0, topPad: 0, bottomPad: 0, totalHeight: 0 });
  });

  it('starts at 0 (minus nothing) when scrolled to the top', () => {
    const w = computeWindow({
      scrollTop: 0,
      viewportHeight: 340,
      rowHeight: 34,
      rowCount: 1000,
      overscan: 0,
    });
    expect(w.startIndex).toBe(0);
    expect(w.endIndex).toBe(10); // ceil(340/34) = 10 visible
    expect(w.topPad).toBe(0);
    expect(w.bottomPad).toBe((1000 - 10) * 34);
    expect(w.totalHeight).toBe(1000 * 34);
  });

  it('renders a window around the scroll position with overscan', () => {
    const w = computeWindow({
      scrollTop: 3400, // row 100
      viewportHeight: 340,
      rowHeight: 34,
      rowCount: 1000,
      overscan: 5,
    });
    expect(w.startIndex).toBe(95); // 100 - 5
    expect(w.endIndex).toBe(115); // 100 + 10 + 5
    expect(w.topPad).toBe(95 * 34);
    expect(w.bottomPad).toBe((1000 - 115) * 34);
  });

  it('clamps the window to the data bounds at the very bottom', () => {
    const w = computeWindow({
      scrollTop: 1_000_000,
      viewportHeight: 340,
      rowHeight: 34,
      rowCount: 50,
      overscan: 5,
    });
    expect(w.startIndex).toBeGreaterThanOrEqual(0);
    expect(w.endIndex).toBe(50);
    expect(w.bottomPad).toBe(0);
    expect(w.topPad).toBeGreaterThanOrEqual(0);
  });

  it('never produces negative pads for a negative scrollTop', () => {
    const w = computeWindow({
      scrollTop: -200,
      viewportHeight: 340,
      rowHeight: 34,
      rowCount: 100,
    });
    expect(w.startIndex).toBe(0);
    expect(w.topPad).toBe(0);
    expect(w.bottomPad).toBeGreaterThanOrEqual(0);
  });

  it('covers the whole set when the viewport is taller than the data', () => {
    const w = computeWindow({
      scrollTop: 0,
      viewportHeight: 5000,
      rowHeight: 34,
      rowCount: 20,
    });
    expect(w.startIndex).toBe(0);
    expect(w.endIndex).toBe(20);
    expect(w.topPad).toBe(0);
    expect(w.bottomPad).toBe(0);
  });
});
