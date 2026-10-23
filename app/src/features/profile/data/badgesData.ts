export interface BadgeDefinition {
  id: string;
  emoji: string;
  label: string;
  description: string;
  category: 'milestone' | 'streak' | 'mastery' | 'devotion';
  criteriaText: string;
}

export const DHARMA_BADGES: BadgeDefinition[] = [
  {
    id: 'first_lesson',
    emoji: '🏆',
    label: 'First Step of Dharma',
    description: 'Began your journey by completing your first sacred lesson.',
    category: 'milestone',
    criteriaText: 'Complete 1 lesson',
  },
  {
    id: 'streak_3',
    emoji: '🔥',
    label: 'Tapasvi (3-Day Streak)',
    description: 'Cultivated inner discipline with 3 consecutive days of sacred study.',
    category: 'streak',
    criteriaText: 'Maintain a 3-day active streak',
  },
  {
    id: 'streak_7',
    emoji: '⚡',
    label: 'Sadhaka Flame (7-Day Streak)',
    description: 'A full week of uninterrupted daily spiritual contemplation.',
    category: 'streak',
    criteriaText: 'Maintain a 7-day active streak',
  },
  {
    id: 'punya_100',
    emoji: '🪔',
    label: 'Punya Scholar',
    description: 'Accumulated 100+ Punya merit points through diligent study.',
    category: 'devotion',
    criteriaText: 'Reach 100 Punya points',
  },
  {
    id: 'scholar',
    emoji: '📜',
    label: 'Upanishadic Sage',
    description: 'Mastered 5 or more comprehensive scriptural lessons.',
    category: 'milestone',
    criteriaText: 'Complete 5 lessons',
  },
  {
    id: 'perfect_accuracy',
    emoji: '💎',
    label: 'Flawless Disciple',
    description: 'Conquered a complete lesson with 100% first-try accuracy.',
    category: 'mastery',
    criteriaText: 'Finish any lesson with 100% accuracy',
  },
  {
    id: 'recitation_initiate',
    emoji: '🗣️',
    label: 'Vani Initiate',
    description: 'Practiced chanting and reciting sacred Gita shlokas aloud.',
    category: 'devotion',
    criteriaText: 'Complete 1 Shloka recitation',
  },
  {
    id: 'char_dham_pilgrim',
    emoji: '🏔️',
    label: 'Tirtha Yatri',
    description: 'Explored the sacred Himalayan heights of Kedarnath and holy Char Dham.',
    category: 'milestone',
    criteriaText: 'Complete Kedarnath pilgrimage lesson',
  },
];
