import {
  shuffleArray,
  initializeTestSession,
  setAnswer,
  toggleFlag,
  getQuestionPaletteStatus
} from '../js/question-manager.js';

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

console.log('--- RUNNING QUESTION MANAGER & ENGINE TESTS ---');

// 1. Fisher-Yates Array Shuffle
console.log('\n[Suite 1: Shuffle Integrity]');
const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const shuffled = shuffleArray(original);
assert(shuffled.length === original.length, 'Shuffled array has same length');
assert(shuffled.every(x => original.includes(x)), 'Shuffled array preserves all elements');
assert(original.join(',') === '1,2,3,4,5,6,7,8,9,10', 'Original array is not mutated');

// 2. Subset Sampling (e.g. 5 questions chosen out of 20)
console.log('\n[Suite 2: Subset Sampling]');
const mockQuestions = Array.from({ length: 20 }, (_, i) => ({
  id: `mock_${i + 1}`,
  type: 'single',
  text: `Question ${i + 1}`,
  answers: [{ id: 'a1', text: 'Ans 1', correct: true }]
}));

const testBank = {
  meta: { title: 'Pool Test' },
  settings: {
    questionsToSelect: 5,
    randomizeQuestions: true,
    timeLimitMinutes: 20
  },
  questions: mockQuestions
};

const session = initializeTestSession(testBank);
assert(session.questions.length === 5, 'Selects exactly 5 questions out of 20');
assert(session.timeRemainingSeconds === 1200, 'Time in seconds initialized correctly (20 min * 60 = 1200s)');
assert(session.currentIndex === 0, 'Initial index is 0');

// 3. Answer Setting & State Tracking
console.log('\n[Suite 3: Answer State & Palette]');
const q0Id = session.questions[0].id;
const q1Id = session.questions[1].id;

assert(getQuestionPaletteStatus(session, 0) === 'current', 'Index 0 is current question');
assert(getQuestionPaletteStatus(session, 1) === 'unanswered', 'Index 1 is initially unanswered');

setAnswer(session, q1Id, 'a1');
session.currentIndex = 1; // move to index 1
assert(getQuestionPaletteStatus(session, 1) === 'current', 'Index 1 is now current');

session.currentIndex = 0; // move back to index 0
assert(getQuestionPaletteStatus(session, 1) === 'answered', 'Index 1 is now marked answered');

// 4. Flagging for Review
console.log('\n[Suite 4: Flagging for Review]');
const isFlagged = toggleFlag(session, q1Id);
assert(isFlagged === true, 'Question flagged for review');
assert(getQuestionPaletteStatus(session, 1) === 'flagged', 'Palette marks flagged question');

toggleFlag(session, q1Id);
assert(getQuestionPaletteStatus(session, 1) === 'answered', 'Unflagging restores answered status');

console.log(`\nENGINE TEST RESULTS: ${passed} PASSED, ${failed} FAILED.`);
if (failed > 0) process.exit(1);
