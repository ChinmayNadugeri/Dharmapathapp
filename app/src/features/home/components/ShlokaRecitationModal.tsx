import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { HomeColors } from '@/features/home/constants/homeTheme';
import type { ShlokaItem } from '@/features/scriptures/types/scripture.types';
import { getAllScriptures } from '@/features/scriptures/services/scripture-service';
import { SoundFeedback } from '@/features/learning/services/soundFeedback';

interface ShlokaRecitationModalProps {
  visible: boolean;
  shloka: ShlokaItem | null;
  onClose: () => void;
  onComplete: (earnedXp: number) => void;
}

export const ShlokaRecitationModal: React.FC<ShlokaRecitationModalProps> = ({
  visible,
  shloka,
  onClose,
  onComplete,
}) => {
  const [stage, setStage] = useState<'listen' | 'recite' | 'revealed'>('listen');
  const [completed, setCompleted] = useState(false);

  if (!shloka) return null;

  const englishTranslation = shloka.translations.find((t) => t.language === 'en')?.text || '';

  const handleNextStage = () => {
    if (stage === 'listen') {
      SoundFeedback.playHint();
      setStage('recite');
    } else if (stage === 'recite') {
      SoundFeedback.playCorrect();
      setStage('revealed');
      setCompleted(true);
    } else {
      SoundFeedback.playLevelUp();
      onComplete(15);
      onClose();
      // Reset for next time
      setTimeout(() => {
        setStage('listen');
        setCompleted(false);
      }, 300);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>SANSKRIT RECITATION PRACTICE</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>
            {shloka.chapter
              ? `Bhagavad Gita • Chapter ${shloka.chapter}, Verse ${shloka.verse}`
              : shloka.title?.english || 'Sacred Scripture Recitation'}
          </Text>

          {/* Stepper instructions */}
          <View style={styles.stepperRow}>
            <Text style={[styles.stepItem, stage === 'listen' && styles.stepActive]}>
              1. Contemplate
            </Text>
            <Text style={styles.stepArrow}>→</Text>
            <Text style={[styles.stepItem, stage === 'recite' && styles.stepActive]}>
              2. Recite Aloud
            </Text>
            <Text style={styles.stepArrow}>→</Text>
            <Text style={[styles.stepItem, stage === 'revealed' && styles.stepActive]}>
              3. Meaning
            </Text>
          </View>

          {/* Sanskrit verses */}
          <View style={styles.sanskritCard}>
            <Text style={styles.sanskritText}>{shloka.sanskrit_text}</Text>
          </View>

          {/* Transliteration */}
          {shloka.iast_transliteration ? (
            <View style={styles.translitBox}>
              <Text style={styles.translitLabel}>TRANSLITERATION (IAST):</Text>
              <Text style={styles.translitText}>{shloka.iast_transliteration}</Text>
            </View>
          ) : null}

          {/* Meaning Revealed */}
          {stage === 'revealed' && (
            <View style={styles.meaningBox}>
              <Text style={styles.meaningLabel}>SACRED MEANING:</Text>
              <Text style={styles.meaningText}>"{englishTranslation}"</Text>
            </View>
          )}

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleNextStage}
            accessibilityRole="button"
          >
            <Text style={styles.actionButtonText}>
              {stage === 'listen'
                ? 'READY TO RECITE 🗣️'
                : stage === 'recite'
                ? 'I HAVE RECITED IT ✓'
                : 'COMPLETE REVISION (+15 XP) 🎉'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#FFF9F2',
    borderWidth: 2.5,
    borderColor: HomeColors.borderDark,
    borderRadius: 22,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: HomeColors.goldLight,
    borderWidth: 1.5,
    borderColor: HomeColors.borderDark,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9,
    color: HomeColors.saffronDark,
    letterSpacing: 1,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: HomeColors.cardBg,
    borderWidth: 1.5,
    borderColor: HomeColors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 12,
    color: HomeColors.crimsonDark,
  },
  title: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 16,
    color: HomeColors.crimsonDark,
    marginBottom: 12,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 14,
  },
  stepItem: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 10,
    color: HomeColors.textMuted,
  },
  stepActive: {
    color: HomeColors.saffronDark,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  stepArrow: {
    fontSize: 10,
    color: HomeColors.textMuted,
  },
  sanskritCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: HomeColors.borderDark,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  sanskritText: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 17,
    color: HomeColors.crimsonDark,
    textAlign: 'center',
    lineHeight: 26,
  },
  translitBox: {
    backgroundColor: HomeColors.goldLight,
    borderWidth: 1,
    borderColor: HomeColors.saffronDark,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  translitLabel: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9,
    color: HomeColors.saffronDark,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  translitText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 12,
    color: HomeColors.textMain,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  meaningBox: {
    backgroundColor: HomeColors.emeraldLight,
    borderWidth: 1,
    borderColor: HomeColors.emeraldGreen,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  meaningLabel: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9,
    color: HomeColors.emeraldGreen,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  meaningText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: HomeColors.textMain,
    lineHeight: 18,
  },
  actionButton: {
    backgroundColor: HomeColors.darkCard,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: HomeColors.borderDark,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
