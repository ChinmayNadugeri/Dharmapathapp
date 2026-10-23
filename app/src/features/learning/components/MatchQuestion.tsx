import React, { useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, Vibration, View } from 'react-native';
import { HomeColors } from '@/features/home/constants/homeTheme';
import type { AnswerResult, MatchQuestion as MatchQuestionData } from '../types/quiz.types';
import type { Answer } from '../engine/types';

interface MatchQuestionProps {
  question: MatchQuestionData;
  onAnswer?: (result: AnswerResult) => void;
  onAnswerSubmit?: (answer: Answer) => void;
  disabled?: boolean;
  showInlineFeedback?: boolean;
}

const MATCH_COLORS = ['#E57373', '#64B5F6', '#81C784', '#BA68C8', '#FFB74D', '#4DB6AC'];

function shufflePairs<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

export const MatchQuestion: React.FC<MatchQuestionProps> = ({
  question,
  onAnswer,
  onAnswerSubmit,
  disabled = false,
  showInlineFeedback = true,
}) => {
  const [rightItems] = useState(() => shufflePairs(question.pairs));
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<{ left: string; right: string }[]>([]);
  const [wrongLeft, setWrongLeft] = useState<string | null>(null);
  const [wrongRight, setWrongRight] = useState<string | null>(null);
  const shake = React.useRef(new Animated.Value(0)).current;

  const matchedLeft = matchedPairs.map((p) => p.left);

  const getPairColor = (left: string) => {
    const pairIndex = question.pairs.findIndex((item) => item.left === left);
    return MATCH_COLORS[pairIndex % MATCH_COLORS.length];
  };

  const handleRightPress = (right: string) => {
    if (disabled || !selectedLeft || matchedLeft.includes(selectedLeft)) return;
    const pair = question.pairs.find((item) => item.left === selectedLeft);
    if (!pair) return;

    if (pair.right === right) {
      const nextMatched = [...matchedPairs, { left: selectedLeft, right }];
      setMatchedPairs(nextMatched);
      setSelectedLeft(null);
      if (nextMatched.length === question.pairs.length) {
        if (onAnswerSubmit) {
          onAnswerSubmit({ type: 'match', pairs: nextMatched });
        }
        if (onAnswer) {
          onAnswer({ correct: true, questionId: question.id });
        }
      }
    } else {
      setWrongLeft(selectedLeft);
      setWrongRight(right);
      Vibration.vibrate(80);
      Animated.sequence([
        Animated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start(() => {
        setWrongLeft(null);
        setWrongRight(null);
      });
    }
  };

  return (
    <View>
      <Text style={styles.question}>Match each item with its meaning.</Text>
      <View style={styles.columns}>
        <View style={styles.column}>
          {question.pairs.map((pair) => {
            const matched = matchedLeft.includes(pair.left);
            const isWrong = wrongLeft === pair.left;
            return (
              <Animated.View key={pair.left} style={isWrong && { transform: [{ translateX: shake }] }}>
                <Pressable
                  style={[
                    styles.item,
                    selectedLeft === pair.left && styles.itemSelected,
                    matched && { backgroundColor: getPairColor(pair.left), borderColor: getPairColor(pair.left) },
                    isWrong && styles.itemWrong,
                  ]}
                  onPress={() => setSelectedLeft(pair.left)}
                  disabled={disabled || matched}
                >
                  <Text style={styles.itemText}>{pair.left}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
        <View style={styles.column}>
          {rightItems.map((pair) => {
            const matched = matchedLeft.includes(pair.left);
            const isWrong = wrongRight === pair.right;
            return (
              <Animated.View key={pair.right} style={isWrong && { transform: [{ translateX: shake }] }}>
                <Pressable
                  style={[
                    styles.item,
                    matched && { backgroundColor: getPairColor(pair.left), borderColor: getPairColor(pair.left) },
                    isWrong && styles.itemWrong,
                  ]}
                  onPress={() => handleRightPress(pair.right)}
                  disabled={disabled || matched}
                >
                  <Text style={styles.itemText}>{pair.right}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </View>
      {showInlineFeedback && matchedLeft.length === question.pairs.length && (
        <View style={styles.feedback}>
          <Text style={styles.feedbackTitle}>All matched</Text>
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
  columns: { flexDirection: 'row', gap: 10 },
  column: { flex: 1, gap: 10 },
  item: {
    backgroundColor: HomeColors.cardBg,
    borderColor: HomeColors.borderDark,
    borderRadius: 10,
    borderWidth: 1.5,
    minHeight: 58,
    justifyContent: 'center',
    padding: 10,
  },
  itemSelected: { backgroundColor: HomeColors.goldLight },
  itemWrong: {
    backgroundColor: '#FFEBEE',
    borderColor: HomeColors.crimsonAccent,
  },
  itemText: {
    color: HomeColors.textMain,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 12,
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
