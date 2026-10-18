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
}

export interface FillBlankQuestion {
  id: string;
  type: 'fill_blank';
  question: string;
  acceptedAnswers: string[];
  explanation: string;
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
}

export type QuizQuestion = MCQQuestion | FillBlankQuestion | MatchQuestion;

export interface QuizLesson {
  id: string;
  title: string;
  pointsAwarded: number;
  questions: QuizQuestion[];
}
