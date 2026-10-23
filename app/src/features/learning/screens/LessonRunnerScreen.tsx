import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getLevelForXp } from '@/features/home/engine/xp-engine';
import { HomeColors } from '@/features/home/constants/homeTheme';
import { useUserProgress } from '@/features/home/state/useUserProgress';
import { QuizProgressBar } from '../components/QuizProgressBar';
import { ExerciseRenderer } from '../components/ExerciseRenderer';
import { HintButton } from '../components/HintButton';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { LessonSummary } from '../components/LessonSummary';
import { getQuizLesson } from '../data/quizData';
import { useLessonSession } from '../state/useLessonSession';
import type { Answer } from '../engine/types';

export const LessonRunnerScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ lessonId?: string | string[] }>();
  const lessonId = Array.isArray(params.lessonId) ? params.lessonId[0] : params.lessonId;
  const lesson = lessonId ? getQuizLesson(lessonId) : undefined;
  const { progress, completeLesson } = useUserProgress();

  const [earnedXp, setEarnedXp] = useState(0);
  const [completedLevel, setCompletedLevel] = useState(1);
  const [didLevelUp, setDidLevelUp] = useState(false);

  const {
    session,
    currentQ,
    currentHint,
    isAnswering,
    isFeedback,
    isComplete,
    lastEvaluation,
    summary,
    eliminatedOptions,
    submitAnswer,
    requestHint,
    nextQuestion,
    resetSession,
  } = useLessonSession({
    lesson: lesson ?? { id: '', title: '', pointsAwarded: 0, questions: [] },
    onLessonComplete: async (completedSummary, awardedXp) => {
      const alreadyCompleted = progress.completedLessons.includes(lesson?.id ?? '');
      const actualXp = alreadyCompleted ? Math.round(awardedXp * 0.25) : awardedXp;
      const prevLevel = getLevelForXp(progress.experiencePoints);
      const nextLevel = getLevelForXp(progress.experiencePoints + actualXp);

      setEarnedXp(actualXp);
      setCompletedLevel(nextLevel);
      setDidLevelUp(nextLevel > prevLevel);

      if (lesson) {
        await completeLesson(lesson.id, actualXp);
      }
    },
  });

  if (!lesson) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Lesson unavailable</Text>
        <Text style={styles.errorText}>This lesson could not be found.</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>GO BACK</Text>
        </Pressable>
      </View>
    );
  }

  if (isComplete && summary) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.resultsContent}>
        <LessonSummary
          lesson={lesson}
          summary={summary}
          attempts={session.attempts}
          earnedXp={earnedXp}
          completedLevel={completedLevel}
          didLevelUp={didLevelUp}
          onContinue={() => router.back()}
          onRetryLesson={resetSession}
        />
      </ScrollView>
    );
  }

  if (!currentQ) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Loading question...</Text>
      </View>
    );
  }

  const isRetryAttempt = session.attempts.some(
    (a) => a.questionId === currentQ.id && a.attemptNumber === 1 && !a.correct,
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.backText}>← BACK</Text>
        </Pressable>
        <Text style={styles.pointsLabel}>{lesson.pointsAwarded} PTS</Text>
      </View>

      <Text style={styles.title}>{lesson.title}</Text>

      <QuizProgressBar
        current={Math.min(session.position + 1, session.queue.length)}
        total={session.queue.length}
      />

      {isRetryAttempt && (
        <View style={styles.remediationBanner}>
          <Text style={styles.remediationText}>🔄 Remediation Practice: Let's master this concept!</Text>
        </View>
      )}

      <View style={styles.questionCard} key={`${currentQ.id}-${session.position}`}>
        <ExerciseRenderer
          question={currentQ}
          onAnswerSubmit={(answer: Answer) => submitAnswer(answer)}
          disabled={!isAnswering}
          eliminatedOptions={eliminatedOptions}
          showInlineFeedback={false}
        />
      </View>

      {/* Hints Engine UI */}
      {isAnswering && (
        <HintButton
          onPress={requestHint}
          currentHint={currentHint}
          hintLevel={session.hintLevel}
          disabled={!isAnswering}
        />
      )}

      {/* Real-time Feedback Engine UI */}
      {isFeedback && lastEvaluation && (
        <FeedbackBanner evaluation={lastEvaluation} />
      )}

      {/* Action Button: Advance session */}
      {isFeedback && (
        <Pressable
          style={styles.primaryButton}
          onPress={nextQuestion}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>
            {session.position >= session.queue.length - 1 ? 'SEE SUMMARY' : 'CONTINUE'}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HomeColors.bgSandalwood },
  content: { padding: 16, paddingBottom: 40, gap: 14 },
  resultsContent: { flexGrow: 1, padding: 16, paddingBottom: 30 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backText: { color: HomeColors.crimsonDark, fontFamily: 'Baloo2_800ExtraBold', fontSize: 13 },
  pointsLabel: { color: HomeColors.saffronDark, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12 },
  title: { color: HomeColors.crimsonDark, fontFamily: 'Baloo2_800ExtraBold', fontSize: 24, lineHeight: 30 },
  questionCard: {
    backgroundColor: HomeColors.sunburstBg,
    borderColor: HomeColors.borderDark,
    borderRadius: 18,
    borderWidth: 2,
    padding: 16,
  },
  remediationBanner: {
    backgroundColor: HomeColors.goldLight,
    borderColor: HomeColors.saffronDark,
    borderRadius: 10,
    borderWidth: 1,
    padding: 8,
  },
  remediationText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: HomeColors.saffronDark,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: HomeColors.darkCard,
    borderColor: HomeColors.borderDark,
    borderRadius: 12,
    borderWidth: 2,
    borderBottomWidth: 4,
    padding: 14,
    marginTop: 8,
  },
  primaryButtonText: { color: '#FFFFFF', fontFamily: 'Baloo2_800ExtraBold', fontSize: 14 },
  centered: { alignItems: 'center', backgroundColor: HomeColors.bgSandalwood, flex: 1, justifyContent: 'center', padding: 24 },
  errorTitle: { color: HomeColors.crimsonDark, fontFamily: 'Baloo2_800ExtraBold', fontSize: 24 },
  errorText: { color: HomeColors.textMuted, fontFamily: 'SpaceGrotesk_400Regular', fontSize: 14, marginVertical: 10 },
});
