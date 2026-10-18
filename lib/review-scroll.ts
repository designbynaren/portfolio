/** Keep an infinite column inside its middle copy, preserving the visual position. */
export function wrapReviewScroll(position: number, groupHeight: number): number {
  if (groupHeight <= 0) return 0;
  return groupHeight + ((position % groupHeight) + groupHeight) % groupHeight;
}
