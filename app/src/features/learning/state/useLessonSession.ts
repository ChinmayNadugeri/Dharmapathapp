import { useState, useEffect, useCallback, useRef } from 'react';
import type { QuizLesson, QuizQuestion } from '../types/quiz.types';
import type { Answer, Evaluation } from '../engine/types';
import {
  createSession,
  currentQuestion,
  sessionReducer,
  summarizeSession,
  type SessionState,
  type SessionSummary,
} from '../engine/session';
import { getHint, type Hint } from '../engine/hints';
import { applyAttempt } from '../engine/mastery';
import { scheduleReview, type ReviewItem } from '../engine/spaced';
import { nextDifficulty } from '../engine/adaptive';
import { toLocalDateKey } from '../engine/date';
import { useLearnerState } from './useLearnerState';

export interface UseLessonSessionOptions {
  lesson: QuizLesson;
  onLessonComplete?: (summary: SessionSummary, earnedXp: number) => void;
}

export interface UseLessonSessionReturn {
  session: SessionState;
  currentQ?: QuizQuestion;
  currentHint?: Hint;
  isAnswering: boolean;
  isFeedback: boolean;
  isComplete: boolean;
  lastEvaluation?: Evaluation;
  summary?: SessionSummary;
  progressPercent: number;
  totalUniqueQuestions: number;
  currentUniqueIndex: number;
  eliminatedOptions?: number[];
  submitAnswer: (answer: Answer) => void;
  requestHint: () => void;
  nextQuestion: () => void;
  resetSession: () => void;
}

export function useLessonSession({
  lesson,
  onLessonComplete,
}: UseLessonSessionOptions): UseLessonSessionReturn {
  const {
    learnerState,
    updateLearnerState,
    saveSessionSnapshot,
    clearSessionSnapshot,
    getSessionSnapshot,
  } = useLearnerState();

  const [session, setSession] = useState<SessionState>(() => {
    const existing = getSessionSnapshot(lesson.id);
    if (existing && existing.phase !== 'complete') {
      return existing;
    }
    return createSession(lesson.id, lesson.questions, Date.now());
  });

  const [currentHint, setCurrentHint] = useState<Hint | undefined>(undefined);
  const onCompleteRef = useRef(onLessonComplete);
  onCompleteRef.current = onLessonComplete;

  // Persist session snapshot whenever it changes
  useEffect(() => {
    if (session.phase === 'complete') {
      clearSessionSnapshot(lesson.id);
    } else {
      saveSessionSnapshot(lesson.id, session);
    }
  }, [session, lesson.id, clearSessionSnapshot, saveSessionSnapshot]);

  const activeQuestion = currentQuestion(session);

  // Update hint when hintLevel changes or question advances
  useEffect(() => {
    if (!activeQuestion || session.hintLevel === 0) {
      setCurrentHint(undefined);
    } else {
      setCurrentHint(getHint(activeQuestion, session.hintLevel));
    }
  }, [activeQuestion, session.hintLevel]);

  const requestHint = useCallback(() => {
    setSession((prev) => sessionReducer(prev, { type: 'HINT' }));
  }, []);

  const submitAnswer = useCallback(
    (answer: Answer) => {
      const now = Date.now();
      setSession((prev) => {
        const next = sessionReducer(
          prev,
          { type: 'ANSWER', answer, now },
          (q) => q.conceptId || lesson.id,
        );

        // Update mastery immediately in real-time
        const lastAttempt = next.attempts[next.attempts.length - 1];
        if (lastAttempt) {
          updateLearnerState((learner) => ({
            ...learner,
            mastery: applyAttempt(learner.mastery, lastAttempt),
          }));
        }

        return next;
      });
    },
    [lesson.id, updateLearnerState],
  );

  const nextQuestion = useCallback(() => {
    const now = Date.now();
    setSession((prev) => {
      const next = sessionReducer(prev, { type: 'NEXT', now });

      if (next.phase === 'complete') {
        const summary = summarizeSession(next);
        const earnedXp = summary.passed ? lesson.pointsAwarded : Math.round(lesson.pointsAwarded * 0.4);
        const todayKey = toLocalDateKey(new Date(now));

        // Update spaced repetition schedule, difficulty, and history in learner state
        updateLearnerState((learner) => {
          let updatedReviews: ReviewItem[] = [...learner.reviews];
          for (const attempt of next.attempts) {
            const existingIdx = updatedReviews.findIndex((r) => r.id === attempt.questionId);
            const existingItem = existingIdx >= 0 ? updatedReviews[existingIdx] : undefined;
            const scheduled = scheduleReview(existingItem, attempt.questionId, attempt.correct, todayKey);
            if (existingIdx >= 0) {
              updatedReviews[existingIdx] = scheduled;
            } else {
              updatedReviews.push(scheduled);
            }
          }

          const newDifficulty = nextDifficulty(learner.currentDifficulty, next.attempts);

          return {
            ...learner,
            reviews: updatedReviews,
            currentDifficulty: newDifficulty,
            lessonHistory: [
              ...learner.lessonHistory,
              {
                lessonId: lesson.id,
                completedAt: now,
                accuracy: summary.accuracy,
                hintsUsed: summary.hintsUsed,
                difficulty: newDifficulty,
              },
            ],
          };
        });

        if (onCompleteRef.current) {
          onCompleteRef.current(summary, earnedXp);
        }
      }

      return next;
    });
  }, [lesson, updateLearnerState]);

  const resetSession = useCallback(() => {
    clearSessionSnapshot(lesson.id);
    setSession(createSession(lesson.id, lesson.questions, Date.now()));
    setCurrentHint(undefined);
  }, [lesson, clearSessionSnapshot]);

  // Derived metrics
  const totalUnique = lesson.questions.length;
  const currentUniqueIndex = Math.min(session.position, session.queue.length);
  const progressPercent = session.queue.length > 0
    ? Math.min(100, Math.round(((session.position + (session.phase === 'complete' ? 1 : 0)) / session.queue.length) * 100))
    : 0;

  const eliminatedOptions =
    activeQuestion?.type === 'mcq' && currentHint?.eliminatedOptions
      ? currentHint.eliminatedOptions
      : undefined;

  return {
    session,
    currentQ: activeQuestion,
    currentHint,
    isAnswering: session.phase === 'answering',
    isFeedback: session.phase === 'feedback',
    isComplete: session.phase === 'complete',
    lastEvaluation: session.lastEvaluation,
    summary: session.phase === 'complete' ? summarizeSession(session) : undefined,
    progressPercent,
    totalUniqueQuestions: totalUnique,
    currentUniqueIndex,
    eliminatedOptions,
    submitAnswer,
    requestHint,
    nextQuestion,
    resetSession,
  };
}
