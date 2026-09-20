/**
 * Test Importer for MyTestStudent Web
 * Supports parsing native JSON, CSV spreadsheets, and binary .MTF test files.
 */

/**
 * Validates and normalizes raw JSON test object against the standard schema.
 * @param {Object} rawData
 * @returns {Object} Clean validated test object
 */
export function parseJSONTest(rawData) {
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('Yaroqsiz JSON formati!');
  }

  const questions = Array.isArray(rawData.questions) ? rawData.questions : [];
  if (questions.length === 0) {
    throw new Error('Test faylida savollar topilmadi!');
  }

  const cleanQuestions = questions.map((q, idx) => {
    const id = q.id || `q_${idx + 1}`;
    const type = q.type || 'single';
    const weight = typeof q.weight === 'number' && q.weight > 0 ? q.weight : 1;
    const text = String(q.text || `Savol #${idx + 1}`).trim();

    return {
      ...q,
      id,
      type,
      weight,
      text,
      explanation: q.explanation || null
    };
  });

  return {
    version: rawData.version || '1.0',
    meta: {
      title: rawData.meta?.title || 'Yangi Test',
      description: rawData.meta?.description || '',
      author: rawData.meta?.author || '',
      createdAt: rawData.meta?.createdAt || new Date().toISOString().split('T')[0],
      totalQuestionsInFile: cleanQuestions.length
    },
    settings: {
      timeLimitMinutes: rawData.settings?.timeLimitMinutes ?? 30,
      timeLimitPerQuestion: rawData.settings?.timeLimitPerQuestion ?? 0,
      questionsToSelect: rawData.settings?.questionsToSelect ?? 0,
      randomizeQuestions: rawData.settings?.randomizeQuestions ?? true,
      randomizeAnswers: rawData.settings?.randomizeAnswers ?? true,
      allowPrevious: rawData.settings?.allowPrevious ?? true,
      immediateFeedback: rawData.settings?.immediateFeedback ?? false,
      showResultsAtEnd: rawData.settings?.showResultsAtEnd ?? true,
      allowReview: rawData.settings?.allowReview ?? true,
      passingScorePercent: rawData.settings?.passingScorePercent ?? 55,
      gradingScale: rawData.settings?.gradingScale || {
        type: '5-point',
        cutoffs: { '5': 86, '4': 71, '3': 55, '2': 0 }
      }
    },
    questions: cleanQuestions
  };
}

/**
 * Parses simple CSV formatted test sheets.
 * Format: Type,Question,Weight,OptionA,OptionB,OptionC,OptionD,CorrectAnswer
 * @param {string} csvText
 * @returns {Object}
 */
export function parseCSVTest(csvText, title = 'CSV Test Bank') {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV fayli yetarli ma\'lumotga ega emas!');
  }

  const questions = [];
  // Skip header if first row starts with 'Type' or 'Savol' or 'Question'
  const firstLine = lines[0].toLowerCase();
  const startIndex = (firstLine.includes('type') || firstLine.includes('savol')) ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    // Simple CSV parser supporting quotes
    const row = splitCSVLine(lines[i]);
    if (row.length < 3) continue;

    const type = (row[0] || 'single').trim().toLowerCase();
    const text = (row[1] || '').trim();
    const weight = parseFloat(row[2]) || 1;

    if (!text) continue;

    if (type === 'single' || type === 'multiple') {
      const correctMarker = (row[row.length - 1] || '').trim();
      const optionTexts = row.slice(3, row.length - 1).filter(t => t.trim() !== '');

      const answers = optionTexts.map((optText, oIdx) => {
        const letter = String.fromCharCode(65 + oIdx); // A, B, C, D...
        const isCorr = correctMarker.includes(letter) ||
                       correctMarker.includes(String(oIdx + 1)) ||
                       correctMarker.toLowerCase() === optText.trim().toLowerCase();

        return {
          id: `a_${oIdx + 1}`,
          text: optText.trim(),
          correct: isCorr
        };
      });

      questions.push({
        id: `csv_q_${questions.length + 1}`,
        type,
        weight,
        text,
        answers
      });
    } else if (type === 'boolean') {
      const correctVal = String(row[3] || '').trim().toLowerCase();
      questions.push({
        id: `csv_q_${questions.length + 1}`,
        type: 'boolean',
        weight,
        text,
        correctAnswer: correctVal === 'true' || correctVal === 'ha' || correctVal === '1'
      });
    } else if (type === 'text') {
      const valid = row.slice(3).map(s => s.trim()).filter(Boolean);
      questions.push({
        id: `csv_q_${questions.length + 1}`,
        type: 'text',
        weight,
        text,
        validAnswers: valid,
        caseSensitive: false
      });
    }
  }

  if (questions.length === 0) {
    throw new Error('CSV faylidan birorta ham yaroqli savol o\'qib olinmadi.');
  }

  return parseJSONTest({
    meta: { title },
    questions
  });
}

function splitCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result.map(s => s.replace(/^"|"$/g, '').trim());
}

/**
 * Binary MTF Parser for MyTestX test files.
 * Extracts embedded text, metadata, and questions from .mtf binary byte stream.
 * @param {ArrayBuffer} buffer
 * @param {string} filename
 * @returns {Object} Parsed test structure
 */
export function parseMTFBinary(buffer, filename = 'MyTest_Import.mtf') {
  const bytes = new Uint8Array(buffer);

  // MyTestX files often start with signatures or contain Pascal/Delphi string blocks
  // Let's inspect text strings inside the binary buffer (Windows-1251, UTF-8, or UTF-16)
  let text = '';
  try {
    const decoder1251 = new TextDecoder('windows-1251');
    text = decoder1251.decode(bytes);
  } catch (e) {
    const decoderUtf8 = new TextDecoder('utf-8');
    text = decoderUtf8.decode(bytes);
  }

  // Look for text fragments containing question markers, options, or test titles
  const extractedQuestions = [];

  // Match blocks formatted by MyTestX editor or text dumps
  // If the MTF contains clean text streams or delimiter blocks
  const questionRegex = /(?:(\d+)\.\s*)?([^\r\n?]+(?:\?|:))([\s\S]*?)(?=(?:\r?\n\s*\d+\.|\r?\n\s*[A-ZА-ЯЁa-zа-яё]\)|$))/g;

  // Generic heuristic extraction for text-bearing MTF streams:
  // Split on null bytes / delimiter characters
  const chunks = text
    .split(/[\x00-\x08\x0B\x0C\x0E-\x1F]+/)
    .map(s => s.trim())
    .filter(s => s.length > 5 && !/^[A-Za-z0-9+/=]{20,}$/.test(s));

  // Find questions with question marks or options
  let currentQ = null;
  let qCounter = 1;

  for (const chunk of chunks) {
    if (chunk.includes('?') || chunk.endsWith(':') || chunk.length > 40) {
      if (currentQ && currentQ.answers.length > 0) {
        extractedQuestions.push(currentQ);
      }
      currentQ = {
        id: `mtf_${qCounter++}`,
        type: 'single',
        weight: 1,
        text: chunk,
        answers: []
      };
    } else if (currentQ && chunk.length > 1 && currentQ.answers.length < 6) {
      const isCorrect = chunk.startsWith('+') || chunk.startsWith('*');
      const cleanText = chunk.replace(/^[+*~-]\s*/, '').trim();
      currentQ.answers.push({
        id: `a_${currentQ.answers.length + 1}`,
        text: cleanText,
        correct: isCorrect || currentQ.answers.length === 0 // default first if none marked
      });
    }
  }
  if (currentQ && currentQ.answers.length > 0) {
    extractedQuestions.push(currentQ);
  }

  // Ensure at least one answer is marked correct for each question
  extractedQuestions.forEach(q => {
    if (!q.answers.some(a => a.correct) && q.answers.length > 0) {
      q.answers[0].correct = true;
    }
  });

  if (extractedQuestions.length === 0) {
    throw new Error('MTF faylidagi savollarni o\'qish imkoni bo\'lmadi. Fayl shifrlangan bo\'lishi mumkin.');
  }

  return parseJSONTest({
    meta: {
      title: filename.replace(/\.[^/.]+$/, ''),
      description: 'Imported from MyTestX binary MTF file',
      author: 'MyTestX Importer'
    },
    questions: extractedQuestions
  });
}
