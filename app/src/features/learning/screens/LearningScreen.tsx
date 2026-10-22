import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SubTabSwitcher, type LearningTabType } from '../components/SubTabSwitcher';
import { MainPathCard } from '../components/MainPathCard';
import { ScriptureCard } from '../components/ScriptureCard';
import { PracticeCenter } from '../components/PracticeCenter';
import { useLearnerState } from '../state/useLearnerState';
import { findWeakConcepts } from '../engine/mastery';
import { useUserProgress } from '@/features/home/state/useUserProgress';
import { PATHS_DATA } from '@/features/home/data/pathsData';
import { SCRIPTURES_DATA } from '@/features/home/data/scripturesData';
import { HomeColors } from '@/features/home/constants/homeTheme';

export const LearningScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LearningTabType>('paths');
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { learnerState } = useLearnerState();
  const { progress } = useUserProgress();

  const weakConcepts = findWeakConcepts(learnerState.mastery);

  const handlePathPress = (pathId: string) => {
    router.push({
      pathname: '/learning/path-detail',
      params: { pathId },
    });
  };

  const handleScripturePress = (scriptureId: string) => {
    // Launch Ramayana / Gita lesson for scripture practice
    router.push({
      pathname: '/learning/lesson-runner',
      params: { lessonId: 'lesson_gita_sankhya_yoga' },
    });
  };

  const handleStartReview = () => {
    // Start revision with the earliest scheduled review or default to first lesson
    const firstReview = learnerState.reviews[0];
    router.push({
      pathname: '/learning/lesson-runner',
      params: { lessonId: firstReview ? 'lesson_ramayana_ayodhya_12' : 'lesson_ramayana_ayodhya_12' },
    });
  };

  const handleQuickDrill = () => {
    router.push({
      pathname: '/learning/lesson-runner',
      params: { lessonId: 'lesson_krishna_leela_kalia' },
    });
  };

  const handleWeakConceptsDrill = () => {
    router.push({
      pathname: '/learning/lesson-runner',
      params: { lessonId: 'lesson_gita_sankhya_yoga' },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + 14 }]}>
      <SubTabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'paths' && (
        <View style={styles.list}>
          {PATHS_DATA.map((path) => (
            <MainPathCard
              key={path.id}
              path={path}
              onPress={() => handlePathPress(path.id)}
            />
          ))}
        </View>
      )}

      {activeTab === 'practice' && (
        <PracticeCenter
          reviews={learnerState.reviews}
          streakDays={progress.dayStreak}
          weakConceptsCount={weakConcepts.length}
          onStartReview={handleStartReview}
          onQuickDrill={handleQuickDrill}
          onWeakConceptsDrill={handleWeakConceptsDrill}
        />
      )}

      {activeTab === 'shlokas' && (
        <View style={styles.list}>
          {SCRIPTURES_DATA.map((scripture) => (
            <ScriptureCard
              key={scripture.id}
              item={scripture}
              onPress={() => handleScripturePress(scripture.id)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HomeColors.bgSandalwood,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 24,
  },
  list: {
    gap: 4,
  },
});
export default LearningScreen;
