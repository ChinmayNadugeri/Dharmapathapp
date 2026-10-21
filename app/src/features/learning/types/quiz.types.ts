export type QuestionType = 'mcq' | 'fill_blank' | 'match';

export interface AnswerResult {
  correct: boolean;
  questionId: string;
}

export interface MCQQuestion {
  id: string;
  type: 'mcq';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  /** Concept this question tests; engine falls back to the lesson id. */
  conceptId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  /** Progressive hints, shown one at a time. */
  hints?: string[];
}

export interface FillBlankQuestion {
  id: string;
  type: 'fill_blank';
  question: string;
  acceptedAnswers: string[];
  explanation: string;
  /** Concept this question tests; engine falls back to the lesson id. */
  conceptId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  /** Progressive hints, shown one at a time. */
  hints?: string[];
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface MatchQuestion {
  id: string;
  type: 'match';
  pairs: MatchPair[];
  explanation: string;
  /** Concept this question tests; engine falls back to the lesson id. */
  conceptId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  /** Progressive hints, shown one at a time. */
  hints?: string[];
}

export type QuizQuestion = MCQQuestion | FillBlankQuestion | MatchQuestion;

export interface QuizLesson {
  id: string;
  title: string;
  pointsAwarded: number;
  questions: QuizQuestion[];
}
