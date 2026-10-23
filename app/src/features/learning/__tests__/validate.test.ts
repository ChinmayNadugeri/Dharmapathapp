import { describe, expect, it } from '@jest/globals';
import {
  validateLesson,
  validateLessons,
  assertValidLessons,
  type ValidationResult,
} from '../engine/validate';
import type {
  QuizLesson,
  MCQQuestion,
  FillBlankQuestion,
  MatchQuestion,
  TrueFalseQuestion,
  OrderingQuestion,
  FlashcardQuestion,
} from '../types/quiz.types';
import { QUIZ_LESSONS } from '../data/quizData';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validMCQ: MCQQuestion = {
  id: 'mcq1', type: 'mcq', question: 'Pick one',
  options: ['A', 'B', 'C', 'D'], correctIndex: 2, explanation: 'Because C.',
};
const validFill: FillBlankQuestion = {
  id: 'fill1', type: 'fill_blank', question: 'Who?',
  acceptedAnswers: ['Rama', 'Ram'], explanation: 'It is Rama.',
};
const validMatch: MatchQuestion = {
  id: 'match1', type: 'match', explanation: 'Pairs.',
  pairs: [{ left: 'A', right: '1' }, { left: 'B', right: '2' }],
};
const validTF: TrueFalseQuestion = {
  id: 'tf1', type: 'true_false', statement: 'Sky is blue.',
  correctAnswer: true, explanation: 'It is.',
};
const validOrdering: OrderingQuestion = {
  id: 'ord1', type: 'ordering', instruction: 'Order these',
  correctOrder: ['One', 'Two', 'Three'], explanation: 'Ascending.',
};
const validFlashcard: FlashcardQuestion = {
  id: 'fc1', type: 'flashcard', front: 'Prompt',
  back: 'Answer', explanation: 'Here.',
};

function makeLesson(overrides?: Partial<QuizLesson>): QuizLesson {
  return {
    id: 'test_lesson',
    title: 'Test Lesson',
    pointsAwarded: 50,
    questions: [validMCQ],
    ...overrides,
  };
}

function expectValid(result: ValidationResult): void {
  expect(result.valid).toBe(true);
  expect(result.errors).toHaveLength(0);
}

function expectInvalid(result: ValidationResult, minErrors = 1): void {
  expect(result.valid).toBe(false);
  expect(result.errors.length).toBeGreaterThanOrEqual(minErrors);
}

function errorPaths(result: ValidationResult): string[] {
  return result.errors.map((e) => e.path);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('validateLesson — lesson-level checks', () => {
  it('passes a well-formed lesson with one question', () => {
    expectValid(validateLesson(makeLesson()));
  });

  it('passes a lesson with all 6 question types', () => {
    expectValid(validateLesson(makeLesson({
      questions: [validMCQ, validFill, validMatch, validTF, validOrdering, validFlashcard],
    })));
  });

  it('rejects an empty lesson id', () => {
    const r = validateLesson(makeLesson({ id: '' }));
    expectInvalid(r);
    expect(errorPaths(r).some((p) => p.includes('.id'))).toBe(true);
  });

  it('rejects an empty title', () => {
    const r = validateLesson(makeLesson({ title: '   ' }));
    expectInvalid(r);
    expect(errorPaths(r).some((p) => p.includes('.title'))).toBe(true);
  });

  it('rejects zero or negative pointsAwarded', () => {
    expectInvalid(validateLesson(makeLesson({ pointsAwarded: 0 })));
    expectInvalid(validateLesson(makeLesson({ pointsAwarded: -10 })));
  });

  it('rejects a lesson with no questions', () => {
    expectInvalid(validateLesson(makeLesson({ questions: [] })));
  });

  it('rejects duplicate question ids within a lesson', () => {
    const dup = { ...validFill, id: 'mcq1' }; // same id as validMCQ
    const r = validateLesson(makeLesson({ questions: [validMCQ, dup] }));
    expectInvalid(r);
    expect(r.errors.some((e) => e.message.includes('Duplicate question id'))).toBe(true);
  });
});

describe('validateLesson — MCQ checks', () => {
  it('rejects correctIndex out of bounds', () => {
    const q: MCQQuestion = { ...validMCQ, correctIndex: 10 };
    const r = validateLesson(makeLesson({ questions: [q] }));
    expectInvalid(r);
    expect(r.errors.some((e) => e.message.includes('out of bounds'))).toBe(true);
  });

  it('rejects fewer than 2 options', () => {
    const q: MCQQuestion = { ...validMCQ, options: ['Only one'] };
    expectInvalid(validateLesson(makeLesson({ questions: [q] })));
  });

  it('rejects negative correctIndex', () => {
    const q: MCQQuestion = { ...validMCQ, correctIndex: -1 };
    expectInvalid(validateLesson(makeLesson({ questions: [q] })));
  });

  it('warns on duplicate options', () => {
    const q: MCQQuestion = { ...validMCQ, options: ['A', 'A', 'B', 'C'], correctIndex: 0 };
    const r = validateLesson(makeLesson({ questions: [q] }));
    expect(r.warnings.some((w) => w.message.includes('duplicates'))).toBe(true);
  });

  it('rejects empty question text', () => {
    const q: MCQQuestion = { ...validMCQ, question: '' };
    expectInvalid(validateLesson(makeLesson({ questions: [q] })));
  });
});

describe('validateLesson — fill_blank checks', () => {
  it('rejects empty acceptedAnswers', () => {
    const q: FillBlankQuestion = { ...validFill, acceptedAnswers: [] };
    expectInvalid(validateLesson(makeLesson({ questions: [q] })));
  });

  it('rejects blank string in acceptedAnswers', () => {
    const q: FillBlankQuestion = { ...validFill, acceptedAnswers: [''] };
    expectInvalid(validateLesson(makeLesson({ questions: [q] })));
  });
});

describe('validateLesson — match checks', () => {
  it('rejects fewer than 2 pairs', () => {
    const q: MatchQuestion = { ...validMatch, pairs: [{ left: 'A', right: '1' }] };
    expectInvalid(validateLesson(makeLesson({ questions: [q] })));
  });

  it('rejects duplicate left-side values', () => {
    const q: MatchQuestion = {
      ...validMatch,
      pairs: [{ left: 'A', right: '1' }, { left: 'A', right: '2' }],
    };
    const r = validateLesson(makeLesson({ questions: [q] }));
    expectInvalid(r);
    expect(r.errors.some((e) => e.message.includes('Duplicate left-side'))).toBe(true);
  });

  it('rejects empty pair values', () => {
    const q: MatchQuestion = {
      ...validMatch,
      pairs: [{ left: '', right: '1' }, { left: 'B', right: '' }],
    };
    const r = validateLesson(makeLesson({ questions: [q] }));
    expectInvalid(r);
  });
});

describe('validateLesson — true_false checks', () => {
  it('rejects non-boolean correctAnswer', () => {
    const q = { ...validTF, correctAnswer: 'yes' } as unknown as TrueFalseQuestion;
    expectInvalid(validateLesson(makeLesson({ questions: [q] })));
  });

  it('rejects empty statement', () => {
    const q: TrueFalseQuestion = { ...validTF, statement: '' };
    expectInvalid(validateLesson(makeLesson({ questions: [q] })));
  });
});

describe('validateLesson — ordering checks', () => {
  it('rejects fewer than 2 items', () => {
    const q: OrderingQuestion = { ...validOrdering, correctOrder: ['Only'] };
    expectInvalid(validateLesson(makeLesson({ questions: [q] })));
  });

  it('warns on duplicate ordering items', () => {
    const q: OrderingQuestion = { ...validOrdering, correctOrder: ['A', 'A', 'B'] };
    const r = validateLesson(makeLesson({ questions: [q] }));
    expect(r.warnings.some((w) => w.message.includes('duplicates'))).toBe(true);
  });

  it('rejects empty instruction', () => {
    const q: OrderingQuestion = { ...validOrdering, instruction: '' };
    expectInvalid(validateLesson(makeLesson({ questions: [q] })));
  });
});

describe('validateLesson — flashcard checks', () => {
  it('rejects empty front', () => {
    const q: FlashcardQuestion = { ...validFlashcard, front: '' };
    expectInvalid(validateLesson(makeLesson({ questions: [q] })));
  });

  it('rejects empty back', () => {
    const q: FlashcardQuestion = { ...validFlashcard, back: '' };
    expectInvalid(validateLesson(makeLesson({ questions: [q] })));
  });
});

describe('validateLesson — common field checks', () => {
  it('rejects missing explanation', () => {
    const q = { ...validMCQ, explanation: '' };
    expectInvalid(validateLesson(makeLesson({ questions: [q] })));
  });

  it('rejects invalid difficulty', () => {
    const q = { ...validMCQ, difficulty: 'extreme' as 'easy' };
    expectInvalid(validateLesson(makeLesson({ questions: [q] })));
  });

  it('rejects blank conceptId when present', () => {
    const q = { ...validMCQ, conceptId: '  ' };
    expectInvalid(validateLesson(makeLesson({ questions: [q] })));
  });

  it('rejects invalid hints', () => {
    const q = { ...validMCQ, hints: ['Good hint', ''] };
    expectInvalid(validateLesson(makeLesson({ questions: [q] })));
  });

  it('allows valid optional fields', () => {
    const q: MCQQuestion = {
      ...validMCQ,
      difficulty: 'hard',
      conceptId: 'dharma_basics',
      hints: ['Think about dharma', 'Consider the Vedas'],
    };
    expectValid(validateLesson(makeLesson({ questions: [q] })));
  });
});

describe('validateLessons — cross-lesson checks', () => {
  it('detects duplicate lesson ids', () => {
    const r = validateLessons([makeLesson(), makeLesson()]);
    expectInvalid(r);
    expect(r.errors.some((e) => e.message.includes('Duplicate lesson id'))).toBe(true);
  });

  it('detects duplicate question ids across lessons', () => {
    const a = makeLesson({ id: 'L1', questions: [{ ...validMCQ, id: 'shared' }] });
    const b = makeLesson({ id: 'L2', questions: [{ ...validFill, id: 'shared' }] });
    const r = validateLessons([a, b]);
    expectInvalid(r);
    expect(r.errors.some((e) => e.message.includes('Duplicate question id') && e.message.includes('across'))).toBe(true);
  });

  it('passes distinct lessons with distinct question ids', () => {
    const a = makeLesson({ id: 'L1', questions: [{ ...validMCQ, id: 'q1' }] });
    const b = makeLesson({ id: 'L2', questions: [{ ...validFill, id: 'q2' }] });
    expectValid(validateLessons([a, b]));
  });
});

describe('assertValidLessons', () => {
  it('throws on invalid content', () => {
    expect(() => assertValidLessons([makeLesson({ id: '' })])).toThrow('validation failed');
  });

  it('does not throw on valid content', () => {
    expect(() => assertValidLessons([makeLesson()])).not.toThrow();
  });
});

describe('existing QUIZ_LESSONS pass schema validation', () => {
  it('all shipped quiz content is valid', () => {
    const result = validateLessons(QUIZ_LESSONS);
    if (!result.valid) {
      const lines = result.errors.map((e) => `  [${e.path}] ${e.message}`);
      throw new Error(`Shipped quiz content has validation errors:\n${lines.join('\n')}`);
    }
    expect(result.valid).toBe(true);
  });

  it('reports any content quality warnings', () => {
    const result = validateLessons(QUIZ_LESSONS);
    // Log warnings for visibility but don't fail the test
    if (result.warnings.length > 0) {
      console.warn(`Schema validator found ${result.warnings.length} warning(s):`);
      result.warnings.forEach((w) => console.warn(`  ⚠ [${w.path}] ${w.message}`));
    }
    // This test always passes — warnings are informational
    expect(result).toBeDefined();
  });
});
