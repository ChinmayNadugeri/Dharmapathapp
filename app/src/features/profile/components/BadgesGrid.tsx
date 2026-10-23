import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { HardShadowCard } from '@/features/home/components/HardShadowCard';
import { HomeColors } from '@/features/home/constants/homeTheme';
import { DHARMA_BADGES, type BadgeDefinition } from '../data/badgesData';
import { SoundFeedback } from '@/features/learning/services/soundFeedback';

interface BadgesGridProps {
  unlockedBadgeIds: string[];
}

export const BadgesGrid: React.FC<BadgesGridProps> = ({ unlockedBadgeIds }) => {
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);

  const handleBadgePress = (badge: BadgeDefinition, isUnlocked: boolean) => {
    if (isUnlocked) {
      SoundFeedback.playHint();
    }
    setSelectedBadge(badge);
  };

  return (
    <HardShadowCard style={styles.outerWrapper} cardStyle={styles.card} borderRadius={22}>
      <View style={styles.grid}>
        {DHARMA_BADGES.map((badge) => {
          const isUnlocked = unlockedBadgeIds.includes(badge.id);
          return (
            <TouchableOpacity
              key={badge.id}
              style={styles.badgeItem}
              onPress={() => handleBadgePress(badge, isUnlocked)}
              accessibilityRole="button"
              accessibilityLabel={`${badge.label}, ${isUnlocked ? 'Unlocked' : 'Locked'}`}
            >
              <View
                style={[
                  styles.iconCircle,
                  !isUnlocked && styles.lockedCircle,
                  isUnlocked && styles.unlockedGlow,
                ]}
              >
                <Text style={[styles.emoji, !isUnlocked && styles.lockedEmoji]}>
                  {isUnlocked ? badge.emoji : '🔒'}
                </Text>
              </View>
              <Text
                style={[styles.label, !isUnlocked && styles.lockedLabel]}
                numberOfLines={2}
              >
                {badge.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Badge Detail Inspection Modal */}
      <Modal
        visible={!!selectedBadge}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedBadge(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedBadge && (
              <>
                <View
                  style={[
                    styles.modalIconCircle,
                    unlockedBadgeIds.includes(selectedBadge.id)
                      ? styles.modalUnlockedGlow
                      : styles.lockedCircle,
                  ]}
                >
                  <Text style={styles.modalEmoji}>
                    {unlockedBadgeIds.includes(selectedBadge.id) ? selectedBadge.emoji : '🔒'}
                  </Text>
                </View>

                <Text style={styles.modalTitle}>{selectedBadge.label}</Text>

                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>
                    {unlockedBadgeIds.includes(selectedBadge.id) ? '✓ UNLOCKED' : 'LOCKED ACHIVEMENT'}
                  </Text>
                </View>

                <Text style={styles.modalDescription}>{selectedBadge.description}</Text>

                <View style={styles.criteriaBox}>
                  <Text style={styles.criteriaLabel}>HOW TO UNLOCK:</Text>
                  <Text style={styles.criteriaText}>{selectedBadge.criteriaText}</Text>
                </View>

                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedBadge(null)}
                  accessibilityRole="button"
                >
                  <Text style={styles.modalCloseText}>CLOSE</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </HardShadowCard>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    marginBottom: 14,
    marginHorizontal: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: HomeColors.borderDark,
    padding: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  badgeItem: {
    alignItems: 'center',
    gap: 4,
    width: '22%',
    minWidth: 64,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: HomeColors.borderDark,
    backgroundColor: HomeColors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedGlow: {
    borderBottomWidth: 3.5,
    borderColor: HomeColors.saffronDark,
  },
  lockedCircle: {
    backgroundColor: '#EAEAEA',
    borderColor: '#CCCCCC',
    opacity: 0.45,
  },
  emoji: {
    fontSize: 20,
  },
  lockedEmoji: {
    fontSize: 15,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Baloo2_800ExtraBold',
    color: HomeColors.textMain,
    textAlign: 'center',
    lineHeight: 13,
  },
  lockedLabel: {
    color: '#888888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFF9F2',
    borderWidth: 2.5,
    borderColor: HomeColors.borderDark,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  modalIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2.5,
    borderColor: HomeColors.borderDark,
    backgroundColor: HomeColors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalUnlockedGlow: {
    backgroundColor: HomeColors.goldLight,
    borderColor: HomeColors.saffronDark,
    borderBottomWidth: 5,
  },
  modalEmoji: {
    fontSize: 34,
  },
  modalTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 18,
    color: HomeColors.crimsonDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  statusPill: {
    backgroundColor: HomeColors.sunburstBg,
    borderWidth: 1,
    borderColor: HomeColors.borderDark,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 10,
  },
  statusPillText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9,
    color: HomeColors.textMain,
    letterSpacing: 0.8,
  },
  modalDescription: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: HomeColors.textMain,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  criteriaBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: HomeColors.borderDark,
    borderRadius: 10,
    padding: 10,
    width: '100%',
    marginBottom: 16,
  },
  criteriaLabel: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9,
    color: HomeColors.saffronDark,
    letterSpacing: 1,
    marginBottom: 2,
  },
  criteriaText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 12,
    color: HomeColors.textMuted,
  },
  modalCloseBtn: {
    backgroundColor: HomeColors.darkCard,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: HomeColors.borderDark,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  modalCloseText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
