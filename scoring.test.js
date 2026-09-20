import { scoreQuestion, calculateGrade, calculateTestResults, normalizeText } from '../js/scoring.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('--- RUNNING SCORING ENGINE TESTS ---');

// 1. Text Normalization Tests
console.log('\n[Suite 1: Text Normalization]');
assert(normalizeText('  Piskachek   belgisi  ') === 'piskachek belgisi', 'Trims and collapses spaces, lowercases');
assert(normalizeText('CaseSensitive', true) === 'CaseSensitive', 'Respects caseSensitive flag');

// 2. Single Choice Scoring
console.log('\n[Suite 2: Single Choice]');
const singleQ = {
  id: 'q1',
  type: 'single',
  weight: 2,
  answers: [
    { id: 'a1', text: 'Piskachek belgisi', correct: true },
    { id: 'a2', text: 'Kyustner belgisi', correct: false }
  ]
};
assert(scoreQuestion(singleQ, 'a1').pointsEarned === 2, 'Full points for correct single choice');
assert(scoreQuestion(singleQ, 'a1').isCorrect === true, 'isCorrect true for correct single choice');
assert(scoreQuestion(singleQ, 'a2').pointsEarned === 0, 'Zero points for wrong single choice');
assert(scoreQuestion(singleQ, null).pointsEarned === 0, 'Zero points for unanswered single choice');

// 3. Multiple Choice with Partial Credit and Penalties (MyTest standard)
console.log('\n[Suite 3: Multiple Choice]');
const multiQ = {
  id: 'q2',
  type: 'multiple',
  weight: 4,
  scoring: 'partial_with_penalty',
  answers: [
    { id: 'm1', text: 'Correct 1', correct: true },
    { id: 'm2', text: 'Correct 2', correct: true },
    { id: 'm3', text: 'Wrong 1', correct: false },
    { id: 'm4', text: 'Wrong 2', correct: false }
  ]
};
// All correct selected, no wrong: 2/2 - 0/2 = 1.0 * 4 = 4 points
const resAll = scoreQuestion(multiQ, ['m1', 'm2']);
assert(resAll.pointsEarned === 4 && resAll.isCorrect, 'Full score when all correct selected without errors');

// 1 correct selected, no wrong: 1/2 - 0/2 = 0.5 * 4 = 2 points
const resHalf = scoreQuestion(multiQ, ['m1']);
assert(resHalf.pointsEarned === 2 && resHalf.isPartiallyCorrect, 'Partial credit (50%) when 1 of 2 correct chosen');

// 1 correct, 1 wrong: 1/2 - 1/2 = 0 points
const resNeutral = scoreQuestion(multiQ, ['m1', 'm3']);
assert(resNeutral.pointsEarned === 0 && !resNeutral.isCorrect, 'Zero points when penalty equals correct fraction');

// 0 correct, 2 wrong: 0/2 - 2/2 = clamped to 0
const resNegative = scoreQuestion(multiQ, ['m3', 'm4']);
assert(resNegative.pointsEarned === 0, 'Score does not drop below 0 (clamped)');

// Strict mode test
const strictQ = { ...multiQ, scoring: 'strict' };
assert(scoreQuestion(strictQ, ['m1', 'm2']).pointsEarned === 4, 'Strict mode awards points on perfect match');
assert(scoreQuestion(strictQ, ['m1']).pointsEarned === 0, 'Strict mode awards 0 on partial match');

// 4. Boolean / True-False
console.log('\n[Suite 4: Boolean True/False]');
const boolQ = { id: 'q3', type: 'boolean', weight: 1, correctAnswer: true };
assert(scoreQuestion(boolQ, true).pointsEarned === 1, 'Correct for true');
assert(scoreQuestion(boolQ, 'true').pointsEarned === 1, 'Correct for string "true"');
assert(scoreQuestion(boolQ, false).pointsEarned === 0, '0 points for false');

// 5. Short Text
console.log('\n[Suite 5: Short Text]');
const textQ = {
  id: 'q4',
  type: 'text',
  weight: 2,
  validAnswers: ['bakterial vaginoz', 'gardnerellyoz'],
  caseSensitive: false
};
assert(scoreQuestion(textQ, 'Bakterial Vaginoz').pointsEarned === 2, 'Matches case-insensitively');
assert(scoreQuestion(textQ, 'gardnerellyoz').pointsEarned === 2, 'Matches alternate synonym');
assert(scoreQuestion(textQ, 'kandidoz').pointsEarned === 0, '0 for incorrect text');

// 6. Numeric Input with Tolerance
console.log('\n[Suite 6: Numeric Input]');
const numQ = { id: 'q5', type: 'number', weight: 1, correctNumber: 12, tolerance: 0.5 };
assert(scoreQuestion(numQ, '12').pointsEarned === 1, 'Exact number match');
assert(scoreQuestion(numQ, '12.4').pointsEarned === 1, 'Within tolerance match');
assert(scoreQuestion(numQ, '12,3').pointsEarned === 1, 'Comma as decimal separator supported');
assert(scoreQuestion(numQ, '13.1').pointsEarned === 0, 'Outside tolerance rejected');

// 7. Order / Sequence
console.log('\n[Suite 7: Sequence / Order]');
const orderQ = {
  id: 'q6',
  type: 'order',
  weight: 4,
  orderedItems: [
    { id: 'step1', text: 'First' },
    { id: 'step2', text: 'Second' },
    { id: 'step3', text: 'Third' },
    { id: 'step4', text: 'Fourth' }
  ]
};
assert(scoreQuestion(orderQ, ['step1', 'step2', 'step3', 'step4']).pointsEarned === 4, 'Full score for perfect sequence');
assert(scoreQuestion(orderQ, ['step1', 'step2', 'step4', 'step3']).pointsEarned === 2, 'Partial score (2/4 = 2 pts) for 2 correct positions');

// 8. Matching Pairs
console.log('\n[Suite 8: Matching Pairs]');
const matchQ = {
  id: 'q7',
  type: 'match',
  weight: 3,
  pairs: [
    { leftId: 'l1', left: 'A', rightId: 'r1', right: '1' },
    { leftId: 'l2', left: 'B', rightId: 'r2', right: '2' },
    { leftId: 'l3', left: 'C', rightId: 'r3', right: '3' }
  ]
};
assert(scoreQuestion(matchQ, { l1: 'r1', l2: 'r2', l3: 'r3' }).pointsEarned === 3, 'Full points for all pairs matched');
assert(scoreQuestion(matchQ, { l1: 'r1', l2: 'r99', l3: 'r3' }).pointsEarned === 2, 'Partial points (2/3 * 3 = 2 pts) for 2 correct pairs');

// 9. Grading Scale & Full Test Summary
console.log('\n[Suite 9: Grading Scale & Test Aggregation]');
assert(calculateGrade(90).gradeNumber === '5', '90% earns Grade 5 (A\'lo)');
assert(calculateGrade(75).gradeNumber === '4', '75% earns Grade 4 (Yaxshi)');
assert(calculateGrade(60).gradeNumber === '3', '60% earns Grade 3 (Qoniqarli)');
assert(calculateGrade(45).gradeNumber === '2', '45% earns Grade 2 (Qoniqarsiz)');
assert(calculateGrade(55, null, 55).isPassed === true, '55% passes when threshold is 55%');
assert(calculateGrade(54, null, 55).isPassed === false, '54% fails when threshold is 55%');

const testRun = calculateTestResults(
  [singleQ, boolQ, textQ],
  { q1: 'a1', q3: true, q4: 'bakterial vaginoz' },
  { passingScorePercent: 60 }
);
assert(testRun.summary.percentage === 100, 'All correct yields 100% total score');
assert(testRun.summary.gradeNumber === '5', 'All correct yields Grade 5');
assert(testRun.summary.isPassed === true, 'All correct yields Passed status');

console.log(`\nTEST RESULTS: ${passed} PASSED, ${failed} FAILED.`);
if (failed > 0) process.exit(1);
