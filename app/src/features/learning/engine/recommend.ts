import { findWeakConcepts, type MasteryMap } from './mastery';
import type { ReviewItem } from './spaced';

export interface Recommendation {
  kind: 'revise' | 'remediate' | 'lesson' | 'done';
  targetId?: string;
  reason: string;
}

export interface RecommendInput {
  /** Lesson ids in curriculum order. */
  lessonOrder: string[];
  completed: string[];
  mastery: MasteryMap;
  lessonConcepts: Record<string, string[]>;
  /** Already filtered to due items, earliest first. */
  dueReviews: ReviewItem[];
}

/** Priority: overdue revision, then weak-concept remediation, then the next unfinished lesson. */
export function recommendNext(input: RecommendInput): Recommendation {
  const due = input.dueReviews[0];
  if (due) return { kind: 'revise', targetId: due.id, reason: 'This is due for revision today.' };

  for (const weak of findWeakConcepts(input.mastery)) {
    const lessonId = input.lessonOrder.find((l) => input.lessonConcepts[l]?.includes(weak.conceptId));
    if (lessonId) return { kind: 'remediate', targetId: lessonId, reason: 'You have been struggling with this topic.' };
  }

  const next = input.lessonOrder.find((l) => !input.completed.includes(l));
  if (next) return { kind: 'lesson', targetId: next, reason: 'Next lesson in your path.' };
  return { kind: 'done', reason: 'You have finished every lesson.' };
}
