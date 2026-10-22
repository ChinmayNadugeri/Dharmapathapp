import type { QuizQuestion } from '../types/quiz.types';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Answer =
  | { type: 'mcq'; selectedIndex: number }
  | { type: 'fill_blank'; text: string }
  | { type: 'match'; pairs: { left: string; right: string }[] }
  | { type: 'true_false'; selected: boolean }
  | { type: 'ordering'; order: string[] }
  | { type: 'flashcard'; selfReportedCorrect: boolean };

export interface Evaluation {
  questionId: string;
  correct: boolean;
  /** 0..1. Only match and ordering questions give partial credit. */
  score: number;
  explanation: string;
  /** Shown after evaluation only; never before. */
  expected?: string;
}

export interface AttemptRecord {
  questionId: string;
  conceptId: string;
  correct: boolean;
  score: number;
  hintsUsed: number;
  responseMs: number;
  /** 1 for the first time the question is shown in a session, 2 for the remediation retry. */
  attemptNumber: number;
  at: number;
}

export interface PoolQuestion {
  lessonId: string;
  question: QuizQuestion;
}
