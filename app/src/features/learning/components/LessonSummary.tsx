import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HomeColors } from '@/features/home/constants/homeTheme';
import type { QuizLesson } from '../types/quiz.types';
import type { SessionSummary } from '../engine/session';
import type { AttemptRecord } from '../engine/types';

interface LessonSummaryProps {
  lesson: QuizLesson;
  summary: SessionSummary;
  attempts: AttemptRecord[];
  earnedXp: number;
  completedLevel: number;
  didLevelUp: boolean;
  onContinue: () => void;
  onRetryLesson?: () => void;
}

export const LessonSummary: React.FC<LessonSummaryProps> = ({
  lesson,
  summary,
  attempts,
  earnedXp,
  completedLevel,
  didLevelUp,
  onContinue,
  onRetryLesson,
}) => {
  const accuracyPercent = Math.round(summary.accuracy * 100);

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>
        {didLevelUp ? '🎉 LEVEL UP!' : summary.passed ? 'LESSON COMPLETED' : 'PRACTICE SESSION ENDED'}
      </Text>
      <Text style={styles.title}>{lesson.title}</Text>

      <View style={styles.card}>
        {didLevelUp && (
          <View style={styles.levelUpBanner}>
            <Text style={styles.levelUpText}>LEVEL {completedLevel} UNLOCKED</Text>
          </View>
        )}

        <View style={styles.statGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>ACCURACY</Text>
            <Text style={[styles.statValue, { color: summary.passed ? HomeColors.emeraldGreen : HomeColors.saffronDark }]}>
              {accuracyPercent}%
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>SCORE</Text>
            <Text style={styles.statValue}>
              {summary.firstTryCorrect} / {summary.total}
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>XP EARNED</Text>
            <Text style={[styles.statValue, { color: HomeColors.saffronDark }]}>
              +{earnedXp}
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>HINTS USED</Text>
            <Text style={styles.statValue}>{summary.hintsUsed}</Text>
          </View>
        </View>

        {summary.retried.length > 0 && (
          <View style={styles.retriedNotice}>
            <Text style={styles.retriedTitle}>REMEDIAL RETRIES COMPLETED</Text>
            <Text style={styles.retriedText}>
              You re-attempted and learned from {summary.retried.length} missed question{summary.retried.length > 1 ? 's' : ''}!
            </Text>
          </View>
        )}

        <View style={styles.questionReviewSection}>
          <Text style={styles.reviewHeading}>QUESTION REVIEW</Text>
          {lesson.questions.map((q, idx) => {
            const firstAttempt = attempts.find(
              (a) => a.questionId === q.id && a.attemptNumber === 1,
            );
            const isCorrect = firstAttempt?.correct ?? false;
            return (
              <View key={q.id} style={styles.reviewRow}>
                <View
                  style={[
                    styles.reviewBadge,
                    isCorrect ? styles.badgeCorrect : styles.badgeIncorrect,
                  ]}
                >
                  <Text style={styles.badgeText}>{isCorrect ? '✓' : '✕'}</Text>
                </View>
                <View style={styles.reviewContent}>
                  <Text style={styles.reviewQuestionNumber}>Question {idx + 1} ({q.type.toUpperCase()})</Text>
                  <Text style={styles.reviewExplanation} numberOfLines={2}>
                    {q.explanation}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.buttonCol}>
        <Pressable style={styles.primaryButton} onPress={onContinue} accessibilityRole="button">
          <Text style={styles.primaryButtonText}>CONTINUE</Text>
        </Pressable>

        {onRetryLesson && (
          <Pressable style={styles.secondaryButton} onPress={onRetryLesson} accessibilityRole="button">
            <Text style={styles.secondaryButtonText}>PRACTICE AGAIN</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  eyebrow: {
    color: HomeColors.saffronDark,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  title: {
    color: HomeColors.crimsonDark,
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 26,
    lineHeight: 32,
    marginTop: 4,
    marginBottom: 16,
  },
  card: {
    backgroundColor: HomeColors.cardBg,
    borderColor: HomeColors.borderDark,
    borderRadius: 18,
    borderWidth: 2,
    padding: 18,
    marginBottom: 20,
  },
  levelUpBanner: {
    backgroundColor: HomeColors.goldLight,
    borderColor: HomeColors.saffronDark,
    borderRadius: 8,
    borderWidth: 1.5,
    padding: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  levelUpText: {
    color: HomeColors.saffronDark,
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 14,
    letterSpacing: 1,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: HomeColors.sunburstBg,
    borderColor: HomeColors.borderDark,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
  },
  statLabel: {
    color: HomeColors.textMuted,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    letterSpacing: 1,
  },
  statValue: {
    color: HomeColors.textMain,
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 24,
    marginTop: 2,
  },
  retriedNotice: {
    backgroundColor: HomeColors.goldLight,
    borderColor: HomeColors.saffronDark,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginBottom: 16,
  },
  retriedTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    color: HomeColors.saffronDark,
    letterSpacing: 0.5,
  },
  retriedText: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 12,
    color: HomeColors.textMain,
    marginTop: 2,
  },
  questionReviewSection: {
    borderTopWidth: 1,
    borderTopColor: HomeColors.borderDark,
    paddingTop: 14,
  },
  reviewHeading: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    color: HomeColors.textMuted,
    letterSpacing: 1,
    marginBottom: 10,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  reviewBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCorrect: {
    backgroundColor: HomeColors.emeraldGreen,
  },
  badgeIncorrect: {
    backgroundColor: HomeColors.crimsonAccent,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  reviewContent: { flex: 1 },
  reviewQuestionNumber: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    color: HomeColors.textMain,
  },
  reviewExplanation: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 11,
    color: HomeColors.textMuted,
  },
  buttonCol: {
    gap: 10,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: HomeColors.darkCard,
    borderColor: HomeColors.borderDark,
    borderRadius: 12,
    borderWidth: 2,
    borderBottomWidth: 4,
    padding: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: HomeColors.cardBg,
    borderColor: HomeColors.borderDark,
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
  },
  secondaryButtonText: {
    color: HomeColors.crimsonDark,
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 13,
  },
});
