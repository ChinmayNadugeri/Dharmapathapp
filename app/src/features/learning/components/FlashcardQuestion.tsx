import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HomeColors } from '@/features/home/constants/homeTheme';
import type { FlashcardQuestion as FlashcardQuestionData } from '../types/quiz.types';
import type { Answer } from '../engine/types';

interface FlashcardQuestionProps {
  question: FlashcardQuestionData;
  onAnswer: (answer: Answer) => void;
  disabled?: boolean;
}

export const FlashcardQuestion: React.FC<FlashcardQuestionProps> = ({
  question,
  onAnswer,
  disabled = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasSelfReported, setHasSelfReported] = useState(false);

  const handleFlip = () => {
    if (disabled || hasSelfReported) return;
    setIsFlipped((prev) => !prev);
  };

  const handleSelfReport = (remembered: boolean) => {
    if (disabled || hasSelfReported) return;
    setHasSelfReported(true);
    onAnswer({ type: 'flashcard', selfReportedCorrect: remembered });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.badge}>KNOWLEDGE RECALL FLASHCARD</Text>

      <Pressable
        style={[styles.card, isFlipped ? styles.cardFlipped : styles.cardFront]}
        onPress={handleFlip}
        disabled={disabled || hasSelfReported}
        accessibilityRole="button"
        accessibilityLabel="Flip card"
      >
        <Text style={styles.cardHeader}>{isFlipped ? 'ANSWER / CONCEPT' : 'PROMPT'}</Text>
        <Text style={styles.cardBody}>
          {isFlipped ? question.back : question.front}
        </Text>
        {!hasSelfReported && (
          <Text style={styles.tapToFlip}>
            {isFlipped ? 'Tap to see prompt again' : 'Tap to flip & reveal answer'}
          </Text>
        )}
      </Pressable>

      {isFlipped && !hasSelfReported && (
        <View style={styles.selfReportSection}>
          <Text style={styles.selfReportPrompt}>Did you remember this?</Text>
          <View style={styles.selfReportRow}>
            <Pressable
              style={[styles.reportBtn, styles.forgotBtn]}
              onPress={() => handleSelfReport(false)}
              accessibilityRole="button"
              accessibilityLabel="Did not remember"
            >
              <Text style={styles.reportIcon}>✕</Text>
              <Text style={styles.reportText}>NEED REVIEW</Text>
            </Pressable>
            <Pressable
              style={[styles.reportBtn, styles.rememberedBtn]}
              onPress={() => handleSelfReport(true)}
              accessibilityRole="button"
              accessibilityLabel="Remembered"
            >
              <Text style={styles.reportIcon}>✓</Text>
              <Text style={styles.reportText}>I KNEW IT</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  badge: {
    color: HomeColors.saffronDark,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  card: {
    minHeight: 180,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    padding: 20,
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  cardFront: {
    backgroundColor: HomeColors.cardBg,
    borderColor: HomeColors.borderDark,
  },
  cardFlipped: {
    backgroundColor: HomeColors.goldLight,
    borderColor: HomeColors.saffronDark,
  },
  cardHeader: {
    color: HomeColors.textMuted,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    letterSpacing: 1,
  },
  cardBody: {
    color: HomeColors.textMain,
    fontFamily: 'Baloo2_700Bold',
    fontSize: 22,
    lineHeight: 30,
    marginVertical: 12,
    textAlign: 'center',
  },
  tapToFlip: {
    color: HomeColors.saffronDark,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 12,
    textAlign: 'center',
  },
  selfReportSection: {
    marginTop: 6,
    gap: 10,
  },
  selfReportPrompt: {
    color: HomeColors.textMain,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    textAlign: 'center',
  },
  selfReportRow: {
    flexDirection: 'row',
    gap: 12,
  },
  reportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderBottomWidth: 4,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  forgotBtn: {
    backgroundColor: '#FFEBEE',
    borderColor: HomeColors.crimsonAccent,
  },
  rememberedBtn: {
    backgroundColor: HomeColors.emeraldLight,
    borderColor: HomeColors.emeraldGreen,
  },
  reportIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: HomeColors.textMain,
  },
  reportText: {
    color: HomeColors.textMain,
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 13,
  },
});
