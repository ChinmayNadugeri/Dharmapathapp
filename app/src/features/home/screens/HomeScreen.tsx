import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeroLessonCard } from '../components/HeroLessonCard';
import { PanchangGlanceCard } from '../components/PanchangGlanceCard';
import { ContinueLessonCard } from '../components/ContinueLessonCard';
import { ReviseShlokaCard } from '../components/ReviseShlokaCard';
import { ShlokaRecitationModal } from '../components/ShlokaRecitationModal';
import { RecentLearningsChecklist } from '../components/RecentLearningsChecklist';
import { useUserProgress } from '../state/useUserProgress';
import { useDailyContent } from '../state/useDailyContent';
import { useLearnerState } from '@/features/learning/state/useLearnerState';
import { recommendNext } from '@/features/learning/engine/recommend';
import { dueItems } from '@/features/learning/engine/spaced';
import { toLocalDateKey } from '@/features/learning/engine/date';
import { LESSONS_DATA } from '../data/lessonsData';
import { QUIZ_LESSONS } from '@/features/learning/data/quizData';
import { HomeColors } from '../constants/homeTheme';

interface HomeScreenProps {
  navigation: {
    navigate: (screen: string, params?: object) => void;
  };
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { progress, completeLesson } = useUserProgress();
  const { learnerState, getSessionSnapshot } = useLearnerState();
  const { featuredLesson, continueLesson, dailyShloka, recentLearnings } = useDailyContent(progress);

  // Compute adaptive recommendation using pure engine
  const todayKey = toLocalDateKey(new Date());
  const dueReviews = dueItems(learnerState.reviews, todayKey);
  const lessonOrder = LESSONS_DATA.map((l) => l.id);

  const lessonConcepts: Record<string, string[]> = {};
  for (const ql of QUIZ_LESSONS) {
    const concepts = ql.questions.map((q) => q.conceptId || ql.id);
    lessonConcepts[ql.id] = Array.from(new Set(concepts));
  }

  const recommendation = recommendNext({
    lessonOrder,
    completed: progress.completedLessons,
    mastery: learnerState.mastery,
    lessonConcepts,
    dueReviews,
  });

  // Calculate actual progress for continue card if snapshot exists
  const activeContinueSnapshot = continueLesson ? getSessionSnapshot(continueLesson.id) : undefined;
  const continueProgress = activeContinueSnapshot && activeContinueSnapshot.queue.length > 0
    ? Math.round((activeContinueSnapshot.position / activeContinueSnapshot.queue.length) * 100)
    : 35; // Default if starting fresh

  const recommendedLesson = recommendation.targetId
    ? LESSONS_DATA.find((l) => l.id === recommendation.targetId)
    : null;

  const handleBeginFeatured = () => {
    if (featuredLesson) {
      navigation.navigate('/learning/lesson-runner', { lessonId: featuredLesson.id });
    }
  };

  const handleResumeContinue = () => {
    if (continueLesson) {
      navigation.navigate('/learning/lesson-runner', { lessonId: continueLesson.id });
    }
  };

  const handleOpenRecommended = () => {
    if (recommendedLesson) {
      navigation.navigate('/learning/lesson-runner', { lessonId: recommendedLesson.id });
    }
  };

  const [recitationModalVisible, setRecitationModalVisible] = React.useState(false);

  const handleReviseShloka = () => {
    if (dailyShloka) {
      setRecitationModalVisible(true);
    }
  };

  const handleRecitationComplete = (earnedXp: number) => {
    if (dailyShloka) {
      completeLesson(`revise_${dailyShloka.id}_${new Date().toDateString()}`, earnedXp);
    }
  };

  const handleViewFullCalendar = () => {
    navigation.navigate('panchang');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + 10 }]}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>TODAY'S FEATURED LESSON</Text>
        <View style={styles.sectionLine} />
      </View>
      <HeroLessonCard lesson={featuredLesson} onBeginLesson={handleBeginFeatured} />

      {/* Adaptive Recommendation Card if recommendation differs from featured */}
      {recommendedLesson && recommendation.kind !== 'done' && (
        <>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>ADAPTIVE RECOMMENDATION</Text>
            <View style={styles.sectionLine} />
          </View>
          <ContinueLessonCard
            lesson={recommendedLesson}
            progressPercent={continueProgress}
            onResume={handleOpenRecommended}
            badgeLabel={recommendation.kind.toUpperCase()}
            recommendationReason={recommendation.reason}
          />
        </>
      )}

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>TODAY'S PANCHANG & MUHURAT</Text>
        <View style={styles.sectionLine} />
      </View>
      <PanchangGlanceCard onViewFullCalendar={handleViewFullCalendar} />

      {/* Section Header */}
      {continueLesson && !recommendedLesson && (
        <>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>CONTINUE LESSON</Text>
            <View style={styles.sectionLine} />
          </View>
          <ContinueLessonCard
            lesson={continueLesson}
            progressPercent={continueProgress}
            onResume={handleResumeContinue}
          />
        </>
      )}

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>REVISE SHLOKA</Text>
        <View style={styles.sectionLine} />
      </View>
      <ReviseShlokaCard shloka={dailyShloka} onRevise={handleReviseShloka} />

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>RECENT LEARNINGS CHECKLIST</Text>
        <View style={styles.sectionLine} />
      </View>
      <RecentLearningsChecklist items={recentLearnings} />

      {/* Interactive Recitation Modal */}
      <ShlokaRecitationModal
        visible={recitationModalVisible}
        shloka={dailyShloka}
        onClose={() => setRecitationModalVisible(false)}
        onComplete={handleRecitationComplete}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HomeColors.bgSandalwood,
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    gap: 8,
  },
  sectionLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: HomeColors.borderDark,
    opacity: 0.3,
  },
  sectionTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 12,
    color: HomeColors.crimsonDark,
    letterSpacing: 1.2,
  },
});
