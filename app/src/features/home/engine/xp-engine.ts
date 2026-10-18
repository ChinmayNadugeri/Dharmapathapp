export const XP_PER_LEVEL = 100;

export function getLevelForXp(experiencePoints: number): number {
  return Math.floor(Math.max(0, experiencePoints) / XP_PER_LEVEL) + 1;
}

export function getXpIntoCurrentLevel(experiencePoints: number): number {
  return Math.max(0, experiencePoints) % XP_PER_LEVEL;
}

export function getXpToNextLevel(experiencePoints: number): number {
  return XP_PER_LEVEL - getXpIntoCurrentLevel(experiencePoints);
}

export function getLevelProgressPercent(experiencePoints: number): number {
  return Math.round((getXpIntoCurrentLevel(experiencePoints) / XP_PER_LEVEL) * 100);
}
