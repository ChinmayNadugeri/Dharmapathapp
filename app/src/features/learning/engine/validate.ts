/**
 * validate.ts — Lesson content schema validator.
 *
 * Pure functions that check structural, semantic, and cross-lesson invariants
 * for quiz content at runtime.  Zero external dependencies — mirrors the
 * project's engine philosophy.
 *
 * Usage:
 *   const result = validateLesson(lesson);
 *   if (!result.valid) console.error(result.errors);
 *
 *   const batch = validateLessons(QUIZ_LESSONS);
 *   if (!batch.valid) console.error(batch.errors);
 */

import type {
  QuizLesson,
  QuizQuestion,
  MCQQuestion,
  FillBlankQuestion,
  MatchQuestion,
  TrueFalseQuestion,
  OrderingQuestion,
  FlashcardQuestion,
} from '../types/quiz.types';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface ValidationError {
  /** Dot-path to the offending field, e.g. "questions[2].correctIndex". */
  path: string;
  /** Human-readable description of the problem. */
  message: string;
  /** Severity: 'error' breaks the engine, 'warning' is a quality issue. */
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VALID_TYPES = new Set(['mcq', 'fill_blank', 'match', 'true_false', 'ordering', 'flashcard']);
const VALID_DIFFICULTIES = new Set(['easy', 'medium', 'hard']);
const MIN_MCQ_OPTIONS = 2;
const MIN_MATCH_PAIRS = 2;
const MIN_ORDERING_ITEMS = 2;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function pushError(
  errors: ValidationError[],
  path: string,
  message: string,
  severity: 'error' | 'warning' = 'error',
): void {
  errors.push({ path, message, severity });
}

// ---------------------------------------------------------------------------
// Shared field checks (id, type, difficulty, conceptId, hints, explanation)
// ---------------------------------------------------------------------------

function validateCommonFields(
  q: Record<string, unknown>,
  path: string,
  errors: ValidationError[],
): void {
  if (!isNonEmptyString(q.id)) {
    pushError(errors, `${path}.id`, 'Question id must be a non-empty string.');
  }

  if (!isNonEmptyString(q.type) || !VALID_TYPES.has(q.type as string)) {
    pushError(errors, `${path}.type`, `Question type must be one of: ${[...VALID_TYPES].join(', ')}.`);
  }

  // explanation — required on every question type
  if (!isNonEmptyString(q.explanation)) {
    pushError(errors, `${path}.explanation`, 'Explanation must be a non-empty string.');
  }

  // difficulty — optional but must be valid when present
  if (q.difficulty !== undefined && !VALID_DIFFICULTIES.has(q.difficulty as string)) {
    pushError(errors, `${path}.difficulty`, `Difficulty must be one of: ${[...VALID_DIFFICULTIES].join(', ')}.`);
  }

  // conceptId — optional but must be a non-empty string when present
  if (q.conceptId !== undefined && !isNonEmptyString(q.conceptId)) {
    pushError(errors, `${path}.conceptId`, 'conceptId, when provided, must be a non-empty string.');
  }

  // hints — optional but every entry must be a non-empty string
  if (q.hints !== undefined) {
    if (!Array.isArray(q.hints)) {
      pushError(errors, `${path}.hints`, 'hints must be an array of strings.');
    } else {
      (q.hints as unknown[]).forEach((h, i) => {
        if (!isNonEmptyString(h)) {
          pushError(errors, `${path}.hints[${i}]`, 'Each hint must be a non-empty string.');
        }
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Per-type validators
// ---------------------------------------------------------------------------

function validateMCQ(q: MCQQuestion, path: string, errors: ValidationError[]): void {
  if (!isNonEmptyString(q.question)) {
    pushError(errors, `${path}.question`, 'MCQ question text must be a non-empty string.');
  }

  if (!Array.isArray(q.options) || q.options.length < MIN_MCQ_OPTIONS) {
    pushError(errors, `${path}.options`, `MCQ must have at least ${MIN_MCQ_OPTIONS} options.`);
  } else {
    q.options.forEach((opt, i) => {
      if (!isNonEmptyString(opt)) {
        pushError(errors, `${path}.options[${i}]`, 'Each option must be a non-empty string.');
      }
    });

    // Duplicate options are a content quality issue
    const unique = new Set(q.options.map((o) => o.trim().toLowerCase()));
    if (unique.size < q.options.length) {
      pushError(errors, `${path}.options`, 'Options contain duplicates.', 'warning');
    }
  }

  if (typeof q.correctIndex !== 'number' || !Number.isInteger(q.correctIndex) || q.correctIndex < 0) {
    pushError(errors, `${path}.correctIndex`, 'correctIndex must be a non-negative integer.');
  } else if (Array.isArray(q.options) && q.correctIndex >= q.options.length) {
    pushError(errors, `${path}.correctIndex`, `correctIndex (${q.correctIndex}) is out of bounds — options has ${q.options.length} entries.`);
  }
}

function validateFillBlank(q: FillBlankQuestion, path: string, errors: ValidationError[]): void {
  if (!isNonEmptyString(q.question)) {
    pushError(errors, `${path}.question`, 'Fill-blank question text must be a non-empty string.');
  }

  if (!Array.isArray(q.acceptedAnswers) || q.acceptedAnswers.length === 0) {
    pushError(errors, `${path}.acceptedAnswers`, 'acceptedAnswers must be a non-empty array.');
  } else {
    q.acceptedAnswers.forEach((ans, i) => {
      if (!isNonEmptyString(ans)) {
        pushError(errors, `${path}.acceptedAnswers[${i}]`, 'Each accepted answer must be a non-empty string.');
      }
    });
  }
}

function validateMatch(q: MatchQuestion, path: string, errors: ValidationError[]): void {
  if (!Array.isArray(q.pairs) || q.pairs.length < MIN_MATCH_PAIRS) {
    pushError(errors, `${path}.pairs`, `Match question must have at least ${MIN_MATCH_PAIRS} pairs.`);
  } else {
    q.pairs.forEach((pair, i) => {
      if (!isNonEmptyString(pair?.left)) {
        pushError(errors, `${path}.pairs[${i}].left`, 'Pair left side must be a non-empty string.');
      }
      if (!isNonEmptyString(pair?.right)) {
        pushError(errors, `${path}.pairs[${i}].right`, 'Pair right side must be a non-empty string.');
      }
    });

    // Duplicate left keys would make the question ambiguous
    const lefts = q.pairs.map((p) => p.left);
    if (new Set(lefts).size < lefts.length) {
      pushError(errors, `${path}.pairs`, 'Duplicate left-side values make the question ambiguous.');
    }
  }
}

function validateTrueFalse(q: TrueFalseQuestion, path: string, errors: ValidationError[]): void {
  if (!isNonEmptyString(q.statement)) {
    pushError(errors, `${path}.statement`, 'True/false statement must be a non-empty string.');
  }

  if (typeof q.correctAnswer !== 'boolean') {
    pushError(errors, `${path}.correctAnswer`, 'correctAnswer must be a boolean.');
  }
}

function validateOrdering(q: OrderingQuestion, path: string, errors: ValidationError[]): void {
  if (!isNonEmptyString(q.instruction)) {
    pushError(errors, `${path}.instruction`, 'Ordering instruction must be a non-empty string.');
  }

  if (!Array.isArray(q.correctOrder) || q.correctOrder.length < MIN_ORDERING_ITEMS) {
    pushError(errors, `${path}.correctOrder`, `Ordering question must have at least ${MIN_ORDERING_ITEMS} items.`);
  } else {
    q.correctOrder.forEach((item, i) => {
      if (!isNonEmptyString(item)) {
        pushError(errors, `${path}.correctOrder[${i}]`, 'Each item must be a non-empty string.');
      }
    });

    // Duplicate items make ordering nonsensical
    if (new Set(q.correctOrder).size < q.correctOrder.length) {
      pushError(errors, `${path}.correctOrder`, 'Ordering items contain duplicates.', 'warning');
    }
  }
}

function validateFlashcard(q: FlashcardQuestion, path: string, errors: ValidationError[]): void {
  if (!isNonEmptyString(q.front)) {
    pushError(errors, `${path}.front`, 'Flashcard front must be a non-empty string.');
  }
  if (!isNonEmptyString(q.back)) {
    pushError(errors, `${path}.back`, 'Flashcard back must be a non-empty string.');
  }
}

// ---------------------------------------------------------------------------
// Question dispatcher
// ---------------------------------------------------------------------------

function validateQuestion(q: QuizQuestion, path: string, errors: ValidationError[]): void {
  // Cast to Record for common field access before type narrowing
  validateCommonFields(q as unknown as Record<string, unknown>, path, errors);

  switch (q.type) {
    case 'mcq':
      validateMCQ(q, path, errors);
      break;
    case 'fill_blank':
      validateFillBlank(q, path, errors);
      break;
    case 'match':
      validateMatch(q, path, errors);
      break;
    case 'true_false':
      validateTrueFalse(q, path, errors);
      break;
    case 'ordering':
      validateOrdering(q, path, errors);
      break;
    case 'flashcard':
      validateFlashcard(q, path, errors);
      break;
    default:
      pushError(errors, `${path}.type`, `Unknown question type: "${(q as { type: string }).type}".`);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Validate a single QuizLesson.  Returns structured errors with dot-paths.
 *
 * Checks performed:
 * - Lesson-level: non-empty id, title, positive pointsAwarded, ≥1 question
 * - Question-level: all structural/semantic rules per question type
 * - Cross-question: unique question ids within the lesson
 */
export function validateLesson(lesson: QuizLesson): ValidationResult {
  const all: ValidationError[] = [];
  const root = `lesson(${lesson?.id ?? '?'})`;

  // Lesson-level checks
  if (!isNonEmptyString(lesson?.id)) {
    pushError(all, `${root}.id`, 'Lesson id must be a non-empty string.');
  }
  if (!isNonEmptyString(lesson?.title)) {
    pushError(all, `${root}.title`, 'Lesson title must be a non-empty string.');
  }
  if (typeof lesson?.pointsAwarded !== 'number' || lesson.pointsAwarded <= 0) {
    pushError(all, `${root}.pointsAwarded`, 'pointsAwarded must be a positive number.');
  }
  if (!Array.isArray(lesson?.questions) || lesson.questions.length === 0) {
    pushError(all, `${root}.questions`, 'Lesson must contain at least 1 question.');
    return toResult(all);
  }

  // Per-question validation + id uniqueness
  const seenIds = new Set<string>();
  lesson.questions.forEach((q, i) => {
    const qPath = `${root}.questions[${i}]`;
    validateQuestion(q, qPath, all);

    if (isNonEmptyString(q.id)) {
      if (seenIds.has(q.id)) {
        pushError(all, `${qPath}.id`, `Duplicate question id "${q.id}" within lesson.`);
      }
      seenIds.add(q.id);
    }
  });

  return toResult(all);
}

/**
 * Validate an array of QuizLessons — runs `validateLesson` on each and also
 * checks for globally unique lesson ids and globally unique question ids.
 */
export function validateLessons(lessons: QuizLesson[]): ValidationResult {
  const all: ValidationError[] = [];

  if (!Array.isArray(lessons) || lessons.length === 0) {
    pushError(all, 'lessons', 'Lessons array must be non-empty.');
    return toResult(all);
  }

  const seenLessonIds = new Set<string>();
  const seenQuestionIds = new Set<string>();

  lessons.forEach((lesson, i) => {
    const result = validateLesson(lesson);
    all.push(...result.errors, ...result.warnings);

    // Cross-lesson uniqueness: lesson ids
    if (isNonEmptyString(lesson.id)) {
      if (seenLessonIds.has(lesson.id)) {
        pushError(all, `lessons[${i}].id`, `Duplicate lesson id "${lesson.id}".`);
      }
      seenLessonIds.add(lesson.id);
    }

    // Cross-lesson uniqueness: question ids
    if (Array.isArray(lesson.questions)) {
      lesson.questions.forEach((q, qi) => {
        if (isNonEmptyString(q.id)) {
          if (seenQuestionIds.has(q.id)) {
            pushError(all, `lessons[${i}].questions[${qi}].id`, `Duplicate question id "${q.id}" across lessons.`);
          }
          seenQuestionIds.add(q.id);
        }
      });
    }
  });

  return toResult(all);
}

/**
 * Assertion wrapper — throws if validation fails.  Useful as a dev-time guard
 * at module load or in CI.
 *
 * @throws {Error} with a formatted list of all validation errors.
 */
export function assertValidLessons(lessons: QuizLesson[]): void {
  const result = validateLessons(lessons);
  if (!result.valid) {
    const lines = result.errors.map((e) => `  ✗ [${e.path}] ${e.message}`);
    throw new Error(`Quiz content validation failed with ${result.errors.length} error(s):\n${lines.join('\n')}`);
  }
}

// ---------------------------------------------------------------------------
// Result builder
// ---------------------------------------------------------------------------

function toResult(all: ValidationError[]): ValidationResult {
  const errors = all.filter((e) => e.severity === 'error');
  const warnings = all.filter((e) => e.severity === 'warning');
  return { valid: errors.length === 0, errors, warnings };
}
