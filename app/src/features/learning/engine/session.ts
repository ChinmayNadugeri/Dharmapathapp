import type { QuizQuestion } from '../types/quiz.types';
import { evaluateAnswer } from './evaluate';
import { MAX_HINT_LEVEL } from './hints';
import type { Answer, AttemptRecord, Evaluation } from './types';

export const PASS_THRESHOLD = 0.6;

export interface SessionState {
  lessonId: string;
  questions: QuizQuestion[];
  /** Question ids in presentation order; wrong first attempts are appended once for retry. */
  queue: string[];
  position: number;
  phase: 'answering' | 'feedback' | 'complete';
  hintLevel: number;
  shownAt: number;
  lastEvaluation?: Evaluation;
  attempts: AttemptRecord[];
}

export type SessionAction =
  | { type: 'ANSWER'; answer: Answer; now: number }
  | { type: 'HINT' }
  | { type: 'NEXT'; now: number };

export interface SessionSummary {
  total: number;
  firstTryCorrect: number;
  /** Based on first attempts only, so retries cannot inflate it. */
  accuracy: number;
  hintsUsed: number;
  retried: string[];
  passed: boolean;
}

export function createSession(
  lessonId: string,
  questions: QuizQuestion[],
  now: number,
): SessionState {
  return {
    lessonId,
    questions,
    queue: questions.map((q) => q.id),
    position: 0,
    phase: questions.length === 0 ? 'complete' : 'answering',
    hintLevel: 0,
    shownAt: now,
    attempts: [],
  };
}

export function currentQuestion(state: SessionState): QuizQuestion | undefined {
  const id = state.queue[state.position];
  return state.questions.find((q) => q.id === id);
}

export function sessionReducer(
  state: SessionState,
  action: SessionAction,
  conceptOf: (q: QuizQuestion) => string = () => state.lessonId,
): SessionState {
  const question = currentQuestion(state);
  if (!question) return state;

  switch (action.type) {
    case 'HINT':
      if (state.phase !== 'answering') return state;
      return { ...state, hintLevel: Math.min(state.hintLevel + 1, MAX_HINT_LEVEL) };

    case 'ANSWER': {
      // Duplicate or late submissions are ignored.
      if (state.phase !== 'answering') return state;
      const evaluation = evaluateAnswer(question, action.answer);
      const attemptNumber = state.attempts.filter((a) => a.questionId === question.id).length + 1;
      const attempt: AttemptRecord = {
        questionId: question.id,
        conceptId: conceptOf(question),
        correct: evaluation.correct,
        score: evaluation.score,
        hintsUsed: state.hintLevel,
        responseMs: Math.max(0, action.now - state.shownAt),
        attemptNumber,
        at: action.now,
      };
      const needsRetry = !evaluation.correct && attemptNumber === 1;
      return {
        ...state,
        phase: 'feedback',
        lastEvaluation: evaluation,
        attempts: [...state.attempts, attempt],
        queue: needsRetry ? [...state.queue, question.id] : state.queue,
      };
    }

    case 'NEXT': {
      if (state.phase !== 'feedback') return state;
      const position = state.position + 1;
      if (position >= state.queue.length) {
        return { ...state, position: state.queue.length - 1, phase: 'complete', lastEvaluation: undefined };
      }
      return {
        ...state,
        position,
        phase: 'answering',
        hintLevel: 0,
        shownAt: action.now,
        lastEvaluation: undefined,
      };
    }
  }
}

export function summarizeSession(state: SessionState): SessionSummary {
  const first = state.attempts.filter((a) => a.attemptNumber === 1);
  const firstTryCorrect = first.filter((a) => a.correct).length;
  const total = state.questions.length;
  const accuracy = total === 0 ? 0 : firstTryCorrect / total;
  return {
    total,
    firstTryCorrect,
    accuracy,
    hintsUsed: state.attempts.reduce((n, a) => n + a.hintsUsed, 0),
    retried: state.attempts.filter((a) => a.attemptNumber === 2).map((a) => a.questionId),
    passed: total > 0 && accuracy >= PASS_THRESHOLD,
  };
}
