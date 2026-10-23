import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HardShadowCard } from '@/features/home/components/HardShadowCard';
import { HomeColors } from '@/features/home/constants/homeTheme';

interface ProfileStatsCardProps {
  punyaPoints: number;
  experiencePoints: number;
  level: number;
  levelProgressPercent: number;
  dayStreak: number;
}

export const ProfileStatsCard: React.FC<ProfileStatsCardProps> = ({
  punyaPoints,
  experiencePoints,
  level,
  levelProgressPercent,
  dayStreak,
}) => {
  return (
    <HardShadowCard style={styles.outerWrapper} cardStyle={styles.card} borderRadius={22}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>K</Text>
        </View>
        <View>
          <Text style={styles.metaLabel}>USER PROFILE</Text>
          <Text style={styles.username}>LEVEL {level}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCell}>
          <Text style={styles.statNum}>{punyaPoints}</Text>
          <Text style={styles.statLabel}>PUNYA POINTS</Text>
        </View>
        <View style={[styles.statCell, styles.dividerLeft]}>
          <Text style={styles.statNum}>{experiencePoints}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
        <View style={[styles.statCell, styles.dividerLeft]}>
          <Text style={styles.statNum}>{dayStreak}</Text>
          <Text style={styles.statLabel}>DAY STREAK</Text>
        </View>
      </View>
      <View style={styles.levelProgressTrack}>
        <View style={[styles.levelProgressFill, { width: `${levelProgressPercent}%` }]} />
      </View>
      <Text style={styles.levelProgressLabel}>{levelProgressPercent}% TO NEXT LEVEL</Text>
    </HardShadowCard>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    marginBottom: 14,
    marginHorizontal: 2,
  },
  card: {
    backgroundColor: HomeColors.darkCard,
    borderWidth: 2.5,
    borderColor: HomeColors.borderDark,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    backgroundColor: HomeColors.saffronPrimary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  metaLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    color: HomeColors.goldPrimary,
  },
  username: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#332E2B',
    paddingTop: 10,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  dividerLeft: {
    borderLeftWidth: 1,
    borderLeftColor: '#332E2B',
  },
  statNum: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 20,
    color: HomeColors.goldPrimary,
  },
  statLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 9,
    color: '#AAAAAA',
  },
  levelProgressTrack: {
    backgroundColor: '#332E2B',
    borderRadius: 6,
    height: 8,
    marginTop: 12,
    overflow: 'hidden',
  },
  levelProgressFill: {
    backgroundColor: HomeColors.goldPrimary,
    height: '100%',
  },
  levelProgressLabel: {
    color: '#AAAAAA',
    fontFamily: 'Nunito_700Bold',
    fontSize: 9,
    marginTop: 5,
    textAlign: 'right',
  },
});
export default ProfileStatsCard;
