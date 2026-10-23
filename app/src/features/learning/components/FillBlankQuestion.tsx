import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { HomeColors } from '@/features/home/constants/homeTheme';
import type { AnswerResult, FillBlankQuestion as FillBlankQuestionData } from '../types/quiz.types';
import type { Answer } from '../engine/types';

interface FillBlankQuestionProps {
  question: FillBlankQuestionData;
  onAnswer?: (result: AnswerResult) => void;
  onAnswerSubmit?: (answer: Answer) => void;
  disabled?: boolean;
  showInlineFeedback?: boolean;
}

export const FillBlankQuestion: React.FC<FillBlankQuestionProps> = ({
  question,
  onAnswer,
  onAnswerSubmit,
  disabled = false,
  showInlineFeedback = true,
}) => {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const normalizedAnswers = question.acceptedAnswers.map((item) => item.trim().toLowerCase());
  const isCorrect = normalizedAnswers.includes(answer.trim().toLowerCase());

  const handleSubmit = () => {
    if (disabled || submitted || !answer.trim()) return;
    setSubmitted(true);
    if (onAnswerSubmit) {
      onAnswerSubmit({ type: 'fill_blank', text: answer.trim() });
    }
    if (onAnswer) {
      onAnswer({ correct: isCorrect, questionId: question.id });
    }
  };

  return (
    <View>
      <Text style={styles.question}>{question.question}</Text>
      <TextInput
        value={answer}
        onChangeText={setAnswer}
        editable={!disabled && !submitted}
        placeholder="Type your answer"
        placeholderTextColor={HomeColors.textMuted}
        style={styles.input}
        autoCapitalize="words"
        accessibilityLabel="Answer"
      />
      <Pressable
        style={[styles.submit, (!answer.trim() || disabled || submitted) && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={!answer.trim() || disabled || submitted}
        accessibilityRole="button"
      >
        <Text style={styles.submitText}>CHECK ANSWER</Text>
      </Pressable>
      {showInlineFeedback && submitted && (
        <View style={styles.feedback}>
          <Text style={styles.feedbackTitle}>{isCorrect ? 'Correct' : 'Not quite'}</Text>
          <Text style={styles.feedbackText}>{question.explanation}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  question: {
    color: HomeColors.textMain,
    fontFamily: 'Baloo2_700Bold',
    fontSize: 22,
    lineHeight: 29,
    marginBottom: 18,
  },
  input: {
    backgroundColor: HomeColors.cardBg,
    borderColor: HomeColors.borderDark,
    borderRadius: 12,
    borderWidth: 2,
    color: HomeColors.textMain,
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 16,
    padding: 14,
  },
  submit: {
    alignItems: 'center',
    backgroundColor: HomeColors.darkCard,
    borderColor: HomeColors.borderDark,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 12,
    padding: 13,
  },
  submitDisabled: { opacity: 0.45 },
  submitText: {
    color: '#FFFFFF',
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 13,
  },
  feedback: {
    backgroundColor: HomeColors.goldLight,
    borderColor: HomeColors.borderDark,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 16,
    padding: 12,
  },
  feedbackTitle: {
    color: HomeColors.textMain,
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 16,
  },
  feedbackText: {
    color: HomeColors.textMuted,
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },
});
