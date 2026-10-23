export type QuestionType = 'mcq' | 'fill_blank' | 'match' | 'true_false' | 'ordering' | 'flashcard';

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

export interface TrueFalseQuestion {
  id: string;
  type: 'true_false';
  statement: string;
  /** The correct answer: true means the statement is true. */
  correctAnswer: boolean;
  explanation: string;
  conceptId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  hints?: string[];
}

export interface OrderingQuestion {
  id: string;
  type: 'ordering';
  instruction: string;
  /** Items in the CORRECT order. The UI will shuffle them for display. */
  correctOrder: string[];
  explanation: string;
  conceptId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  hints?: string[];
}

export interface FlashcardQuestion {
  id: string;
  type: 'flashcard';
  /** Front of the card — the prompt. */
  front: string;
  /** Back of the card — the answer/concept. */
  back: string;
  /** After the user self-reports, show this explanation. */
  explanation: string;
  conceptId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  hints?: string[];
}

export type QuizQuestion =
  | MCQQuestion
  | FillBlankQuestion
  | MatchQuestion
  | TrueFalseQuestion
  | OrderingQuestion
  | FlashcardQuestion;

export interface QuizLesson {
  id: string;
  title: string;
  pointsAwarded: number;
  questions: QuizQuestion[];
}
