import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HomeColors } from '@/features/home/constants/homeTheme';
import type { OrderingQuestion as OrderingQuestionData } from '../types/quiz.types';
import type { Answer } from '../engine/types';

interface OrderingQuestionProps {
  question: OrderingQuestionData;
  onAnswer: (answer: Answer) => void;
  disabled?: boolean;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Ensure it's not identical to correctOrder initially if possible
  return arr;
}

export const OrderingQuestion: React.FC<OrderingQuestionProps> = ({
  question,
  onAnswer,
  disabled = false,
}) => {
  const [items, setItems] = useState<string[]>(() => {
    const shuffled = shuffle(question.correctOrder);
    return shuffled;
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const moveUp = (index: number) => {
    if (index === 0 || disabled || hasSubmitted) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setItems(next);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1 || disabled || hasSubmitted) return;
    const next = [...items];
    [next[index + 1], next[index]] = [next[index], next[index + 1]];
    setItems(next);
  };

  const handleSubmit = () => {
    if (disabled || hasSubmitted) return;
    setHasSubmitted(true);
    onAnswer({ type: 'ordering', order: items });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.badge}>CHRONOLOGICAL / LOGICAL ORDER</Text>
      <Text style={styles.instruction}>{question.instruction}</Text>
      <Text style={styles.hintText}>Use the arrows to arrange the items in the correct order:</Text>

      <View style={styles.list}>
        {items.map((item, index) => (
          <View key={`${item}-${index}`} style={styles.itemRow}>
            <View style={styles.indexBadge}>
              <Text style={styles.indexText}>{index + 1}</Text>
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemText}>{item}</Text>
            </View>
            {!hasSubmitted && !disabled && (
              <View style={styles.arrowControls}>
                <Pressable
                  style={[styles.arrowButton, index === 0 && styles.arrowDisabled]}
                  onPress={() => moveUp(index)}
                  disabled={index === 0 || disabled || hasSubmitted}
                  accessibilityLabel={`Move up ${item}`}
                >
                  <Text style={styles.arrowText}>▲</Text>
                </Pressable>
                <Pressable
                  style={[styles.arrowButton, index === items.length - 1 && styles.arrowDisabled]}
                  onPress={() => moveDown(index)}
                  disabled={index === items.length - 1 || disabled || hasSubmitted}
                  accessibilityLabel={`Move down ${item}`}
                >
                  <Text style={styles.arrowText}>▼</Text>
                </Pressable>
              </View>
            )}
          </View>
        ))}
      </View>

      {!hasSubmitted && !disabled && (
        <Pressable
          style={styles.confirmButton}
          onPress={handleSubmit}
          accessibilityRole="button"
        >
          <Text style={styles.confirmButtonText}>CONFIRM ORDER</Text>
        </Pressable>
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
    marginBottom: 6,
  },
  instruction: {
    color: HomeColors.textMain,
    fontFamily: 'Baloo2_700Bold',
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 6,
  },
  hintText: {
    color: HomeColors.textMuted,
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 13,
    marginBottom: 16,
  },
  list: { gap: 10, marginBottom: 18 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HomeColors.cardBg,
    borderColor: HomeColors.borderDark,
    borderRadius: 12,
    borderWidth: 2,
    borderBottomWidth: 3,
    padding: 10,
    gap: 10,
  },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: HomeColors.goldLight,
    borderColor: HomeColors.borderDark,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: HomeColors.crimsonDark,
  },
  itemContent: { flex: 1 },
  itemText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 14,
    color: HomeColors.textMain,
    lineHeight: 20,
  },
  arrowControls: {
    flexDirection: 'column',
    gap: 4,
  },
  arrowButton: {
    backgroundColor: HomeColors.sunburstBg,
    borderColor: HomeColors.borderDark,
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabled: {
    opacity: 0.25,
  },
  arrowText: {
    fontSize: 10,
    color: HomeColors.crimsonDark,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: HomeColors.saffronDark,
    borderColor: HomeColors.borderDark,
    borderRadius: 12,
    borderWidth: 2,
    borderBottomWidth: 4,
    padding: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
