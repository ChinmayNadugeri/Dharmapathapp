import React from 'react';
import { View } from 'react-native';
import type { QuizQuestion } from '../types/quiz.types';
import type { Answer } from '../engine/types';
import { MCQQuestion } from './MCQQuestion';
import { FillBlankQuestion } from './FillBlankQuestion';
import { MatchQuestion } from './MatchQuestion';
import { TrueFalseQuestion } from './TrueFalseQuestion';
import { OrderingQuestion } from './OrderingQuestion';
import { FlashcardQuestion } from './FlashcardQuestion';

interface ExerciseRendererProps {
  question: QuizQuestion;
  onAnswerSubmit: (answer: Answer) => void;
  disabled?: boolean;
  eliminatedOptions?: number[];
  showInlineFeedback?: boolean;
}

export const ExerciseRenderer: React.FC<ExerciseRendererProps> = ({
  question,
  onAnswerSubmit,
  disabled = false,
  eliminatedOptions,
  showInlineFeedback = false,
}) => {
  return (
    <View key={question.id}>
      {(() => {
        switch (question.type) {
          case 'mcq':
            return (
              <MCQQuestion
                question={question}
                onAnswerSubmit={onAnswerSubmit}
                disabled={disabled}
                eliminatedOptions={eliminatedOptions}
                showInlineFeedback={showInlineFeedback}
              />
            );
          case 'fill_blank':
            return (
              <FillBlankQuestion
                question={question}
                onAnswerSubmit={onAnswerSubmit}
                disabled={disabled}
                showInlineFeedback={showInlineFeedback}
              />
            );
          case 'match':
            return (
              <MatchQuestion
                question={question}
                onAnswerSubmit={onAnswerSubmit}
                disabled={disabled}
                showInlineFeedback={showInlineFeedback}
              />
            );
          case 'true_false':
            return (
              <TrueFalseQuestion
                question={question}
                onAnswer={onAnswerSubmit}
                disabled={disabled}
              />
            );
          case 'ordering':
            return (
              <OrderingQuestion
                question={question}
                onAnswer={onAnswerSubmit}
                disabled={disabled}
              />
            );
          case 'flashcard':
            return (
              <FlashcardQuestion
                question={question}
                onAnswer={onAnswerSubmit}
                disabled={disabled}
              />
            );
        }
      })()}
    </View>
  );
};
