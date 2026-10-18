import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HomeColors } from '@/features/home/constants/homeTheme';
import type { AnswerResult, MCQQuestion as MCQQuestionData } from '../types/quiz.types';

interface MCQQuestionProps {
  question: MCQQuestionData;
  onAnswer: (result: AnswerResult) => void;
}

export const MCQQuestion: React.FC<MCQQuestionProps> = ({ question, onAnswer }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(index);
    onAnswer({ correct: index === question.correctIndex, questionId: question.id });
  };

  return (
    <View>
      <Text style={styles.question}>{question.question}</Text>
      <View style={styles.options}>
        {question.options.map((option, index) => {
          const selected = selectedIndex === index;
          const correct = index === question.correctIndex;
          const optionStyle = selectedIndex === null
            ? styles.option
            : correct
              ? styles.optionCorrect
              : selected
                ? styles.optionIncorrect
                : styles.option;

          return (
            <Pressable
              key={option}
              style={optionStyle}
              onPress={() => handleSelect(index)}
              disabled={selectedIndex !== null}
              accessibilityRole="button"
              accessibilityLabel={option}
            >
              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
      {selectedIndex !== null && (
        <View style={styles.feedback}>
          <Text style={styles.feedbackTitle}>
            {selectedIndex === question.correctIndex ? 'Correct' : 'Not quite'}
          </Text>
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
  options: { gap: 10 },
  option: {
    backgroundColor: HomeColors.cardBg,
    borderColor: HomeColors.borderDark,
    borderRadius: 12,
    borderWidth: 2,
    padding: 14,
  },
  optionCorrect: {
    backgroundColor: HomeColors.emeraldLight,
    borderColor: HomeColors.emeraldGreen,
    borderRadius: 12,
    borderWidth: 2,
    padding: 14,
  },
  optionIncorrect: {
    backgroundColor: '#FFEBEE',
    borderColor: HomeColors.crimsonAccent,
    borderRadius: 12,
    borderWidth: 2,
    padding: 14,
  },
  optionText: {
    color: HomeColors.textMain,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 15,
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
