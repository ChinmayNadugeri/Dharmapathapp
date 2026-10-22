/**
 * useLearnerState — persisted adaptive learning state using AsyncStorage.
 *
 * Stores: concept mastery map, spaced repetition review schedule,
 * mid-lesson session snapshots, and lesson history entries.
 *
 * Every write is debounced (fire-and-forget) so the UI never blocks on I/O.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MasteryMap } from '../engine/mastery';
import type { ReviewItem } from '../engine/spaced';
import type { SessionState } from '../engine/session';

const STORAGE_KEY = 'dharmapath_learner_state';

export interface LessonHistoryEntry {
  lessonId: string;
  completedAt: number;
  accuracy: number;
  hintsUsed: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface LearnerState {
  mastery: MasteryMap;
  reviews: ReviewItem[];
  sessionSnapshots: Record<string, SessionState>;
  lessonHistory: LessonHistoryEntry[];
  /** Current adaptive difficulty level. */
  currentDifficulty: 'easy' | 'medium' | 'hard';
}

const DEFAULT_LEARNER_STATE: LearnerState = {
  mastery: {},
  reviews: [],
  sessionSnapshots: {},
  lessonHistory: [],
  currentDifficulty: 'medium',
};

export interface UseLearnerStateReturn {
  learnerState: LearnerState;
  isLoading: boolean;
  updateLearnerState: (updater: (prev: LearnerState) => LearnerState) => void;
  saveSessionSnapshot: (lessonId: string, session: SessionState) => void;
  clearSessionSnapshot: (lessonId: string) => void;
  getSessionSnapshot: (lessonId: string) => SessionState | undefined;
}

export function useLearnerState(): UseLearnerStateReturn {
  const [state, setState] = useState<LearnerState>(DEFAULT_LEARNER_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Load from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const saved = JSON.parse(raw) as Partial<LearnerState>;
            setState({ ...DEFAULT_LEARNER_STATE, ...saved });
          } catch {
            // Corrupted data — use defaults
          }
        }
      })
      .catch(() => {
        // Storage unavailable — use defaults silently
      })
      .finally(() => setIsLoading(false));
  }, []);

  const persist = useCallback((updated: LearnerState) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  }, []);

  const updateLearnerState = useCallback(
    (updater: (prev: LearnerState) => LearnerState) => {
      setState((prev) => {
        const updated = updater(prev);
        persist(updated);
        return updated;
      });
    },
    [persist],
  );

  const saveSessionSnapshot = useCallback(
    (lessonId: string, session: SessionState) => {
      updateLearnerState((prev) => ({
        ...prev,
        sessionSnapshots: { ...prev.sessionSnapshots, [lessonId]: session },
      }));
    },
    [updateLearnerState],
  );

  const clearSessionSnapshot = useCallback(
    (lessonId: string) => {
      updateLearnerState((prev) => {
        const { [lessonId]: _, ...rest } = prev.sessionSnapshots;
        return { ...prev, sessionSnapshots: rest };
      });
    },
    [updateLearnerState],
  );

  const getSessionSnapshot = useCallback(
    (lessonId: string): SessionState | undefined => {
      return stateRef.current.sessionSnapshots[lessonId];
    },
    [],
  );

  return {
    learnerState: state,
    isLoading,
    updateLearnerState,
    saveSessionSnapshot,
    clearSessionSnapshot,
    getSessionSnapshot,
  };
}
