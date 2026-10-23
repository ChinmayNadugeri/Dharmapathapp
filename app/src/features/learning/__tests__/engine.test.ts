import { describe, expect, it } from '@jest/globals';
import { QUIZ_LESSONS, getQuizLesson } from '../data/quizData';
import type {
  FillBlankQuestion,
  FlashcardQuestion,
  MCQQuestion,
  MatchQuestion,
  OrderingQuestion,
  TrueFalseQuestion,
} from '../types/quiz.types';
import {
  addDays, applyAttempts, createSession, currentQuestion, dueItems, evaluateAnswer, findWeakConcepts,
  getHint, nextDifficulty, normalizeText, recommendNext, scheduleReview, selectQuestions,
  sessionReducer, summarizeSession, toLocalDateKey, type SessionState,
} from '../engine';

const mcq: MCQQuestion = { id: 'm', type: 'mcq', question: 'q', options: ['a', 'b', 'c', 'd'], correctIndex: 2, explanation: 'e' };
const fill: FillBlankQuestion = { id: 'f', type: 'fill_blank', question: 'q', acceptedAnswers: ['Lakshmana', 'Laxman'], explanation: 'e' };
const match: MatchQuestion = {
  id: 'x', type: 'match', explanation: 'e',
  pairs: [{ left: 'A', right: '1' }, { left: 'B', right: '2' }, { left: 'C', right: '3' }, { left: 'D', right: '4' }],
};
const tf: TrueFalseQuestion = {
  id: 'tf1', type: 'true_false', statement: 'Rama accepted exile to honour Dasharatha’s promise.', correctAnswer: true, explanation: 'e',
};
const ordering: OrderingQuestion = {
  id: 'ord1', type: 'ordering', instruction: 'Order the numbers', correctOrder: ['One', 'Two', 'Three'], explanation: 'e',
};
const flashcard: FlashcardQuestion = {
  id: 'fc1', type: 'flashcard', front: 'Prompt', back: 'Answer', explanation: 'e',
};

describe('evaluateAnswer', () => {
  it('grades mcq', () => {
    expect(evaluateAnswer(mcq, { type: 'mcq', selectedIndex: 2 }).correct).toBe(true);
    expect(evaluateAnswer(mcq, { type: 'mcq', selectedIndex: 1 }).correct).toBe(false);
    expect(evaluateAnswer(mcq, { type: 'mcq', selectedIndex: 99 }).correct).toBe(false);
  });
  it('is lenient on case, spacing, punctuation and IAST diacritics', () => {
    expect(normalizeText('  Lakṣmaṇa! ')).toBe('laksmana');
    expect(evaluateAnswer(fill, { type: 'fill_blank', text: ' LAXMAN. ' }).correct).toBe(true);
    expect(evaluateAnswer(fill, { type: 'fill_blank', text: 'lakshmana' }).correct).toBe(true);
    expect(evaluateAnswer(fill, { type: 'fill_blank', text: '' }).correct).toBe(false);
    expect(evaluateAnswer(fill, { type: 'fill_blank', text: 'Bharata' }).correct).toBe(false);
  });
  it('keeps Devanagari text intact', () => {
    expect(normalizeText('धर्म।')).toBe('धर्म');
  });
  it('gives partial credit on match and counts wrong pairs', () => {
    const ev = evaluateAnswer(match, { type: 'match', pairs: [
      { left: 'A', right: '1' }, { left: 'B', right: '3' }, { left: 'C', right: '2' }, { left: 'D', right: '4' }] });
    expect(ev.score).toBe(0.5);
    expect(ev.correct).toBe(false);
    expect(evaluateAnswer(match, { type: 'match', pairs: match.pairs }).correct).toBe(true);
  });
  it('grades true_false', () => {
    expect(evaluateAnswer(tf, { type: 'true_false', selected: true }).correct).toBe(true);
    expect(evaluateAnswer(tf, { type: 'true_false', selected: false }).correct).toBe(false);
  });
  it('grades ordering with partial credit', () => {
    expect(evaluateAnswer(ordering, { type: 'ordering', order: ['One', 'Two', 'Three'] }).correct).toBe(true);
    const partial = evaluateAnswer(ordering, { type: 'ordering', order: ['One', 'Three', 'Two'] });
    expect(partial.correct).toBe(false);
    expect(partial.score).toBeCloseTo(1 / 3);
  });
  it('grades flashcard by learner self-report', () => {
    expect(evaluateAnswer(flashcard, { type: 'flashcard', selfReportedCorrect: true }).correct).toBe(true);
    expect(evaluateAnswer(flashcard, { type: 'flashcard', selfReportedCorrect: false }).correct).toBe(false);
  });
  it('rejects answers of the wrong kind', () => {
    expect(() => evaluateAnswer(mcq, { type: 'fill_blank', text: 'x' })).toThrow(TypeError);
  });
});

describe('getHint', () => {
  it('never reveals the correct option and keeps at least two options', () => {
    const h = getHint(mcq, 2);
    expect(h.eliminatedOptions).toEqual([0, 1]);
    expect(h.eliminatedOptions).not.toContain(mcq.correctIndex);
  });
  it('stages fill-blank hints and clamps the level', () => {
    expect(getHint(fill, 1).text).toContain('9 letters');
    expect(getHint(fill, 9).text).toContain('"L"');
  });
  it('stages true_false hints', () => {
    expect(getHint(tf, 1).text).toContain('statement carefully');
  });
  it('stages ordering hints', () => {
    expect(getHint(ordering, 2).text).toContain('The first item is "One"');
  });
  it('prefers authored hints', () => {
    expect(getHint({ ...mcq, hints: ['think of Kaikeyi'] }, 1).text).toBe('think of Kaikeyi');
  });
});

describe('session', () => {
  const run = (state: SessionState, steps: ('right' | 'wrong' | 'hint')[]) => {
    let t = 1000;
    let s = state;
    for (const step of steps) {
      if (step === 'hint') { s = sessionReducer(s, { type: 'HINT' }); continue; }
      const q = currentQuestion(s)!;
      let ans;
      if (q.type === 'mcq') {
        ans = { type: 'mcq' as const, selectedIndex: step === 'right' ? (q as MCQQuestion).correctIndex : (q as MCQQuestion).correctIndex === 0 ? 1 : 0 };
      } else if (q.type === 'fill_blank') {
        ans = { type: 'fill_blank' as const, text: step === 'right' ? 'Laxman' : 'nope' };
      } else if (q.type === 'match') {
        ans = { type: 'match' as const, pairs: step === 'right' ? (q as MatchQuestion).pairs : [] };
      } else if (q.type === 'true_false') {
        ans = { type: 'true_false' as const, selected: step === 'right' ? (q as TrueFalseQuestion).correctAnswer : !(q as TrueFalseQuestion).correctAnswer };
      } else if (q.type === 'ordering') {
        ans = { type: 'ordering' as const, order: step === 'right' ? (q as OrderingQuestion).correctOrder : [] };
      } else {
        ans = { type: 'flashcard' as const, selfReportedCorrect: step === 'right' };
      }
      t += 500;
      s = sessionReducer(s, { type: 'ANSWER', answer: ans, now: t });
      t += 10;
      s = sessionReducer(s, { type: 'NEXT', now: t });
    }
    return s;
  };

  it('passes a clean run', () => {
    const s = run(createSession('l', [mcq, fill, match], 0), ['right', 'right', 'right']);
    expect(s.phase).toBe('complete');
    expect(summarizeSession(s)).toMatchObject({ firstTryCorrect: 3, accuracy: 1, passed: true, retried: [] });
  });
  it('requeues a missed question once and does not let the retry inflate accuracy', () => {
    const s = run(createSession('l', [mcq, fill], 0), ['wrong', 'right', 'right']);
    const sum = summarizeSession(s);
    expect(s.queue).toEqual(['m', 'f', 'm']);
    expect(sum.retried).toEqual(['m']);
    expect(sum.accuracy).toBe(0.5);
    expect(sum.passed).toBe(false);
  });
  it('does not requeue a question that is missed twice', () => {
    const s = run(createSession('l', [mcq], 0), ['wrong', 'wrong']);
    expect(s.queue).toEqual(['m', 'm']);
    expect(s.phase).toBe('complete');
  });
  it('ignores duplicate submissions', () => {
    const s0 = createSession('l', [mcq, fill], 0);
    const once = sessionReducer(s0, { type: 'ANSWER', answer: { type: 'mcq', selectedIndex: 2 }, now: 5 });
    const twice = sessionReducer(once, { type: 'ANSWER', answer: { type: 'mcq', selectedIndex: 0 }, now: 6 });
    expect(twice).toBe(once);
    expect(twice.attempts).toHaveLength(1);
  });
  it('records hints and response time', () => {
    let s = createSession('l', [mcq], 100);
    s = sessionReducer(s, { type: 'HINT' });
    s = sessionReducer(s, { type: 'HINT' });
    s = sessionReducer(s, { type: 'HINT' });
    s = sessionReducer(s, { type: 'ANSWER', answer: { type: 'mcq', selectedIndex: 2 }, now: 2100 });
    expect(s.attempts[0]).toMatchObject({ hintsUsed: 2, responseMs: 2000, correct: true });
  });
  it('handles an empty question list', () => {
    expect(createSession('l', [], 0).phase).toBe('complete');
  });
});

describe('mastery', () => {
  const at = (conceptId: string, correct: boolean, hintsUsed = 0) =>
    ({ questionId: 'q', conceptId, correct, score: correct ? 1 : 0, hintsUsed, responseMs: 0, attemptNumber: 1, at: 1 });
  it('moves toward the evidence and discounts hinted answers', () => {
    const clean = applyAttempts({}, [at('c', true)]).c.mastery;
    const hinted = applyAttempts({}, [at('c', true, 2)]).c.mastery;
    expect(clean).toBeGreaterThan(0.5);
    expect(hinted).toBeLessThan(clean);
  });
  it('flags weak concepts', () => {
    const m = applyAttempts({}, [at('weak', false), at('weak', false), at('ok', true), at('ok', true)]);
    expect(findWeakConcepts(m).map((c) => c.conceptId)).toEqual(['weak']);
  });
});

describe('spaced revision', () => {
  it('uses local dates, not UTC (IST)', () => {
    expect(toLocalDateKey(new Date(2026, 9, 21, 1, 0))).toBe('2026-10-21'); // 01:00 IST is 19:30 UTC the day before
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
  });
  it('promotes on success, resets on failure, and lists due items', () => {
    const a = scheduleReview(undefined, 's1', true, '2026-10-21');
    expect(a).toEqual({ id: 's1', box: 2, dueDate: '2026-10-23' });
    expect(scheduleReview(a, 's1', true, '2026-10-23').box).toBe(3);
    expect(scheduleReview({ ...a, box: 5 }, 's1', true, '2026-10-23').box).toBe(5);
    expect(scheduleReview({ ...a, box: 4 }, 's1', false, '2026-10-23').box).toBe(1);
    expect(dueItems([a, { id: 's2', box: 1, dueDate: '2026-10-20' }], '2026-10-23').map((i) => i.id)).toEqual(['s2', 's1']);
    expect(dueItems([a], '2026-10-22')).toEqual([]);
  });
});

describe('adaptive difficulty and recommendations', () => {
  const r = (correct: boolean, hintsUsed = 0) => ({ correct, hintsUsed });
  it('steps up, down, or holds', () => {
    expect(nextDifficulty('medium', [r(true), r(true), r(true)])).toBe('hard');
    expect(nextDifficulty('medium', [r(true), r(true), r(true, 1)])).toBe('medium');
    expect(nextDifficulty('medium', [r(false), r(false), r(true)])).toBe('easy');
    expect(nextDifficulty('easy', [r(false), r(false), r(false)])).toBe('easy');
    expect(nextDifficulty('medium', [r(false)])).toBe('medium');
  });
  it('selects by difficulty then weakest concept', () => {
    const pool = [
      { lessonId: 'a', question: { ...mcq, id: '1', difficulty: 'hard' as const } },
      { lessonId: 'a', question: { ...mcq, id: '2', difficulty: 'easy' as const } },
      { lessonId: 'b', question: { ...mcq, id: '3', difficulty: 'easy' as const } },
    ];
    const mastery = applyAttempts({}, [{ questionId: 'q', conceptId: 'b', correct: false, score: 0, hintsUsed: 0, responseMs: 0, attemptNumber: 1, at: 1 }]);
    expect(selectQuestions(pool, 'easy', 2, mastery).map((p) => p.question.id)).toEqual(['3', '2']);
  });
  it('recommends revision, then remediation, then the next lesson', () => {
    const base = { lessonOrder: ['l1', 'l2', 'l3'], completed: ['l1'], mastery: {}, lessonConcepts: { l1: ['c1'] }, dueReviews: [] };
    expect(recommendNext(base)).toMatchObject({ kind: 'lesson', targetId: 'l2' });
    const weak = applyAttempts({}, [0, 1].map(() => ({ questionId: 'q', conceptId: 'c1', correct: false, score: 0, hintsUsed: 0, responseMs: 0, attemptNumber: 1, at: 1 })));
    expect(recommendNext({ ...base, mastery: weak })).toMatchObject({ kind: 'remediate', targetId: 'l1' });
    expect(recommendNext({ ...base, mastery: weak, dueReviews: [{ id: 's9', box: 1, dueDate: '2026-10-20' }] })).toMatchObject({ kind: 'revise', targetId: 's9' });
    expect(recommendNext({ ...base, completed: ['l1', 'l2', 'l3'] }).kind).toBe('done');
  });
});

describe('existing quiz content', () => {
  it('every question is answerable by the engine and has unique ids', () => {
    const ids = new Set<string>();
    for (const lesson of QUIZ_LESSONS) {
      expect(getQuizLesson(lesson.id)).toBe(lesson);
      for (const q of lesson.questions) {
        expect(ids.has(q.id)).toBe(false);
        ids.add(q.id);
        let right;
        if (q.type === 'mcq') {
          right = { type: 'mcq' as const, selectedIndex: q.correctIndex };
          expect(q.correctIndex).toBeLessThan(q.options.length);
        } else if (q.type === 'fill_blank') {
          right = { type: 'fill_blank' as const, text: q.acceptedAnswers[0] };
        } else if (q.type === 'match') {
          right = { type: 'match' as const, pairs: q.pairs };
        } else if (q.type === 'true_false') {
          right = { type: 'true_false' as const, selected: q.correctAnswer };
        } else if (q.type === 'ordering') {
          right = { type: 'ordering' as const, order: q.correctOrder };
        } else {
          right = { type: 'flashcard' as const, selfReportedCorrect: true };
        }
        expect(evaluateAnswer(q, right).correct).toBe(true);
      }
    }
  });
});
