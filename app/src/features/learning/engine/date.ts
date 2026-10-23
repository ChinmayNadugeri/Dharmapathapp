/** Local-calendar date keys (YYYY-MM-DD). Never uses UTC, so IST users get the right day. */
export function toLocalDateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  return toLocalDateKey(new Date(y, m - 1, d + days));
}
