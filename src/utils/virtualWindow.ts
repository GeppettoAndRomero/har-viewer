/**
 * Windowed-rendering math for the table.
 *
 * Pure function: given the current scroll position and viewport, it returns the
 * slice of rows to actually render plus the top/bottom spacer heights that keep
 * the scrollbar the size of the full data set. This is what lets a file with
 * tens of thousands of rows render only the ~dozen rows on screen.
 */

export interface WindowInput {
  /** Current scrollTop of the scroll container, in px. */
  scrollTop: number;
  /** Visible height of the scroll container, in px. */
  viewportHeight: number;
  /** Fixed height of a single rendered row, in px. */
  rowHeight: number;
  /** Total number of data rows. */
  rowCount: number;
  /** Extra rows rendered above/below the viewport to avoid flicker on scroll. */
  overscan?: number;
}

export interface WindowResult {
  /** First row index to render (inclusive). */
  startIndex: number;
  /** Last row index to render (exclusive). */
  endIndex: number;
  /** Spacer height above the rendered rows, in px. */
  topPad: number;
  /** Spacer height below the rendered rows, in px. */
  bottomPad: number;
  /** Full scroll height of all rows, in px. */
  totalHeight: number;
}

/**
 * Compute the visible row window. Clamped so indices stay within
 * `[0, rowCount]` and the pads never go negative, regardless of scroll position.
 */
export function computeWindow({
  scrollTop,
  viewportHeight,
  rowHeight,
  rowCount,
  overscan = 6,
}: WindowInput): WindowResult {
  const safeRowHeight = rowHeight > 0 ? rowHeight : 1;
  const totalHeight = rowCount * safeRowHeight;

  if (rowCount <= 0) {
    return { startIndex: 0, endIndex: 0, topPad: 0, bottomPad: 0, totalHeight: 0 };
  }

  const clampedScroll = Math.max(0, Math.min(scrollTop, totalHeight));
  const firstVisible = Math.floor(clampedScroll / safeRowHeight);
  const visibleCount = Math.ceil(viewportHeight / safeRowHeight);

  const startIndex = Math.max(0, firstVisible - overscan);
  const endIndex = Math.min(rowCount, firstVisible + visibleCount + overscan);

  return {
    startIndex,
    endIndex,
    topPad: startIndex * safeRowHeight,
    bottomPad: (rowCount - endIndex) * safeRowHeight,
    totalHeight,
  };
}
