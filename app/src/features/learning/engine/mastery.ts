import type { AttemptRecord } from './types';

export const INITIAL_MASTERY = 0.5;
const ALPHA = 0.3;
const HINT_PENALTY = 0.25;

export interface ConceptMastery {
  conceptId: string;
  /** 0..1 exponentially weighted estimate. */
  mastery: number;
  attempts: number;
  correct: number;
  consecutiveMistakes: number;
  lastSeen: number;
}

export type MasteryMap = Record<string, ConceptMastery>;

/** Hints reduce how much a correct answer counts as evidence of mastery. */
export function effectiveScore(a: Pick<AttemptRecord, 'score' | 'hintsUsed'>): number {
  return Math.max(0, a.score * (1 - HINT_PENALTY * a.hintsUsed));
}

export function applyAttempt(map: MasteryMap, attempt: AttemptRecord): MasteryMap {
  const prev = map[attempt.conceptId] ?? {
    conceptId: attempt.conceptId,
    mastery: INITIAL_MASTERY,
    attempts: 0,
    correct: 0,
    consecutiveMistakes: 0,
    lastSeen: 0,
  };
  const mastery = prev.mastery + ALPHA * (effectiveScore(attempt) - prev.mastery);
  return {
    ...map,
    [attempt.conceptId]: {
      ...prev,
      mastery,
      attempts: prev.attempts + 1,
      correct: prev.correct + (attempt.correct ? 1 : 0),
      consecutiveMistakes: attempt.correct ? 0 : prev.consecutiveMistakes + 1,
      lastSeen: attempt.at,
    },
  };
}

export function applyAttempts(map: MasteryMap, attempts: AttemptRecord[]): MasteryMap {
  return attempts.reduce(applyAttempt, map);
}

export function findWeakConcepts(
  map: MasteryMap,
  opts: { threshold?: number; minAttempts?: number } = {},
): ConceptMastery[] {
  const { threshold = 0.5, minAttempts = 2 } = opts;
  return Object.values(map)
    .filter((c) => (c.mastery < threshold && c.attempts >= minAttempts) || c.consecutiveMistakes >= 2)
    .sort((a, b) => a.mastery - b.mastery);
}
