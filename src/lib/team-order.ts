/** Move `movingId` to `targetIndex` and close the gap left behind. */
export function reorderIds(ids: string[], movingId: string, targetIndex: number): string[] | null {
  const from = ids.indexOf(movingId);
  if (from < 0) return null;

  const next = ids.filter((id) => id !== movingId);
  const index = Math.min(Math.max(targetIndex, 0), next.length);
  next.splice(index, 0, movingId);
  return next;
}
