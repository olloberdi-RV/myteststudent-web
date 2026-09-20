/**
 * Exporter Module for MyTestStudent Web
 * Generates JSON, CSV, and printable documents from test assessment records.
 */

import { t } from './localization.js';

/**
 * Downloads data as a file in the browser.
 * @param {string} content
 * @param {string} filename
 * @param {string} mimeType
 */
export function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports test result to formatted JSON file.
 * @param {Object} resultData
 */
export function exportResultToJSON(resultData) {
  const jsonStr = JSON.stringify(resultData, null, 2);
  const safeName = (resultData.student?.name || 'Talaba').replace(/[^a-zA-Z0-9_\u0400-\u04FF]/g, '_');
  const filename = `Natija_${safeName}_${Date.now()}.json`;
  triggerDownload(jsonStr, filename, 'application/json');
}

/**
 * Exports test results to CSV table suitable for Excel / LibreOffice.
 * @param {Object} resultData
 */
export function exportResultToCSV(resultData) {
  const s = resultData.summary || {};
  const student = resultData.student || {};
  const meta = resultData.meta || {};

  const lines = [
    `"Hisobot turi","MyTestStudent Web Yakuniy Natijalari"`,
    `"Test nomi","${escapeCSV(meta.title || '')}"`,
    `"Talaba F.I.SH.","${escapeCSV(student.name || '')}"`,
    `"Guruhi","${escapeCSV(student.group || '')}"`,
    `"Sana va vaqt","${new Date().toLocaleString()}"`,
    `"Umumiy ball","${s.totalPointsEarned} / ${s.totalMaxPoints}"`,
    `"Foiz ko'rsatkichi","${s.percentage}%"`,
    `"Yakuniy baho","${t(s.gradeKey) || s.gradeNumber}"`,
    `"Holati","${s.isPassed ? t('results.passed') : t('results.failed')}"`,
    '',
    `"№","Savol matni","Savol turi","Olingan ball","Maksimal ball","Holati"`
  ];

  (resultData.itemResults || []).forEach(item => {
    const statusText = item.isCorrect
      ? 'To\'g\'ri'
      : item.isPartiallyCorrect
      ? 'Qisman to\'g\'ri'
      : 'Noto\'g\'ri';

    lines.push([
      item.index,
      `"${escapeCSV(item.questionText)}"`,
      `"${item.questionType}"`,
      item.pointsEarned,
      item.maxPoints,
      `"${statusText}"`
    ].join(','));
  });

  const csvContent = '\uFEFF' + lines.join('\r\n'); // Include UTF-8 BOM for Excel compatibility
  const safeName = (student.name || 'Talaba').replace(/[^a-zA-Z0-9_\u0400-\u04FF]/g, '_');
  const filename = `Natija_${safeName}_${Date.now()}.csv`;
  triggerDownload(csvContent, filename, 'text/csv;charset=utf-8;');
}

function escapeCSV(str) {
  return String(str || '').replace(/"/g, '""');
}

/**
 * Opens a print dialog with a clean, printer-optimized assessment certificate.
 */
export function printAssessmentReport() {
  window.print();
}
