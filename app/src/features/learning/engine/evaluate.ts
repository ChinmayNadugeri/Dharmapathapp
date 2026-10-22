import type { QuizQuestion } from '../types/quiz.types';
import type { Answer, Evaluation } from './types';

/**
 * Lowercase, drop diacritics (so "Lakshmana" matches "Lakṣmaṇa"), strip punctuation,
 * collapse whitespace. Devanagari letters and vowel signs are kept; the danda is dropped.
 */
export function normalizeText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\u0964\u0965]/g, ' ') // danda and double danda are punctuation
    .replace(/[^a-z0-9\s\u0900-\u097f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Pure, deterministic answer checking. Throws if the answer kind does not match the question kind. */
export function evaluateAnswer(question: QuizQuestion, answer: Answer): Evaluation {
  if (answer.type !== question.type) {
    throw new TypeError(`Answer type "${answer.type}" does not match question type "${question.type}"`);
  }

  switch (question.type) {
    case 'mcq': {
      const a = answer as Extract<Answer, { type: 'mcq' }>;
      const correct = Number.isInteger(a.selectedIndex) && a.selectedIndex === question.correctIndex;
      return {
        questionId: question.id,
        correct,
        score: correct ? 1 : 0,
        explanation: question.explanation,
        expected: question.options[question.correctIndex],
      };
    }
    case 'fill_blank': {
      const a = answer as Extract<Answer, { type: 'fill_blank' }>;
      const given = normalizeText(a.text);
      const correct = given.length > 0 && question.acceptedAnswers.some((x) => normalizeText(x) === given);
      return {
        questionId: question.id,
        correct,
        score: correct ? 1 : 0,
        explanation: question.explanation,
        expected: question.acceptedAnswers[0],
      };
    }
    case 'match': {
      const a = answer as Extract<Answer, { type: 'match' }>;
      const given = new Map<string, string>();
      for (const p of a.pairs) if (!given.has(p.left)) given.set(p.left, p.right);
      const right = question.pairs.filter((p) => given.get(p.left) === p.right).length;
      const score = question.pairs.length === 0 ? 0 : right / question.pairs.length;
      return {
        questionId: question.id,
        correct: score === 1,
        score,
        explanation: question.explanation,
      };
    }
    case 'true_false': {
      const a = answer as Extract<Answer, { type: 'true_false' }>;
      const correct = a.selected === question.correctAnswer;
      return {
        questionId: question.id,
        correct,
        score: correct ? 1 : 0,
        explanation: question.explanation,
        expected: question.correctAnswer ? 'TRUE' : 'FALSE',
      };
    }
    case 'ordering': {
      const a = answer as Extract<Answer, { type: 'ordering' }>;
      const correctOrder = question.correctOrder;
      if (a.order.length !== correctOrder.length) {
        return { questionId: question.id, correct: false, score: 0, explanation: question.explanation };
      }
      const correctPositions = a.order.filter((item, i) => item === correctOrder[i]).length;
      const score = correctOrder.length === 0 ? 0 : correctPositions / correctOrder.length;
      return {
        questionId: question.id,
        correct: score === 1,
        score,
        explanation: question.explanation,
      };
    }
    case 'flashcard': {
      const a = answer as Extract<Answer, { type: 'flashcard' }>;
      // Flashcards are self-reported — we trust the learner's self-assessment.
      return {
        questionId: question.id,
        correct: a.selfReportedCorrect,
        score: a.selfReportedCorrect ? 1 : 0,
        explanation: question.explanation,
        expected: question.back,
      };
    }
  }
}
