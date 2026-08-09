/**
 * Convert total seconds to "m:ss" format.
 */
export function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = String(Math.floor(secs % 60)).padStart(2, '0');
  return `${m}:${s}`;
}
