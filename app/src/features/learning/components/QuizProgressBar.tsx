import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HomeColors } from '@/features/home/constants/homeTheme';

interface QuizProgressBarProps {
  current: number;
  total: number;
}

export const QuizProgressBar: React.FC<QuizProgressBarProps> = ({ current, total }) => {
  const progress = total === 0 ? 0 : current / total;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>QUESTION {current} OF {total}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(1, progress) * 100}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: {
    color: HomeColors.textMuted,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  track: {
    backgroundColor: HomeColors.goldLight,
    borderColor: HomeColors.borderDark,
    borderRadius: 8,
    borderWidth: 1.5,
    height: 10,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: HomeColors.saffronPrimary,
    height: '100%',
  },
});
