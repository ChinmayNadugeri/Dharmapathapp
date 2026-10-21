import { addDays } from './date';

/** Leitner boxes: days until the next review for boxes 1..5. */
export const LEITNER_INTERVAL_DAYS = [1, 2, 4, 8, 16] as const;

export interface ReviewItem {
  id: string;
  box: number;
  /** Local YYYY-MM-DD. */
  dueDate: string;
}

export function scheduleReview(
  existing: ReviewItem | undefined,
  id: string,
  correct: boolean,
  todayKey: string,
): ReviewItem {
  const box = correct ? Math.min((existing?.box ?? 1) + 1, LEITNER_INTERVAL_DAYS.length) : 1;
  return { id, box, dueDate: addDays(todayKey, LEITNER_INTERVAL_DAYS[box - 1]) };
}

export function dueItems(items: ReviewItem[], todayKey: string): ReviewItem[] {
  return items
    .filter((i) => i.dueDate <= todayKey)
    .sort((a, b) => (a.dueDate === b.dueDate ? a.box - b.box : a.dueDate < b.dueDate ? -1 : 1));
}
