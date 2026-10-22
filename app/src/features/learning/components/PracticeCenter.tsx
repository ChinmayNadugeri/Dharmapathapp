import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HomeColors } from '@/features/home/constants/homeTheme';
import { HardShadowCard } from '@/features/home/components/HardShadowCard';
import type { ReviewItem } from '../engine/spaced';
import { toLocalDateKey } from '../engine/date';

interface PracticeCenterProps {
  reviews: ReviewItem[];
  streakDays: number;
  weakConceptsCount: number;
  onStartReview: () => void;
  onQuickDrill: () => void;
  onWeakConceptsDrill: () => void;
}

export const PracticeCenter: React.FC<PracticeCenterProps> = ({
  reviews,
  streakDays,
  weakConceptsCount,
  onStartReview,
  onQuickDrill,
  onWeakConceptsDrill,
}) => {
  const todayKey = toLocalDateKey(new Date());
  const dueCount = reviews.filter((r) => r.dueDate <= todayKey).length;

  return (
    <View style={styles.container}>
      {/* Daily Practice Streak & Target Header */}
      <HardShadowCard style={styles.cardWrapper} cardStyle={styles.streakCard} borderRadius={18}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.eyebrow}>DAILY DHARMA GOAL</Text>
            <Text style={styles.streakTitle}>{streakDays} DAY STREAK 🔥</Text>
          </View>
          <View style={styles.goalPill}>
            <Text style={styles.goalText}>🎯 2/3 COMPLETE</Text>
          </View>
        </View>
        <Text style={styles.streakSubtitle}>
          Consistent daily practice strengthens long-term concept recall and preserves your league standing.
        </Text>
      </HardShadowCard>

      {/* Leitner Spaced Review Queue Card */}
      <HardShadowCard style={styles.cardWrapper} cardStyle={styles.actionCard} borderRadius={16}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>⏳</Text>
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.cardTitle}>Spaced Repetition Review</Text>
            <Text style={styles.cardSubtitle}>
              {dueCount > 0
                ? `${dueCount} question${dueCount > 1 ? 's' : ''} scheduled for revision today`
                : 'All reviews are up to date! Great job!'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryActionBtn, dueCount === 0 && styles.disabledBtn]}
          onPress={onStartReview}
          disabled={dueCount === 0}
          accessibilityRole="button"
        >
          <Text style={styles.primaryActionText}>
            {dueCount > 0 ? `START REVIEW (${dueCount} DUE)` : 'NO REVIEWS DUE'}
          </Text>
        </TouchableOpacity>
      </HardShadowCard>

      {/* Weak Concept Mastery Remediation Drill */}
      <HardShadowCard style={styles.cardWrapper} cardStyle={styles.actionCard} borderRadius={16}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>🎯</Text>
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.cardTitle}>Weak Concept Mastery</Text>
            <Text style={styles.cardSubtitle}>
              {weakConceptsCount > 0
                ? `${weakConceptsCount} topic${weakConceptsCount > 1 ? 's' : ''} where accuracy dipped below 50%`
                : 'High concept mastery across all tested themes'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.secondaryActionBtn}
          onPress={onWeakConceptsDrill}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryActionText}>PRACTICE WEAK CONCEPTS</Text>
        </TouchableOpacity>
      </HardShadowCard>

      {/* Rapid Fire Daily Quiz Drill */}
      <HardShadowCard style={styles.cardWrapper} cardStyle={styles.actionCard} borderRadius={16}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>⚡</Text>
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.cardTitle}>Rapid Fire Daily Drill</Text>
            <Text style={styles.cardSubtitle}>
              5 quick questions mixing epics, Gita philosophy, and holy tirthas
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.goldActionBtn}
          onPress={onQuickDrill}
          accessibilityRole="button"
        >
          <Text style={styles.goldActionText}>START RAPID DRILL (+25 XP)</Text>
        </TouchableOpacity>
      </HardShadowCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  cardWrapper: {
    marginBottom: 8,
  },
  streakCard: {
    backgroundColor: '#FFF9F2',
    borderWidth: 2.5,
    borderColor: HomeColors.borderDark,
    padding: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eyebrow: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    color: HomeColors.saffronDark,
    letterSpacing: 1.2,
  },
  streakTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 22,
    color: HomeColors.crimsonDark,
    marginTop: 2,
  },
  goalPill: {
    backgroundColor: HomeColors.goldLight,
    borderWidth: 1.5,
    borderColor: HomeColors.borderDark,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  goalText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    color: HomeColors.textMain,
  },
  streakSubtitle: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 12,
    color: HomeColors.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: HomeColors.borderDark,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: HomeColors.goldLight,
    borderWidth: 1.5,
    borderColor: HomeColors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  headerTextCol: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 16,
    color: HomeColors.crimsonDark,
  },
  cardSubtitle: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 12,
    color: HomeColors.textMuted,
    marginTop: 2,
  },
  primaryActionBtn: {
    backgroundColor: HomeColors.darkCard,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: HomeColors.borderDark,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  secondaryActionBtn: {
    backgroundColor: HomeColors.sunburstBg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: HomeColors.borderDark,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: HomeColors.crimsonDark,
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  goldActionBtn: {
    backgroundColor: HomeColors.goldPrimary,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: HomeColors.borderDark,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  goldActionText: {
    color: HomeColors.textMain,
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
