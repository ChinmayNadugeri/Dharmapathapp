export interface ScholarRank {
  id: string;
  name: string;
  avatarEmoji: string;
  punyaPoints: number;
  level: number;
  isCurrentUser?: boolean;
  streakDays: number;
}

export function generateLeagueScholars(userPunyaPoints: number, userDayStreak: number): ScholarRank[] {
  const peers: ScholarRank[] = [
    { id: 's1', name: 'Aarav Shastri', avatarEmoji: '🪶', punyaPoints: userPunyaPoints + 75, level: 5, streakDays: 14 },
    { id: 's2', name: 'Meera Devi', avatarEmoji: '🌸', punyaPoints: userPunyaPoints + 45, level: 4, streakDays: 9 },
    { id: 's3', name: 'Rohan Vidyanand', avatarEmoji: '🏹', punyaPoints: userPunyaPoints + 20, level: 4, streakDays: 7 },
    { id: 'user', name: 'You (Sadhaka)', avatarEmoji: '🪔', punyaPoints: userPunyaPoints, level: 3, isCurrentUser: true, streakDays: userDayStreak },
    { id: 's4', name: 'Priya Sundaram', avatarEmoji: '🔱', punyaPoints: Math.max(0, userPunyaPoints - 25), level: 3, streakDays: 4 },
    { id: 's5', name: 'Vikramaditya', avatarEmoji: '🛡️', punyaPoints: Math.max(0, userPunyaPoints - 60), level: 2, streakDays: 3 },
    { id: 's6', name: 'Ananya Sharma', avatarEmoji: '✨', punyaPoints: Math.max(0, userPunyaPoints - 95), level: 2, streakDays: 2 },
  ];

  return peers.sort((a, b) => b.punyaPoints - a.punyaPoints);
}
