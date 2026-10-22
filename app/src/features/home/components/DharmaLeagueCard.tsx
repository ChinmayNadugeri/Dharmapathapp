import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HardShadowCard } from './HardShadowCard';
import { HomeColors } from '../constants/homeTheme';
import type { LeagueInfo } from '@/features/home/types/progress.types';
import { generateLeagueScholars, type ScholarRank } from '../data/scholarsData';

interface DharmaLeagueCardProps {
  leagueInfo: LeagueInfo;
  userStreakDays?: number;
}

export const DharmaLeagueCard: React.FC<DharmaLeagueCardProps> = ({
  leagueInfo,
  userStreakDays = 1,
}) => {
  const [expanded, setExpanded] = useState(false);
  const scholars: ScholarRank[] = generateLeagueScholars(
    Math.round(leagueInfo.progressPercent * 5),
    userStreakDays,
  );

  return (
    <HardShadowCard style={styles.outerWrapper} cardStyle={styles.card}>
      <LinearGradient
        colors={[HomeColors.saffronPrimary, HomeColors.saffronDark]}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>🛡️ {leagueInfo.tier} SADHAKA DIVISION</Text>
          <View style={styles.topBadge}>
            <Text style={styles.badgeText}>TOP 5%</Text>
          </View>
        </View>

        <View style={styles.progressBarBg}>
          <LinearGradient
            colors={[HomeColors.goldLight, HomeColors.goldPrimary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${leagueInfo.progressPercent}%` }]}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            RANK {leagueInfo.rank} OF {leagueInfo.totalScholars} SCHOLARS
          </Text>
          <Text style={styles.footerText}>
            PROMOTION IN {leagueInfo.daysToPromotion} DAYS
          </Text>
        </View>

        {/* Expandable Leaderboard Ranks */}
        <TouchableOpacity
          style={styles.expandToggle}
          onPress={() => setExpanded(!expanded)}
          accessibilityRole="button"
        >
          <Text style={styles.expandToggleText}>
            {expanded ? 'HIDE LEADERBOARD ▲' : 'VIEW DIVISION LEADERBOARD ▼'}
          </Text>
        </TouchableOpacity>

        {expanded && (
          <View style={styles.leaderboardSection}>
            <View style={styles.leaderboardDivider} />
            <Text style={styles.leaderboardSub}>PROMOTION ZONE (TOP 3 EARN NEXT TIER)</Text>
            {scholars.map((scholar, idx) => {
              const isPromoted = idx < 3;
              return (
                <View
                  key={scholar.id}
                  style={[
                    styles.scholarRow,
                    scholar.isCurrentUser && styles.currentUserRow,
                  ]}
                >
                  <View style={styles.rankCol}>
                    <Text
                      style={[
                        styles.rankNum,
                        scholar.isCurrentUser && styles.currentUserText,
                      ]}
                    >
                      #{idx + 1}
                    </Text>
                    {isPromoted && <Text style={styles.upArrow}>▲</Text>}
                  </View>

                  <Text style={styles.avatarEmoji}>{scholar.avatarEmoji}</Text>

                  <View style={styles.nameCol}>
                    <Text
                      style={[
                        styles.scholarName,
                        scholar.isCurrentUser && styles.currentUserText,
                      ]}
                      numberOfLines={1}
                    >
                      {scholar.name}
                    </Text>
                    <Text style={styles.scholarDetails}>
                      Level {scholar.level} • {scholar.streakDays}d streak
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.scholarPunya,
                      scholar.isCurrentUser && styles.currentUserText,
                    ]}
                  >
                    {scholar.punyaPoints} PTS
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </LinearGradient>
    </HardShadowCard>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    marginBottom: 16,
    marginHorizontal: 2,
  },
  card: {
    borderWidth: 2.5,
    borderColor: HomeColors.borderDark,
    borderRadius: 22,
    overflow: 'hidden',
  },
  container: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  topBadge: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    color: '#FFF8E1',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    color: '#FFF8E1',
  },
  expandToggle: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  expandToggleText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  leaderboardSection: {
    marginTop: 8,
  },
  leaderboardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 6,
  },
  leaderboardSub: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9,
    color: HomeColors.goldLight,
    letterSpacing: 1,
    marginBottom: 8,
  },
  scholarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginVertical: 3,
    gap: 8,
  },
  currentUserRow: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: HomeColors.goldPrimary,
  },
  rankCol: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 28,
  },
  rankNum: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  upArrow: {
    fontSize: 8,
    color: '#A5D6A7',
    marginLeft: 2,
  },
  avatarEmoji: {
    fontSize: 16,
  },
  nameCol: {
    flex: 1,
  },
  scholarName: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  scholarDetails: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 9,
    color: '#FFECB3',
  },
  currentUserText: {
    color: HomeColors.crimsonDark,
  },
  scholarPunya: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    color: HomeColors.goldLight,
  },
});
