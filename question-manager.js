/**
 * Question Pool Manager for MyTestStudent Web
 * Handles question sampling, randomization (Fisher-Yates), answer shuffling,
 * and test session state management.
 */

/**
 * Modern cryptographically unbiased array shuffle (Fisher-Yates algorithm).
 * Falls back to Math.random if crypto is unavailable in the environment.
 * @param {Array<any>} array
 * @returns {Array<any>} A new shuffled array
 */
export function shuffleArray(array) {
  if (!Array.isArray(array)) return [];
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    let j;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const randBuf = new Uint32Array(1);
      crypto.getRandomValues(randBuf);
      j = Math.floor((randBuf[0] / (0xffffffff + 1)) * (i + 1));
    } else {
      j = Math.floor(Math.random() * (i + 1));
    }
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Prepares an active test session from a raw test bank definition.
 * Applies question sampling, question randomization, and answer option randomization.
 * @param {Object} testData - Raw test structure conforming to schema
 * @param {Object} overrides - Optional override settings (e.g. question limit)
 * @returns {Object} Initialized session state
 */
export function initializeTestSession(testData, overrides = {}) {
  const settings = {
    timeLimitMinutes: 30,
    questionsToSelect: 0,
    randomizeQuestions: true,
    randomizeAnswers: true,
    allowPrevious: true,
    immediateFeedback: false,
    showResultsAtEnd: true,
    allowReview: true,
    passingScorePercent: 55,
    gradingScale: {
      type: '5-point',
      cutoffs: { '5': 86, '4': 71, '3': 55, '2': 0 }
    },
    ...(testData.settings || {}),
    ...overrides
  };

  let pool = Array.isArray(testData.questions) ? [...testData.questions] : [];

  // Shuffle question pool if requested
  if (settings.randomizeQuestions) {
    pool = shuffleArray(pool);
  }

  // Subset sampling: if questionsToSelect > 0 and < pool.length
  const limit = parseInt(settings.questionsToSelect, 10);
  if (limit > 0 && limit < pool.length) {
    pool = pool.slice(0, limit);
  }

  // Process individual questions and shuffle their answer options if applicable
  const preparedQuestions = pool.map((rawQ, qIndex) => {
    const q = {
      ...rawQ,
      displayIndex: qIndex + 1,
      id: rawQ.id || `q_${qIndex + 1}`
    };

    // Shuffle answer choices for single and multiple choice questions
    if (settings.randomizeAnswers) {
      if ((q.type === 'single' || q.type === 'multiple') && Array.isArray(q.answers)) {
        q.answers = shuffleArray(q.answers);
      } else if (q.type === 'match' && Array.isArray(q.pairs)) {
        // For matching, keep left column stable, shuffle right column choices
        const rightOptions = shuffleArray(q.pairs.map(p => ({
          rightId: p.rightId !== undefined ? p.rightId : p.right,
          right: p.right
        })));
        q.shuffledRightOptions = rightOptions;
      } else if (q.type === 'order') {
        // For order questions, present items in a randomized order to be reordered
        if (Array.isArray(q.orderedItems)) {
          q.displayItems = shuffleArray(
            q.orderedItems.map((item, idx) => ({
              id: typeof item === 'object' && item.id ? item.id : String(idx),
              text: typeof item === 'object' && item.text ? item.text : String(item)
            }))
          );
        }
      }
    } else {
      if (q.type === 'match' && Array.isArray(q.pairs)) {
        q.shuffledRightOptions = q.pairs.map(p => ({
          rightId: p.rightId !== undefined ? p.rightId : p.right,
          right: p.right
        }));
      } else if (q.type === 'order' && Array.isArray(q.orderedItems)) {
        q.displayItems = q.orderedItems.map((item, idx) => ({
          id: typeof item === 'object' && item.id ? item.id : String(idx),
          text: typeof item === 'object' && item.text ? item.text : String(item)
        }));
      }
    }

    return q;
  });

  return {
    meta: testData.meta || { title: 'Nomsiz Test' },
    settings,
    questions: preparedQuestions,
    answers: {},             // Map: questionId -> studentAnswer
    flagged: new Set(),       // Set of questionIds marked for review
    visited: new Set([preparedQuestions[0]?.id].filter(Boolean)),
    currentIndex: 0,
    startTime: null,
    endTime: null,
    isCompleted: false,
    timeRemainingSeconds: settings.timeLimitMinutes * 60
  };
}

/**
 * Updates the student's answer for a specific question.
 * @param {Object} session
 * @param {string} questionId
 * @param {any} answer
 */
export function setAnswer(session, questionId, answer) {
  if (session.isCompleted) return;
  session.answers[questionId] = answer;
}

/**
 * Toggles review flag on a question.
 * @param {Object} session
 * @param {string} questionId
 * @returns {boolean} New flag state
 */
export function toggleFlag(session, questionId) {
  if (session.flagged.has(questionId)) {
    session.flagged.delete(questionId);
    return false;
  } else {
    session.flagged.add(questionId);
    return true;
  }
}

/**
 * Computes status of a question in the palette.
 * @param {Object} session
 * @param {number} index
 * @returns {'current'|'flagged'|'answered'|'unanswered'}
 */
export function getQuestionPaletteStatus(session, index) {
  const q = session.questions[index];
  if (!q) return 'unanswered';

  const isCurrent = session.currentIndex === index;
  const isFlagged = session.flagged.has(q.id);
  const ans = session.answers[q.id];
  const isAnswered = ans !== undefined && ans !== null && ans !== '' &&
    (!Array.isArray(ans) || ans.length > 0) &&
    (typeof ans !== 'object' || Object.keys(ans).length > 0);

  if (isCurrent) return 'current';
  if (isFlagged) return 'flagged';
  if (isAnswered) return 'answered';
  return 'unanswered';
}
