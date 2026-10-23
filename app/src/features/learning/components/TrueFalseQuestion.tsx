import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HomeColors } from '@/features/home/constants/homeTheme';
import type { TrueFalseQuestion as TrueFalseQuestionData } from '../types/quiz.types';
import type { Answer } from '../engine/types';

interface TrueFalseQuestionProps {
  question: TrueFalseQuestionData;
  onAnswer: (answer: Answer) => void;
  disabled?: boolean;
  selectedAnswer?: boolean;
}

export const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = ({
  question,
  onAnswer,
  disabled = false,
  selectedAnswer,
}) => {
  const handleSelect = (choice: boolean) => {
    if (disabled || selectedAnswer !== undefined) return;
    onAnswer({ type: 'true_false', selected: choice });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.statementBadge}>TRUE OR FALSE</Text>
      <Text style={styles.statement}>{question.statement}</Text>
      <View style={styles.buttonRow}>
        <Pressable
          style={[
            styles.choiceButton,
            styles.trueButton,
            selectedAnswer === true && styles.selectedChoice,
            disabled && selectedAnswer !== true && styles.disabledChoice,
          ]}
          onPress={() => handleSelect(true)}
          disabled={disabled || selectedAnswer !== undefined}
          accessibilityRole="button"
          accessibilityLabel="True"
        >
          <Text style={styles.choiceIcon}>✓</Text>
          <Text style={styles.choiceText}>TRUE</Text>
        </Pressable>

        <Pressable
          style={[
            styles.choiceButton,
            styles.falseButton,
            selectedAnswer === false && styles.selectedChoice,
            disabled && selectedAnswer !== false && styles.disabledChoice,
          ]}
          onPress={() => handleSelect(false)}
          disabled={disabled || selectedAnswer !== undefined}
          accessibilityRole="button"
          accessibilityLabel="False"
        >
          <Text style={styles.choiceIcon}>✕</Text>
          <Text style={styles.choiceText}>FALSE</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  statementBadge: {
    color: HomeColors.saffronDark,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  statement: {
    color: HomeColors.textMain,
    fontFamily: 'Baloo2_700Bold',
    fontSize: 22,
    lineHeight: 29,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  choiceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: HomeColors.cardBg,
    borderColor: HomeColors.borderDark,
    borderRadius: 14,
    borderWidth: 2,
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  trueButton: {
    borderBottomWidth: 4,
  },
  falseButton: {
    borderBottomWidth: 4,
  },
  selectedChoice: {
    backgroundColor: HomeColors.goldLight,
    borderColor: HomeColors.saffronDark,
  },
  disabledChoice: {
    opacity: 0.5,
  },
  choiceIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: HomeColors.crimsonDark,
  },
  choiceText: {
    color: HomeColors.crimsonDark,
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
