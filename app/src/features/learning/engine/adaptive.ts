import type { QuizQuestion } from '../types/quiz.types';
import type { MasteryMap } from './mastery';
import type { AttemptRecord, Difficulty, PoolQuestion } from './types';

const ORDER: Difficulty[] = ['easy', 'medium', 'hard'];
const WINDOW = 4;

export function conceptOf(lessonId: string, q: QuizQuestion): string {
  return q.conceptId ?? lessonId;
}

/** Step up after a clean run, step down after a rough one, otherwise hold. */
export function nextDifficulty(
  current: Difficulty,
  recent: Pick<AttemptRecord, 'correct' | 'hintsUsed'>[],
): Difficulty {
  const last = recent.slice(-WINDOW);
  if (last.length < 3) return current;
  const accuracy = last.filter((a) => a.correct).length / last.length;
  const hints = last.reduce((n, a) => n + a.hintsUsed, 0);
  const i = ORDER.indexOf(current);
  if (accuracy >= 0.75 && hints === 0) return ORDER[Math.min(i + 1, ORDER.length - 1)];
  if (accuracy <= 0.4) return ORDER[Math.max(i - 1, 0)];
  return current;
}

/** Deterministic pick: closest difficulty first, then weakest concept first. */
export function selectQuestions(
  pool: PoolQuestion[],
  target: Difficulty,
  count: number,
  mastery: MasteryMap,
): PoolQuestion[] {
  const t = ORDER.indexOf(target);
  const rank = (p: PoolQuestion) => {
    const d = Math.abs(ORDER.indexOf(p.question.difficulty ?? 'medium') - t);
    const m = mastery[conceptOf(p.lessonId, p.question)]?.mastery ?? 0.5;
    return d * 10 + m;
  };
  return [...pool].sort((a, b) => rank(a) - rank(b)).slice(0, count);
}
