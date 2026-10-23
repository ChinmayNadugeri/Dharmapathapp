import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { HomeColors } from '@/features/home/constants/homeTheme';
import type { Evaluation } from '../engine/types';
import { SoundFeedback } from '../services/soundFeedback';

interface FeedbackBannerProps {
  evaluation: Evaluation;
}

export const FeedbackBanner: React.FC<FeedbackBannerProps> = ({ evaluation }) => {
  const isCorrect = evaluation.correct;
  const isPartial = !isCorrect && evaluation.score > 0;

  // Spring slide-up animation
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Play appropriate sound
    if (isCorrect) {
      SoundFeedback.playCorrect();
    } else {
      SoundFeedback.playIncorrect();
    }

    // Trigger smooth bounce entrance
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isCorrect]);

  return (
    <Animated.View
      style={[
        styles.container,
        isCorrect
          ? styles.correctContainer
          : isPartial
          ? styles.partialContainer
          : styles.incorrectContainer,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View
          style={[
            styles.iconCircle,
            isCorrect
              ? styles.correctCircle
              : isPartial
              ? styles.partialCircle
              : styles.incorrectCircle,
          ]}
        >
          <Text style={styles.iconText}>
            {isCorrect ? '✓' : isPartial ? '≈' : '✕'}
          </Text>
        </View>
        <Text
          style={[
            styles.title,
            isCorrect
              ? styles.correctTitle
              : isPartial
              ? styles.partialTitle
              : styles.incorrectTitle,
          ]}
        >
          {isCorrect
            ? 'Splendid! Correct!'
            : isPartial
            ? `Partial Credit (${Math.round(evaluation.score * 100)}%)`
            : 'Incorrect'}
        </Text>
      </View>

      {evaluation.expected && !isCorrect && (
        <View style={styles.expectedBox}>
          <Text style={styles.expectedLabel}>CORRECT ANSWER:</Text>
          <Text style={styles.expectedText}>{evaluation.expected}</Text>
        </View>
      )}

      {evaluation.explanation ? (
        <Text style={styles.explanationText}>{evaluation.explanation}</Text>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 2,
    borderBottomWidth: 4,
    padding: 16,
    marginTop: 12,
  },
  correctContainer: {
    backgroundColor: HomeColors.emeraldLight,
    borderColor: HomeColors.emeraldGreen,
  },
  partialContainer: {
    backgroundColor: HomeColors.goldLight,
    borderColor: HomeColors.saffronDark,
  },
  incorrectContainer: {
    backgroundColor: '#FFEBEE',
    borderColor: HomeColors.crimsonAccent,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctCircle: {
    backgroundColor: HomeColors.emeraldGreen,
  },
  partialCircle: {
    backgroundColor: HomeColors.saffronDark,
  },
  incorrectCircle: {
    backgroundColor: HomeColors.crimsonAccent,
  },
  iconText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  title: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 18,
  },
  correctTitle: {
    color: HomeColors.emeraldGreen,
  },
  partialTitle: {
    color: HomeColors.saffronDark,
  },
  incorrectTitle: {
    color: HomeColors.crimsonAccent,
  },
  expectedBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    padding: 8,
    marginVertical: 6,
  },
  expectedLabel: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    color: HomeColors.textMuted,
    letterSpacing: 1,
  },
  expectedText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: HomeColors.textMain,
    marginTop: 2,
  },
  explanationText: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 13,
    color: HomeColors.textMain,
    lineHeight: 18,
    marginTop: 4,
  },
});
