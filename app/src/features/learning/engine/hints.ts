import type { QuizQuestion } from '../types/quiz.types';

export const MAX_HINT_LEVEL = 2;

export interface Hint {
  level: number;
  text: string;
  /** MCQ only: option indexes to grey out. */
  eliminatedOptions?: number[];
}

/** Staged hints. Level 1 is a nudge, level 2 narrows the choice. Neither gives the full answer. */
export function getHint(question: QuizQuestion, requestedLevel: number): Hint {
  const level = Math.min(Math.max(Math.floor(requestedLevel), 1), MAX_HINT_LEVEL);
  const authored = question.hints?.[level - 1];

  switch (question.type) {
    case 'mcq': {
      if (level === 1) {
        return { level, text: authored ?? 'Re-read the question and rule out options that do not fit.' };
      }
      const wrong = question.options.map((_, i) => i).filter((i) => i !== question.correctIndex);
      const eliminatedOptions = wrong.slice(0, Math.max(0, Math.min(2, wrong.length - 1)));
      return { level, text: authored ?? 'Two wrong options have been removed.', eliminatedOptions };
    }
    case 'fill_blank': {
      const target = question.acceptedAnswers[0] ?? '';
      return {
        level,
        text:
          authored ??
          (level === 1 ? `The answer has ${target.length} letters.` : `It starts with "${target.charAt(0)}".`),
      };
    }
    case 'match': {
      const first = question.pairs[0];
      return {
        level,
        text:
          authored ??
          (level === 1 || !first
            ? 'Start with the pair you are most sure about.'
            : `"${first.left}" goes with "${first.right}".`),
      };
    }
    case 'true_false': {
      return {
        level,
        text:
          authored ??
          (level === 1
            ? 'Read the statement carefully. Does every part of it hold true?'
            : 'Think about what you learned in the lesson.'),
      };
    }
    case 'ordering': {
      const first = question.correctOrder[0];
      return {
        level,
        text:
          authored ??
          (level === 1
            ? 'Think about what comes first in the sequence.'
            : first
              ? `The first item is "${first}".`
              : 'Try to recall the sequence from the lesson.'),
      };
    }
    case 'flashcard': {
      return {
        level,
        text:
          authored ??
          (level === 1
            ? 'Try to recall the answer before flipping the card.'
            : 'Think about the context where you learned this concept.'),
      };
    }
  }
}
