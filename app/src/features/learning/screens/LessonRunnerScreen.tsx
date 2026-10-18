import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getLevelForXp } from '@/features/home/engine/xp-engine';
import { HomeColors } from '@/features/home/constants/homeTheme';
import { useUserProgress } from '@/features/home/state/useUserProgress';
import { FillBlankQuestion } from '../components/FillBlankQuestion';
import { MatchQuestion } from '../components/MatchQuestion';
import { MCQQuestion } from '../components/MCQQuestion';
import { QuizProgressBar } from '../components/QuizProgressBar';
import { getQuizLesson } from '../data/quizData';
import type { AnswerResult, QuizQuestion } from '../types/quiz.types';

export const LessonRunnerScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ lessonId?: string | string[] }>();
  const lessonId = Array.isArray(params.lessonId) ? params.lessonId[0] : params.lessonId;
  const lesson = lessonId ? getQuizLesson(lessonId) : undefined;
  const { progress, completeLesson } = useUserProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [completedLevel, setCompletedLevel] = useState(1);
  const [didLevelUp, setDidLevelUp] = useState(false);

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

  const question = lesson.questions[currentIndex];

  const handleAnswer = (result: AnswerResult) => {
    if (hasAnswered) return;
    setHasAnswered(true);
    if (result.correct) setCorrectCount((count) => count + 1);
  };

  const handleNext = async () => {
    if (!hasAnswered) return;

    if (currentIndex === lesson.questions.length - 1) {
      const alreadyCompleted = progress.completedLessons.includes(lesson.id);
      const lessonXp = alreadyCompleted ? 0 : lesson.pointsAwarded;
      const previousLevel = getLevelForXp(progress.experiencePoints);
      const nextLevel = getLevelForXp(progress.experiencePoints + lessonXp);

      setEarnedXp(lessonXp);
      setCompletedLevel(nextLevel);
      setDidLevelUp(nextLevel > previousLevel);
      setIsComplete(true);
      await completeLesson(lesson.id, lesson.pointsAwarded);
      return;
    }

    setCurrentIndex((index) => index + 1);
    setHasAnswered(false);
  };

  if (isComplete) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.resultsContent}>
        <Text style={styles.eyebrow}>{didLevelUp ? 'LEVEL UP!' : 'LESSON COMPLETE'}</Text>
        <Text style={styles.resultsTitle}>{lesson.title}</Text>
        <View style={styles.resultsCard}>
          {didLevelUp && <Text style={styles.levelUpBanner}>LEVEL {completedLevel} UNLOCKED</Text>}
          <Text style={styles.scoreLabel}>YOUR SCORE</Text>
          <Text style={styles.score}>{correctCount} / {lesson.questions.length}</Text>
          <Text style={styles.points}>+{earnedXp} PTS EARNED</Text>
          <Text style={styles.xp}>+{earnedXp} XP EARNED</Text>
          <Text style={styles.level}>CURRENT LEVEL: {completedLevel}</Text>
          <Text style={styles.resultsText}>
            Keep learning. Every completed lesson builds your DharmaPath streak.
          </Text>
        </View>
        <Pressable style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>BACK TO HOME</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.backText}>← BACK</Text>
        </Pressable>
        <Text style={styles.pointsLabel}>{lesson.pointsAwarded} PTS</Text>
      </View>

      <Text style={styles.title}>{lesson.title}</Text>
      <QuizProgressBar current={currentIndex + 1} total={lesson.questions.length} />

      <View style={styles.questionCard} key={question.id}>
        <QuestionView question={question} onAnswer={handleAnswer} />
      </View>

      <Pressable
        style={[styles.primaryButton, !hasAnswered && styles.disabledButton]}
        onPress={handleNext}
        disabled={!hasAnswered}
        accessibilityRole="button"
      >
        <Text style={styles.primaryButtonText}>
          {currentIndex === lesson.questions.length - 1 ? 'FINISH LESSON' : 'NEXT QUESTION'}
        </Text>
      </Pressable>
    </ScrollView>
  );
};

interface QuestionViewProps {
  question: QuizQuestion;
  onAnswer: (result: AnswerResult) => void;
}

const QuestionView: React.FC<QuestionViewProps> = ({ question, onAnswer }) => {
  switch (question.type) {
    case 'mcq':
      return <MCQQuestion question={question} onAnswer={onAnswer} />;
    case 'fill_blank':
      return <FillBlankQuestion question={question} onAnswer={onAnswer} />;
    case 'match':
      return <MatchQuestion question={question} onAnswer={onAnswer} />;
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HomeColors.bgSandalwood },
  content: { padding: 16, paddingBottom: 30, gap: 18 },
  resultsContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backText: { color: HomeColors.crimsonDark, fontFamily: 'Baloo2_800ExtraBold', fontSize: 13 },
  pointsLabel: { color: HomeColors.saffronDark, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12 },
  eyebrow: { color: HomeColors.saffronDark, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, letterSpacing: 1 },
  title: { color: HomeColors.crimsonDark, fontFamily: 'Baloo2_800ExtraBold', fontSize: 25, lineHeight: 31 },
  resultsTitle: { color: HomeColors.crimsonDark, fontFamily: 'Baloo2_800ExtraBold', fontSize: 28, lineHeight: 34, marginTop: 8 },
  questionCard: {
    backgroundColor: HomeColors.sunburstBg,
    borderColor: HomeColors.borderDark,
    borderRadius: 18,
    borderWidth: 2,
    padding: 16,
  },
  resultsCard: {
    backgroundColor: HomeColors.cardBg,
    borderColor: HomeColors.borderDark,
    borderRadius: 18,
    borderWidth: 2,
    marginVertical: 22,
    padding: 22,
  },
  scoreLabel: { color: HomeColors.textMuted, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12 },
  score: { color: HomeColors.crimsonDark, fontFamily: 'Baloo2_800ExtraBold', fontSize: 48, marginTop: 4 },
  points: { color: HomeColors.emeraldGreen, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, marginTop: 4 },
  xp: { color: HomeColors.saffronDark, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, marginTop: 6 },
  level: { color: HomeColors.crimsonDark, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, marginTop: 10 },
  levelUpBanner: {
    backgroundColor: HomeColors.goldLight,
    borderColor: HomeColors.saffronDark,
    borderRadius: 8,
    borderWidth: 1.5,
    color: HomeColors.saffronDark,
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 16,
    marginBottom: 16,
    padding: 8,
    textAlign: 'center',
  },
  resultsText: { color: HomeColors.textMuted, fontFamily: 'SpaceGrotesk_400Regular', fontSize: 14, lineHeight: 21, marginTop: 16 },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: HomeColors.darkCard,
    borderColor: HomeColors.borderDark,
    borderRadius: 12,
    borderWidth: 2,
    padding: 14,
  },
  disabledButton: { opacity: 0.4 },
  primaryButtonText: { color: '#FFFFFF', fontFamily: 'Baloo2_800ExtraBold', fontSize: 13 },
  centered: { alignItems: 'center', backgroundColor: HomeColors.bgSandalwood, flex: 1, justifyContent: 'center', padding: 24 },
  errorTitle: { color: HomeColors.crimsonDark, fontFamily: 'Baloo2_800ExtraBold', fontSize: 24 },
  errorText: { color: HomeColors.textMuted, fontFamily: 'SpaceGrotesk_400Regular', fontSize: 14, marginVertical: 10 },
});
