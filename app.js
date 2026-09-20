/**
 * Main Application Orchestrator for MyTestStudent Web
 * Integrates UI, Session Engine, Storage, and File Importers.
 */

import { initLocalization, t } from './localization.js';
import { UIController } from './ui.js';
import { initializeTestSession } from './question-manager.js';
import { parseJSONTest, parseCSVTest, parseMTFBinary } from './importer.js';
import { getAllTests, saveTest, deleteTest } from './storage.js';

class MyTestApp {
  constructor() {
    this.ui = null;
  }

  async init() {
    initLocalization();

    // Set saved theme if exists
    try {
      const savedTheme = localStorage.getItem('mytest_theme');
      if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
    } catch (e) {}

    this.ui = new UIController();

    // Hook session starter
    this.ui.onStartSessionCallback = (testData, studentInfo) => {
      const session = initializeTestSession(testData);
      this.ui.startTesting(session);
    };

    this.bindFileEvents();
    await this.refreshSavedTestsList();
    this.registerServiceWorker();
  }

  bindFileEvents() {
    // Load sample test
    this.ui.loadSampleBtn?.addEventListener('click', async () => {
      try {
        const response = await fetch('./data/sample-tests/ginekologiya5kurs_sample.json');
        if (!response.ok) throw new Error('Namuna fayli yuklanmadi');
        const testData = await response.json();
        const parsed = parseJSONTest(testData);
        await saveTest(parsed);
        await this.refreshSavedTestsList();
        this.ui.startRegistrationFlow(parsed);
      } catch (err) {
        alert(`Xatolik: ${err.message}`);
      }
    });

    // File input picker
    this.ui.testFileInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        await this.handleFile(file);
      }
    });

    // Drag & drop dropzone
    const dropzone = this.ui.dropzone;
    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
      });

      dropzone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const file = e.dataTransfer.files?.[0];
        if (file) {
          await this.handleFile(file);
        }
      });

      dropzone.addEventListener('click', () => {
        this.ui.testFileInput?.click();
      });
    }
  }

  async handleFile(file) {
    try {
      const filename = file.name.toLowerCase();
      let parsedTest = null;

      if (filename.endsWith('.json')) {
        const text = await file.text();
        const raw = JSON.parse(text);
        parsedTest = parseJSONTest(raw);
      } else if (filename.endsWith('.csv')) {
        const text = await file.text();
        parsedTest = parseCSVTest(text, file.name.replace(/\.[^/.]+$/, ''));
      } else if (filename.endsWith('.mtf')) {
        const buffer = await file.arrayBuffer();
        parsedTest = parseMTFBinary(buffer, file.name);
      } else {
        throw new Error('Faqat .json, .mtf yoki .csv formatidagi fayllar qabul qilinadi.');
      }

      await saveTest(parsedTest);
      await this.refreshSavedTestsList();
      this.ui.startRegistrationFlow(parsedTest);
    } catch (err) {
      console.error(err);
      alert(`Faylni yuklashda xatolik: ${err.message}`);
    }
  }

  async refreshSavedTestsList() {
    if (!this.ui.savedTestsList) return;
    this.ui.savedTestsList.innerHTML = '';

    const tests = await getAllTests();

    if (tests.length === 0) {
      const p = document.createElement('p');
      p.style.color = 'var(--text-muted)';
      p.style.fontSize = '0.9rem';
      p.setAttribute('data-i18n', 'selector.no_tests');
      p.textContent = t('selector.no_tests');
      this.ui.savedTestsList.appendChild(p);
      return;
    }

    tests.forEach(test => {
      const item = document.createElement('div');
      item.className = 'saved-test-item';
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.justifyContent = 'space-between';
      item.style.padding = '0.75rem 1rem';
      item.style.border = '1px solid var(--border-subtle)';
      item.style.borderRadius = 'var(--radius-md)';
      item.style.marginBottom = '0.5rem';
      item.style.backgroundColor = 'var(--bg-surface-subtle)';

      const infoBox = document.createElement('div');
      const titleEl = document.createElement('strong');
      titleEl.style.display = 'block';
      titleEl.textContent = test.meta?.title || 'Test';

      const metaEl = document.createElement('span');
      metaEl.style.fontSize = '0.8rem';
      metaEl.style.color = 'var(--text-secondary)';
      const qCount = test.questions?.length || 0;
      const timeLimit = test.settings?.timeLimitMinutes ? `${test.settings.timeLimitMinutes} daqiqa` : 'Vaqt cheklovisiz';
      metaEl.textContent = `${qCount} ta savol • ${timeLimit}`;

      infoBox.appendChild(titleEl);
      infoBox.appendChild(metaEl);

      const actionBox = document.createElement('div');
      actionBox.style.display = 'flex';
      actionBox.style.gap = '0.5rem';

      const startBtn = document.createElement('button');
      startBtn.type = 'button';
      startBtn.className = 'btn btn-primary btn-sm';
      startBtn.textContent = t('selector.btn_start');
      startBtn.addEventListener('click', () => {
        this.ui.startRegistrationFlow(test);
      });

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn btn-secondary btn-sm';
      delBtn.textContent = '🗑';
      delBtn.title = t('selector.btn_delete');
      delBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Ushbu testni ro\'yxatdan o\'chirishni tasdiqlaysizmi?')) {
          await deleteTest(test.id);
          await this.refreshSavedTestsList();
        }
      });

      actionBox.appendChild(startBtn);
      actionBox.appendChild(delBtn);

      item.appendChild(infoBox);
      item.appendChild(actionBox);
      this.ui.savedTestsList.appendChild(item);
    });
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => console.log('PWA ServiceWorker registered with scope:', reg.scope))
          .catch(err => console.warn('ServiceWorker registration skipped:', err));
      });
    }
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new MyTestApp();
  app.init();
});
