/**
 * UI Rendering and DOM Controller for MyTestStudent Web
 * Handles view switching, dynamic question renderers, timer loops,
 * palette updates, results generation, and error review.
 */

import { t, getLanguage, setLanguage } from './localization.js';
import {
  setAnswer,
  toggleFlag,
  getQuestionPaletteStatus
} from './question-manager.js';
import { calculateTestResults } from './scoring.js';
import { exportResultToJSON, exportResultToCSV, printAssessmentReport } from './exporter.js';
import { saveAttemptHistory } from './storage.js';

export class UIController {
  constructor() {
    this.session = null;
    this.studentInfo = { name: '', group: '' };
    this.timerInterval = null;
    this.testResults = null;
    this.currentReviewFilter = 'all';

    this.cacheDOM();
    this.bindEvents();
    this.applyTranslations();
  }

  cacheDOM() {
    // Views
    this.views = {
      selector: document.getElementById('view-selector'),
      register: document.getElementById('view-register'),
      testing: document.getElementById('view-testing'),
      results: document.getElementById('view-results'),
      review: document.getElementById('view-review')
    };

    // Header Controls
    this.themeToggleBtn = document.getElementById('theme-toggle-btn');
    this.langSelect = document.getElementById('lang-select');

    // Test Selector
    this.testFileInput = document.getElementById('test-file-input');
    this.dropzone = document.getElementById('upload-dropzone');
    this.loadSampleBtn = document.getElementById('load-sample-btn');
    this.savedTestsList = document.getElementById('saved-tests-list');

    // Registration
    this.studentNameInput = document.getElementById('reg-student-name');
    this.studentGroupInput = document.getElementById('reg-student-group');
    this.beginTestBtn = document.getElementById('btn-begin-test');
    this.regTestTitle = document.getElementById('reg-test-title');

    // Testing Interface
    this.testTitleActive = document.getElementById('active-test-title');
    this.testCounter = document.getElementById('active-test-counter');
    this.timerDisplay = document.getElementById('timer-display');
    this.qtypeInstruction = document.getElementById('qtype-instruction');
    this.qWeightBadge = document.getElementById('q-weight-badge');
    this.questionStem = document.getElementById('question-stem');
    this.answersContainer = document.getElementById('answers-container');
    this.paletteGrid = document.getElementById('palette-grid');

    this.btnPrev = document.getElementById('btn-prev');
    this.btnNext = document.getElementById('btn-next');
    this.btnFlag = document.getElementById('btn-flag');
    this.btnFinish = document.getElementById('btn-finish');

    // Results Dashboard
    this.scoreCircleProgress = document.getElementById('score-circle-progress');
    this.scoreCirclePercent = document.getElementById('score-circle-percent');
    this.gradeBadge = document.getElementById('grade-badge');
    this.statusBadge = document.getElementById('status-badge');
    this.resStudentName = document.getElementById('res-student-name');
    this.resStudentGroup = document.getElementById('res-student-group');
    this.resTestName = document.getElementById('res-test-name');
    this.resDateTime = document.getElementById('res-date-time');
    this.resTotalScore = document.getElementById('res-total-score');
    this.resCorrectCount = document.getElementById('res-correct-count');
    this.resPartialCount = document.getElementById('res-partial-count');
    this.resIncorrectCount = document.getElementById('res-incorrect-count');
    this.resUnansweredCount = document.getElementById('res-unanswered-count');

    this.btnGoReview = document.getElementById('btn-go-review');
    this.btnRetryTest = document.getElementById('btn-retry-test');
    this.btnExportJSON = document.getElementById('btn-export-json');
    this.btnExportCSV = document.getElementById('btn-export-csv');
    this.btnPrintReport = document.getElementById('btn-print-report');

    // Review Mistakes
    this.reviewListContainer = document.getElementById('review-list-container');
    this.btnBackResults = document.getElementById('btn-back-results');
    this.reviewFilterTabs = document.querySelectorAll('.review-filter-tab');
  }

  bindEvents() {
    // Theme toggle
    this.themeToggleBtn?.addEventListener('click', () => this.toggleTheme());

    // Language switch
    this.langSelect?.addEventListener('change', (e) => {
      setLanguage(e.target.value);
      this.applyTranslations();
      if (this.session && !this.session.isCompleted) {
        this.renderActiveQuestion();
        this.renderPalette();
      } else if (this.testResults) {
        this.renderResultsView();
      }
    });

    // Student Registration
    this.beginTestBtn?.addEventListener('click', () => this.handleBeginTest());

    // Navigation buttons
    this.btnPrev?.addEventListener('click', () => this.navigateQuestion(-1));
    this.btnNext?.addEventListener('click', () => this.navigateQuestion(1));
    this.btnFlag?.addEventListener('click', () => this.handleToggleFlag());
    this.btnFinish?.addEventListener('click', () => this.handleFinishTest(false));

    // Results Actions
    this.btnGoReview?.addEventListener('click', () => this.switchView('review'));
    this.btnBackResults?.addEventListener('click', () => this.switchView('results'));
    this.btnRetryTest?.addEventListener('click', () => this.handleRetryTest());
    this.btnExportJSON?.addEventListener('click', () => {
      if (this.testResults) exportResultToJSON(this.testResults);
    });
    this.btnExportCSV?.addEventListener('click', () => {
      if (this.testResults) exportResultToCSV(this.testResults);
    });
    this.btnPrintReport?.addEventListener('click', () => printAssessmentReport());

    // Review Filters
    this.reviewFilterTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.reviewFilterTabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        this.currentReviewFilter = e.target.dataset.filter;
        this.renderReviewItems();
      });
    });
  }

  applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
          el.setAttribute('placeholder', t(key));
        } else {
          el.textContent = t(key);
        }
      }
    });

    if (this.langSelect) {
      this.langSelect.value = getLanguage();
    }
  }

  toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    try {
      localStorage.setItem('mytest_theme', newTheme);
    } catch (e) {}
  }

  switchView(viewName) {
    Object.keys(this.views).forEach(key => {
      if (this.views[key]) {
        this.views[key].classList.toggle('active', key === viewName);
      }
    });

    if (viewName === 'review') {
      this.renderReviewItems();
    }
  }

  // Registration & Start Flow
  startRegistrationFlow(testData) {
    this.pendingTestData = testData;
    if (this.regTestTitle) {
      this.regTestTitle.textContent = testData.meta?.title || 'Test';
    }

    // Prefill stored user profile if available
    try {
      const savedUser = JSON.parse(localStorage.getItem('mytest_user') || '{}');
      if (savedUser.name && this.studentNameInput) this.studentNameInput.value = savedUser.name;
      if (savedUser.group && this.studentGroupInput) this.studentGroupInput.value = savedUser.group;
    } catch (e) {}

    this.switchView('register');
    this.studentNameInput?.focus();
  }

  handleBeginTest() {
    const name = this.studentNameInput?.value.trim();
    const group = this.studentGroupInput?.value.trim();

    if (!name) {
      alert(t('reg.error_required'));
      this.studentNameInput?.focus();
      return;
    }

    this.studentInfo = { name, group };
    try {
      localStorage.setItem('mytest_user', JSON.stringify(this.studentInfo));
    } catch (e) {}

    // Initialize session and transition to active testing view
    this.onStartSessionCallback?.(this.pendingTestData, this.studentInfo);
  }

  startTesting(session) {
    this.session = session;
    this.session.startTime = new Date();
    this.switchView('testing');

    if (this.testTitleActive) {
      this.testTitleActive.textContent = this.session.meta?.title || 'Test';
    }

    this.startTimer();
    this.renderActiveQuestion();
    this.renderPalette();
  }

  // Timer Management
  startTimer() {
    this.stopTimer();
    const totalSeconds = this.session.timeRemainingSeconds;
    if (totalSeconds <= 0) {
      // Unlimited
      if (this.timerDisplay) this.timerDisplay.textContent = t('test.unlimited');
      return;
    }

    const updateTimer = () => {
      if (this.session.timeRemainingSeconds <= 0) {
        this.stopTimer();
        alert(t('test.time_up_alert'));
        this.handleFinishTest(true);
        return;
      }

      this.session.timeRemainingSeconds--;
      const rem = this.session.timeRemainingSeconds;
      const m = Math.floor(rem / 60);
      const s = rem % 60;
      const formatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

      if (this.timerDisplay) {
        this.timerDisplay.textContent = formatted;
        this.timerDisplay.classList.toggle('danger', rem < 60);
        this.timerDisplay.classList.toggle('warning', rem >= 60 && rem < 300);
      }
    };

    updateTimer();
    this.timerInterval = setInterval(updateTimer, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Question Rendering
  renderActiveQuestion() {
    const q = this.session.questions[this.session.currentIndex];
    if (!q) return;

    // Counter
    if (this.testCounter) {
      this.testCounter.textContent = t('test.question_of', {
        current: this.session.currentIndex + 1,
        total: this.session.questions.length
      });
    }

    // Question weight
    if (this.qWeightBadge) {
      this.qWeightBadge.textContent = `${q.weight || 1} ball`;
    }

    // Instruction by type
    if (this.qtypeInstruction) {
      this.qtypeInstruction.textContent = t(`qtype.${q.type}`) || '';
    }

    // Stem
    if (this.questionStem) {
      this.questionStem.textContent = `${this.session.currentIndex + 1}. ${q.text}`;
    }

    // Review flag button state
    const isFlagged = this.session.flagged.has(q.id);
    if (this.btnFlag) {
      this.btnFlag.textContent = isFlagged ? `🚩 ${t('test.unflag')}` : `🏳 ${t('test.flag')}`;
      this.btnFlag.classList.toggle('btn-outline', !isFlagged);
      this.btnFlag.classList.toggle('btn-secondary', isFlagged);
    }

    // Navigation buttons (allowPrevious check)
    if (this.btnPrev) {
      this.btnPrev.disabled = this.session.currentIndex === 0 || !this.session.settings.allowPrevious;
    }
    if (this.btnNext) {
      this.btnNext.disabled = this.session.currentIndex === this.session.questions.length - 1;
    }

    // Render answer options
    this.renderAnswersForQuestion(q);
  }

  renderAnswersForQuestion(q) {
    if (!this.answersContainer) return;
    this.answersContainer.innerHTML = '';
    const currentAnswer = this.session.answers[q.id];

    switch (q.type) {
      case 'single': {
        (q.answers || []).forEach(opt => {
          const card = document.createElement('label');
          card.className = `choice-card ${String(currentAnswer) === String(opt.id) ? 'selected' : ''}`;

          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = `q_${q.id}`;
          radio.value = opt.id;
          radio.className = 'choice-input';
          radio.checked = String(currentAnswer) === String(opt.id);

          radio.addEventListener('change', () => {
            setAnswer(this.session, q.id, opt.id);
            this.renderActiveQuestion();
            this.renderPalette();
          });

          const span = document.createElement('span');
          span.className = 'choice-label';
          span.textContent = opt.text;

          card.appendChild(radio);
          card.appendChild(span);
          this.answersContainer.appendChild(card);
        });
        break;
      }

      case 'multiple': {
        const selectedSet = new Set(Array.isArray(currentAnswer) ? currentAnswer.map(String) : []);

        (q.answers || []).forEach(opt => {
          const isChecked = selectedSet.has(String(opt.id));
          const card = document.createElement('label');
          card.className = `choice-card ${isChecked ? 'selected' : ''}`;

          const check = document.createElement('input');
          check.type = 'checkbox';
          check.value = opt.id;
          check.className = 'choice-input';
          check.checked = isChecked;

          check.addEventListener('change', () => {
            if (check.checked) {
              selectedSet.add(String(opt.id));
            } else {
              selectedSet.delete(String(opt.id));
            }
            setAnswer(this.session, q.id, Array.from(selectedSet));
            this.renderActiveQuestion();
            this.renderPalette();
          });

          const span = document.createElement('span');
          span.className = 'choice-label';
          span.textContent = opt.text;

          card.appendChild(check);
          card.appendChild(span);
          this.answersContainer.appendChild(card);
        });
        break;
      }

      case 'boolean': {
        const boolBox = document.createElement('div');
        boolBox.className = 'boolean-group';

        const trueBtn = document.createElement('button');
        trueBtn.type = 'button';
        trueBtn.className = `boolean-card ${currentAnswer === true ? 'selected-true' : ''}`;
        trueBtn.textContent = `✓ ${t('qtype.true')}`;
        trueBtn.addEventListener('click', () => {
          setAnswer(this.session, q.id, true);
          this.renderActiveQuestion();
          this.renderPalette();
        });

        const falseBtn = document.createElement('button');
        falseBtn.type = 'button';
        falseBtn.className = `boolean-card ${currentAnswer === false ? 'selected-false' : ''}`;
        falseBtn.textContent = `✗ ${t('qtype.false')}`;
        falseBtn.addEventListener('click', () => {
          setAnswer(this.session, q.id, false);
          this.renderActiveQuestion();
          this.renderPalette();
        });

        boolBox.appendChild(trueBtn);
        boolBox.appendChild(falseBtn);
        this.answersContainer.appendChild(boolBox);
        break;
      }

      case 'text': {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-input';
        input.placeholder = t('qtype.text');
        input.value = currentAnswer || '';
        input.addEventListener('input', (e) => {
          setAnswer(this.session, q.id, e.target.value);
          this.renderPalette();
        });
        this.answersContainer.appendChild(input);
        break;
      }

      case 'number': {
        const input = document.createElement('input');
        input.type = 'number';
        input.step = 'any';
        input.className = 'form-input';
        input.placeholder = t('qtype.number');
        input.value = currentAnswer !== undefined ? currentAnswer : '';
        input.addEventListener('input', (e) => {
          setAnswer(this.session, q.id, e.target.value);
          this.renderPalette();
        });
        this.answersContainer.appendChild(input);
        break;
      }

      case 'match': {
        const pairs = q.pairs || [];
        const rightOpts = q.shuffledRightOptions || [];
        const currentMatches = currentAnswer && typeof currentAnswer === 'object' ? { ...currentAnswer } : {};

        pairs.forEach((pair, pIdx) => {
          const row = document.createElement('div');
          row.className = 'match-pair-row';

          const leftSpan = document.createElement('div');
          leftSpan.className = 'match-left-item';
          leftSpan.textContent = `${pIdx + 1}. ${pair.left}`;

          const select = document.createElement('select');
          select.className = 'form-select';

          const defaultOpt = document.createElement('option');
          defaultOpt.value = '';
          defaultOpt.textContent = t('qtype.select_match_placeholder');
          select.appendChild(defaultOpt);

          const leftKey = String(pair.leftId !== undefined ? pair.leftId : pair.left);

          rightOpts.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.rightId;
            opt.textContent = r.right;
            if (currentMatches[leftKey] === String(r.rightId)) {
              opt.selected = true;
            }
            select.appendChild(opt);
          });

          select.addEventListener('change', (e) => {
            currentMatches[leftKey] = e.target.value;
            setAnswer(this.session, q.id, currentMatches);
            this.renderPalette();
          });

          row.appendChild(leftSpan);
          row.appendChild(select);
          this.answersContainer.appendChild(row);
        });
        break;
      }

      case 'order': {
        // Items list with up/down buttons for accessible ordering
        let items = Array.isArray(currentAnswer)
          ? currentAnswer.map(id => (q.displayItems || []).find(it => String(it.id) === String(id))).filter(Boolean)
          : [...(q.displayItems || [])];

        const container = document.createElement('div');

        items.forEach((item, idx) => {
          const row = document.createElement('div');
          row.className = 'order-item-row';

          const leftBox = document.createElement('div');
          leftBox.className = 'order-item-left';

          const badge = document.createElement('span');
          badge.className = 'order-badge-number';
          badge.textContent = idx + 1;

          const textSpan = document.createElement('span');
          textSpan.textContent = item.text;

          leftBox.appendChild(badge);
          leftBox.appendChild(textSpan);

          const arrows = document.createElement('div');
          arrows.className = 'order-arrows';

          const upBtn = document.createElement('button');
          upBtn.type = 'button';
          upBtn.className = 'btn btn-secondary btn-sm';
          upBtn.textContent = '▲';
          upBtn.title = t('qtype.order_up');
          upBtn.disabled = idx === 0;
          upBtn.addEventListener('click', () => {
            const temp = items[idx];
            items[idx] = items[idx - 1];
            items[idx - 1] = temp;
            setAnswer(this.session, q.id, items.map(it => it.id));
            this.renderAnswersForQuestion(q);
            this.renderPalette();
          });

          const downBtn = document.createElement('button');
          downBtn.type = 'button';
          downBtn.className = 'btn btn-secondary btn-sm';
          downBtn.textContent = '▼';
          downBtn.title = t('qtype.order_down');
          downBtn.disabled = idx === items.length - 1;
          downBtn.addEventListener('click', () => {
            const temp = items[idx];
            items[idx] = items[idx + 1];
            items[idx + 1] = temp;
            setAnswer(this.session, q.id, items.map(it => it.id));
            this.renderAnswersForQuestion(q);
            this.renderPalette();
          });

          arrows.appendChild(upBtn);
          arrows.appendChild(downBtn);

          row.appendChild(leftBox);
          row.appendChild(arrows);
          container.appendChild(row);
        });

        this.answersContainer.appendChild(container);
        break;
      }
    }
  }

  // Palette Rendering
  renderPalette() {
    if (!this.paletteGrid) return;
    this.paletteGrid.innerHTML = '';

    this.session.questions.forEach((q, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const status = getQuestionPaletteStatus(this.session, idx);
      btn.className = `palette-btn ${status}`;
      btn.textContent = idx + 1;

      btn.addEventListener('click', () => {
        if (!this.session.settings.allowPrevious && idx < this.session.currentIndex) {
          return; // Restricted navigation
        }
        this.session.currentIndex = idx;
        this.renderActiveQuestion();
        this.renderPalette();
      });

      this.paletteGrid.appendChild(btn);
    });
  }

  navigateQuestion(delta) {
    const newIdx = this.session.currentIndex + delta;
    if (newIdx >= 0 && newIdx < this.session.questions.length) {
      this.session.currentIndex = newIdx;
      this.renderActiveQuestion();
      this.renderPalette();
    }
  }

  handleToggleFlag() {
    const q = this.session.questions[this.session.currentIndex];
    if (q) {
      toggleFlag(this.session, q.id);
      this.renderActiveQuestion();
      this.renderPalette();
    }
  }

  // Finish & Results
  handleFinishTest(force = false) {
    if (!force && !confirm(t('test.confirm_finish'))) {
      return;
    }

    this.stopTimer();
    this.session.isCompleted = true;
    this.session.endTime = new Date();

    const results = calculateTestResults(
      this.session.questions,
      this.session.answers,
      this.session.settings
    );

    this.testResults = {
      ...results,
      student: this.studentInfo,
      meta: this.session.meta,
      sessionTimes: {
        startTime: this.session.startTime,
        endTime: this.session.endTime
      }
    };

    // Save to IndexedDB history
    saveAttemptHistory(this.testResults).catch(err => console.warn('History save failed', err));

    this.renderResultsView();
    this.switchView('results');
  }

  renderResultsView() {
    if (!this.testResults) return;
    const s = this.testResults.summary;

    if (this.resStudentName) this.resStudentName.textContent = this.studentInfo.name;
    if (this.resStudentGroup) this.resStudentGroup.textContent = this.studentInfo.group || '-';
    if (this.resTestName) this.resTestName.textContent = this.testResults.meta?.title || 'Test';
    if (this.resDateTime) this.resDateTime.textContent = new Date().toLocaleString();

    // Circular score gauge
    if (this.scoreCirclePercent) {
      this.scoreCirclePercent.textContent = `${s.percentage}%`;
    }

    if (this.scoreCircleProgress) {
      const radius = 64;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (s.percentage / 100) * circumference;
      this.scoreCircleProgress.style.strokeDasharray = `${circumference} ${circumference}`;
      this.scoreCircleProgress.style.strokeDashoffset = offset;
      this.scoreCircleProgress.style.stroke = s.isPassed ? 'var(--color-success)' : 'var(--color-danger)';
    }

    // Grade Badge
    if (this.gradeBadge) {
      this.gradeBadge.className = `grade-badge grade-${s.gradeNumber}`;
      this.gradeBadge.textContent = t(s.gradeKey) || s.gradeNumber;
    }

    // Status Badge (Zachet / Nezachet)
    if (this.statusBadge) {
      this.statusBadge.className = `status-badge ${s.isPassed ? 'passed' : 'failed'}`;
      this.statusBadge.textContent = s.isPassed ? t('results.passed') : t('results.failed');
    }

    // Metrics
    if (this.resTotalScore) this.resTotalScore.textContent = `${s.totalPointsEarned} / ${s.totalMaxPoints}`;
    if (this.resCorrectCount) this.resCorrectCount.textContent = s.correctCount;
    if (this.resPartialCount) this.resPartialCount.textContent = s.partialCount;
    if (this.resIncorrectCount) this.resIncorrectCount.textContent = s.incorrectCount;
    if (this.resUnansweredCount) this.resUnansweredCount.textContent = s.unansweredCount;

    // Review button permission check
    if (this.btnGoReview) {
      this.btnGoReview.style.display = this.session?.settings.allowReview !== false ? 'inline-flex' : 'none';
    }
  }

  renderReviewItems() {
    if (!this.reviewListContainer || !this.testResults) return;
    this.reviewListContainer.innerHTML = '';

    const items = this.testResults.itemResults || [];
    const filter = this.currentReviewFilter;

    const filtered = items.filter(item => {
      if (filter === 'correct') return item.isCorrect;
      if (filter === 'incorrect') return !item.isCorrect;
      return true;
    });

    if (filtered.length === 0) {
      this.reviewListContainer.innerHTML = `<p style="color:var(--text-secondary); text-align:center; padding:2rem;">Hech qanday savol mos kelmadi.</p>`;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      const statusClass = item.isCorrect ? 'correct' : item.isPartiallyCorrect ? 'partial' : 'incorrect';
      card.className = `review-card ${statusClass}`;

      const headerRow = document.createElement('div');
      headerRow.style.display = 'flex';
      headerRow.style.justifyContent = 'space-between';
      headerRow.style.marginBottom = '0.5rem';

      const numSpan = document.createElement('strong');
      numSpan.textContent = `${item.index}-savol (${item.pointsEarned} / ${item.maxPoints} ball)`;

      const statusTag = document.createElement('span');
      statusTag.style.fontWeight = '700';
      statusTag.style.color = item.isCorrect ? 'var(--color-success)' : item.isPartiallyCorrect ? 'var(--color-warning)' : 'var(--color-danger)';
      statusTag.textContent = item.isCorrect ? '✓ To\'g\'ri' : item.isPartiallyCorrect ? '⚠ Qisman to\'g\'ri' : '✗ Noto\'g\'ri';

      headerRow.appendChild(numSpan);
      headerRow.appendChild(statusTag);

      const stemP = document.createElement('p');
      stemP.style.fontWeight = '600';
      stemP.style.marginBottom = '0.75rem';
      stemP.textContent = item.questionText;

      const userAnsBox = document.createElement('div');
      userAnsBox.className = 'review-ans-box';
      userAnsBox.innerHTML = `<strong>${t('review.your_answer')}</strong> ${this.formatAnswerForDisplay(item.studentAnswer)}`;

      card.appendChild(headerRow);
      card.appendChild(stemP);
      card.appendChild(userAnsBox);

      if (item.explanation) {
        const expBox = document.createElement('div');
        expBox.className = 'review-explanation';
        expBox.innerHTML = `<strong>${t('review.explanation')}</strong> ${item.explanation}`;
        card.appendChild(expBox);
      }

      this.reviewListContainer.appendChild(card);
    });
  }

  formatAnswerForDisplay(ans) {
    if (ans === undefined || ans === null || ans === '') {
      return `<em style="color:var(--text-muted);">${t('review.no_answer')}</em>`;
    }
    if (typeof ans === 'boolean') {
      return ans ? t('qtype.true') : t('qtype.false');
    }
    if (Array.isArray(ans)) {
      return ans.join(', ');
    }
    if (typeof ans === 'object') {
      return Object.entries(ans).map(([k, v]) => `${k} → ${v}`).join('; ');
    }
    return String(ans);
  }

  handleRetryTest() {
    if (this.pendingTestData && this.studentInfo) {
      this.onStartSessionCallback?.(this.pendingTestData, this.studentInfo);
    } else {
      this.switchView('selector');
    }
  }
}
