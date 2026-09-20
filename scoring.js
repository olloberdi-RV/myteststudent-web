/**
 * Scoring and Assessment Engine for MyTestStudent Web
 * Accurately implements MyTestX 10.x scoring algorithms, partial credit models, and grading scales.
 */

/**
 * Normalizes text for string comparisons.
 * Trims extra spaces and converts to lowercase unless case-sensitivity is explicitly requested.
 * @param {string} text
 * @param {boolean} caseSensitive
 * @returns {string}
 */
export function normalizeText(text, caseSensitive = false) {
  if (text === null || text === undefined) return '';
  let clean = String(text).trim().replace(/\s+/g, ' ');
  return caseSensitive ? clean : clean.toLowerCase();
}

/**
 * Scores an individual question based on question type and student response.
 * @param {Object} question - The question definition object
 * @param {any} studentAnswer - The submitted answer from the student
 * @returns {Object} Result object containing pointsEarned, maxPoints, isCorrect, isPartiallyCorrect, fraction
 */
export function scoreQuestion(question, studentAnswer) {
  const weight = typeof question.weight === 'number' && question.weight > 0 ? question.weight : 1;
  const type = question.type || 'single';

  // If no answer was provided
  if (studentAnswer === undefined || studentAnswer === null || studentAnswer === '') {
    return {
      pointsEarned: 0,
      maxPoints: weight,
      isCorrect: false,
      isPartiallyCorrect: false,
      fraction: 0,
      details: { reason: 'unanswered' }
    };
  }

  switch (type) {
    case 'single': {
      // Single choice: studentAnswer is the ID of chosen option
      const chosenId = String(studentAnswer);
      const chosenOption = (question.answers || []).find(a => String(a.id) === chosenId);
      const isCorrect = !!(chosenOption && chosenOption.correct);
      return {
        pointsEarned: isCorrect ? weight : 0,
        maxPoints: weight,
        isCorrect: isCorrect,
        isPartiallyCorrect: false,
        fraction: isCorrect ? 1 : 0,
        details: { chosenId, isCorrect }
      };
    }

    case 'boolean': {
      // True/False question: studentAnswer is boolean or string 'true'/'false'
      let boolAnswer;
      if (typeof studentAnswer === 'boolean') {
        boolAnswer = studentAnswer;
      } else {
        boolAnswer = String(studentAnswer).toLowerCase() === 'true';
      }
      const expectedBool = !!question.correctAnswer;
      const isCorrect = boolAnswer === expectedBool;
      return {
        pointsEarned: isCorrect ? weight : 0,
        maxPoints: weight,
        isCorrect: isCorrect,
        isPartiallyCorrect: false,
        fraction: isCorrect ? 1 : 0,
        details: { studentAnswer: boolAnswer, expectedAnswer: expectedBool }
      };
    }

    case 'multiple': {
      // Multiple choice: studentAnswer is an Array of selected option IDs
      const selectedIds = Array.isArray(studentAnswer)
        ? studentAnswer.map(id => String(id))
        : [String(studentAnswer)];

      const answers = question.answers || [];
      const correctIds = new Set(answers.filter(a => a.correct).map(a => String(a.id)));
      const incorrectIds = new Set(answers.filter(a => !a.correct).map(a => String(a.id)));

      const totalCorrect = correctIds.size;
      const totalIncorrect = incorrectIds.size;

      let selectedCorrect = 0;
      let selectedIncorrect = 0;

      selectedIds.forEach(id => {
        if (correctIds.has(id)) {
          selectedCorrect++;
        } else if (incorrectIds.has(id)) {
          selectedIncorrect++;
        }
      });

      const mode = question.scoring || 'partial_with_penalty'; // MyTest default

      let fraction = 0;
      if (mode === 'strict') {
        // All correct must be selected, no incorrect selected
        const exactMatch = selectedCorrect === totalCorrect && selectedIncorrect === 0 && selectedIds.length === totalCorrect;
        fraction = exactMatch ? 1 : 0;
      } else if (mode === 'partial_without_penalty') {
        // Only positive count matters
        fraction = totalCorrect > 0 ? Math.max(0, (selectedCorrect - selectedIncorrect) / totalCorrect) : 0;
      } else {
        // Standard MyTestX: partial credit with proportional negative deduction
        // fraction = max(0, (S_corr / N_corr) - (S_inc / N_inc))
        const posRatio = totalCorrect > 0 ? selectedCorrect / totalCorrect : 0;
        const negRatio = totalIncorrect > 0 ? selectedIncorrect / totalIncorrect : 0;
        fraction = Math.max(0, posRatio - negRatio);
      }

      // Round to 4 decimal places to prevent floating-point anomalies
      fraction = Math.round(fraction * 10000) / 10000;
      const pointsEarned = Math.round(fraction * weight * 100) / 100;
      const isFullCorrect = fraction === 1;
      const isPartiallyCorrect = fraction > 0 && fraction < 1;

      return {
        pointsEarned,
        maxPoints: weight,
        isCorrect: isFullCorrect,
        isPartiallyCorrect,
        fraction,
        details: {
          selectedIds,
          totalCorrect,
          totalIncorrect,
          selectedCorrect,
          selectedIncorrect,
          mode
        }
      };
    }

    case 'text': {
      // Short text answer
      const caseSensitive = !!question.caseSensitive;
      const studentClean = normalizeText(studentAnswer, caseSensitive);
      const validOptions = (question.validAnswers || []).map(v => normalizeText(v, caseSensitive));

      const isCorrect = validOptions.some(v => v === studentClean);
      return {
        pointsEarned: isCorrect ? weight : 0,
        maxPoints: weight,
        isCorrect,
        isPartiallyCorrect: false,
        fraction: isCorrect ? 1 : 0,
        details: { studentInput: studentClean, validOptions }
      };
    }

    case 'number': {
      // Numeric answer with optional tolerance
      const numVal = parseFloat(String(studentAnswer).replace(',', '.'));
      if (isNaN(numVal)) {
        return {
          pointsEarned: 0,
          maxPoints: weight,
          isCorrect: false,
          isPartiallyCorrect: false,
          fraction: 0,
          details: { error: 'invalid_number' }
        };
      }

      let isCorrect = false;
      if (question.tolerance !== undefined) {
        const target = parseFloat(question.correctNumber);
        const tol = Math.abs(parseFloat(question.tolerance));
        isCorrect = Math.abs(numVal - target) <= tol;
      } else if (question.range && Array.isArray(question.range) && question.range.length === 2) {
        isCorrect = numVal >= question.range[0] && numVal <= question.range[1];
      } else {
        const target = parseFloat(question.correctNumber);
        isCorrect = Math.abs(numVal - target) < 1e-6;
      }

      return {
        pointsEarned: isCorrect ? weight : 0,
        maxPoints: weight,
        isCorrect,
        isPartiallyCorrect: false,
        fraction: isCorrect ? 1 : 0,
        details: { studentVal: numVal, correctNumber: question.correctNumber }
      };
    }

    case 'order': {
      // Ordering / Sequence: studentAnswer is an array of IDs in the student's order
      const submittedOrder = Array.isArray(studentAnswer) ? studentAnswer.map(String) : [];
      let expectedOrder = [];

      if (Array.isArray(question.orderedItems)) {
        // If orderedItems is strings or objects with id
        expectedOrder = question.orderedItems.map((item, idx) =>
          typeof item === 'object' && item.id ? String(item.id) : String(idx)
        );
      } else if (Array.isArray(question.answers)) {
        expectedOrder = [...question.answers]
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(a => String(a.id));
      }

      const totalItems = expectedOrder.length;
      if (totalItems === 0 || submittedOrder.length !== totalItems) {
        return {
          pointsEarned: 0,
          maxPoints: weight,
          isCorrect: false,
          isPartiallyCorrect: false,
          fraction: 0,
          details: { reason: 'length_mismatch' }
        };
      }

      let correctPositions = 0;
      for (let i = 0; i < totalItems; i++) {
        if (submittedOrder[i] === expectedOrder[i]) {
          correctPositions++;
        }
      }

      const fraction = Math.round((correctPositions / totalItems) * 10000) / 10000;
      const pointsEarned = Math.round(fraction * weight * 100) / 100;
      const isFullCorrect = correctPositions === totalItems;
      const isPartiallyCorrect = correctPositions > 0 && !isFullCorrect;

      return {
        pointsEarned,
        maxPoints: weight,
        isCorrect: isFullCorrect,
        isPartiallyCorrect,
        fraction,
        details: { correctPositions, totalItems, submittedOrder, expectedOrder }
      };
    }

    case 'match': {
      // Matching pairs: studentAnswer is an Object { leftKey: rightKey, ... }
      const pairs = question.pairs || [];
      const totalPairs = pairs.length;

      if (totalPairs === 0 || !studentAnswer || typeof studentAnswer !== 'object') {
        return {
          pointsEarned: 0,
          maxPoints: weight,
          isCorrect: false,
          isPartiallyCorrect: false,
          fraction: 0,
          details: { reason: 'invalid_pairs' }
        };
      }

      let correctMatches = 0;
      pairs.forEach(pair => {
        const leftKey = String(pair.leftId !== undefined ? pair.leftId : pair.left);
        const expectedRight = String(pair.rightId !== undefined ? pair.rightId : pair.right);
        const studentRight = String(studentAnswer[leftKey] || '');

        if (studentRight === expectedRight) {
          correctMatches++;
        }
      });

      const fraction = Math.round((correctMatches / totalPairs) * 10000) / 10000;
      const pointsEarned = Math.round(fraction * weight * 100) / 100;
      const isFullCorrect = correctMatches === totalPairs;
      const isPartiallyCorrect = correctMatches > 0 && !isFullCorrect;

      return {
        pointsEarned,
        maxPoints: weight,
        isCorrect: isFullCorrect,
        isPartiallyCorrect,
        fraction,
        details: { correctMatches, totalPairs, studentMatches: studentAnswer }
      };
    }

    default:
      return {
        pointsEarned: 0,
        maxPoints: weight,
        isCorrect: false,
        isPartiallyCorrect: false,
        fraction: 0,
        details: { error: `unknown_question_type: ${type}` }
      };
  }
}

/**
 * Calculates final grade and evaluation based on percentage score.
 * @param {number} percentage
 * @param {Object} gradingScale
 * @param {number} passingScorePercent
 * @returns {Object} Grade breakdown with numerical and text descriptors
 */
export function calculateGrade(percentage, gradingScale = null, passingScorePercent = 55) {
  const percent = Math.min(100, Math.max(0, Math.round(percentage * 10) / 10));
  const isPassed = percent >= passingScorePercent;

  // Standard 5-point scale (Default in Uzbekistan academic institutions)
  const default5Scale = {
    5: 86, // 86% - 100%: A'lo / Отлично
    4: 71, // 71% - 85%: Yaxshi / Хорошо
    3: 55, // 55% - 70%: Qoniqarli / Удовлетворительно
    2: 0   // < 55%: Qoniqarsiz / Неудовлетворительно
  };

  const scaleCutoffs = gradingScale?.cutoffs || default5Scale;

  let gradeNumber = '2';
  let gradeKey = 'grade_2';

  if (percent >= (scaleCutoffs['5'] ?? 86)) {
    gradeNumber = '5';
    gradeKey = 'grade_5';
  } else if (percent >= (scaleCutoffs['4'] ?? 71)) {
    gradeNumber = '4';
    gradeKey = 'grade_4';
  } else if (percent >= (scaleCutoffs['3'] ?? 55)) {
    gradeNumber = '3';
    gradeKey = 'grade_3';
  } else {
    gradeNumber = '2';
    gradeKey = 'grade_2';
  }

  return {
    percentage: percent,
    isPassed,
    gradeNumber,
    gradeKey,
    passingThreshold: passingScorePercent
  };
}

/**
 * Calculates comprehensive test results across all questions and answers.
 * @param {Array<Object>} questions - The list of active test questions
 * @param {Object} studentAnswers - Map of questionId -> studentAnswer
 * @param {Object} settings - Test configuration (gradingScale, passingScorePercent)
 * @returns {Object} Comprehensive test performance report
 */
export function calculateTestResults(questions, studentAnswers, settings = {}) {
  let totalPointsEarned = 0;
  let totalMaxPoints = 0;
  let correctCount = 0;
  let partialCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const itemResults = questions.map((q, index) => {
    const answer = studentAnswers[q.id];
    const score = scoreQuestion(q, answer);

    totalPointsEarned += score.pointsEarned;
    totalMaxPoints += score.maxPoints;

    if (answer === undefined || answer === null || answer === '') {
      unansweredCount++;
    } else if (score.isCorrect) {
      correctCount++;
    } else if (score.isPartiallyCorrect) {
      partialCount++;
    } else {
      incorrectCount++;
    }

    return {
      index: index + 1,
      questionId: q.id,
      questionText: q.text,
      questionType: q.type,
      pointsEarned: score.pointsEarned,
      maxPoints: score.maxPoints,
      fraction: score.fraction,
      isCorrect: score.isCorrect,
      isPartiallyCorrect: score.isPartiallyCorrect,
      studentAnswer: answer,
      details: score.details,
      explanation: q.explanation || null
    };
  });

  totalPointsEarned = Math.round(totalPointsEarned * 100) / 100;
  totalMaxPoints = Math.round(totalMaxPoints * 100) / 100;

  const percentage = totalMaxPoints > 0
    ? Math.round((totalPointsEarned / totalMaxPoints) * 1000) / 10
    : 0;

  const gradeInfo = calculateGrade(
    percentage,
    settings.gradingScale,
    settings.passingScorePercent || 55
  );

  return {
    summary: {
      totalQuestions: questions.length,
      correctCount,
      partialCount,
      incorrectCount,
      unansweredCount,
      totalPointsEarned,
      totalMaxPoints,
      percentage,
      ...gradeInfo
    },
    itemResults
  };
}
