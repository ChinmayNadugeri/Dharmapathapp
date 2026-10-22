import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HomeColors } from '@/features/home/constants/homeTheme';
import type { Hint } from '../engine/hints';
import { SoundFeedback } from '../services/soundFeedback';

interface HintButtonProps {
  onPress: () => void;
  currentHint?: Hint;
  hintLevel: number;
  maxLevel?: number;
  disabled?: boolean;
}

export const HintButton: React.FC<HintButtonProps> = ({
  onPress,
  currentHint,
  hintLevel,
  maxLevel = 2,
  disabled = false,
}) => {
  const isMax = hintLevel >= maxLevel;

  const handlePress = () => {
    SoundFeedback.playHint();
    onPress();
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.button,
          hintLevel > 0 && styles.activeButton,
          (disabled || isMax) && styles.disabledButton,
        ]}
        onPress={handlePress}
        disabled={disabled || isMax}
        accessibilityRole="button"
        accessibilityLabel={
          isMax
            ? 'No more hints available'
            : hintLevel === 0
            ? 'Request hint'
            : 'Request stronger hint'
        }
      >
        <Text style={styles.icon}>💡</Text>
        <Text style={styles.buttonText}>
          {isMax ? 'HINTS EXHAUSTED' : hintLevel === 0 ? 'GET HINT' : `NEXT HINT (${hintLevel}/${maxLevel})`}
        </Text>
      </Pressable>

      {currentHint && (
        <View style={styles.hintCard}>
          <View style={styles.hintHeader}>
            <Text style={styles.hintLevelBadge}>HINT LEVEL {currentHint.level}</Text>
          </View>
          <Text style={styles.hintBody}>{currentHint.text}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: HomeColors.cardBg,
    borderColor: HomeColors.borderDark,
    borderRadius: 12,
    borderWidth: 2,
    borderBottomWidth: 3,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  activeButton: {
    backgroundColor: HomeColors.goldLight,
    borderColor: HomeColors.saffronDark,
  },
  disabledButton: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 16,
  },
  buttonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: HomeColors.crimsonDark,
    letterSpacing: 0.5,
  },
  hintCard: {
    backgroundColor: HomeColors.goldLight,
    borderColor: HomeColors.saffronDark,
    borderRadius: 12,
    borderWidth: 1.5,
    borderLeftWidth: 4,
    padding: 12,
    marginTop: 8,
  },
  hintHeader: {
    marginBottom: 4,
  },
  hintLevelBadge: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    color: HomeColors.saffronDark,
    letterSpacing: 1,
  },
  hintBody: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 13,
    color: HomeColors.textMain,
    lineHeight: 18,
  },
});
