import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HomeColors } from '@/features/home/constants/homeTheme';
import { HardShadowCard } from '@/features/home/components/HardShadowCard';

export type LearningTabType = 'paths' | 'practice' | 'shlokas';

interface SubTabSwitcherProps {
  activeTab: LearningTabType;
  onTabChange: (tab: LearningTabType) => void;
}

export const SubTabSwitcher: React.FC<SubTabSwitcherProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: LearningTabType; label: string }[] = [
    { id: 'paths', label: 'PATHS' },
    { id: 'practice', label: 'PRACTICE' },
    { id: 'shlokas', label: 'SHLOKAS' },
  ];

  return (
    <View style={styles.tabSwitcher}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        if (isActive) {
          return (
            <HardShadowCard
              key={tab.id}
              style={styles.tabShadowWrapper}
              cardStyle={styles.activePill}
              borderRadius={10}
            >
              <Text style={styles.activeText}>{tab.label}</Text>
            </HardShadowCard>
          );
        }
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.inactivePill}
            onPress={() => onTabChange(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: false }}
          >
            <Text style={styles.inactiveText}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#EFE7DA',
    padding: 4,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: HomeColors.borderDark,
    marginBottom: 14,
    gap: 4,
  },
  tabShadowWrapper: {
    flex: 1,
    marginHorizontal: 0,
  },
  activePill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: HomeColors.borderDark,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 11,
    color: HomeColors.crimsonDark,
  },
  inactivePill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 11,
    color: HomeColors.textMuted,
  },
});
