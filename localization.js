/**
 * Internationalization (i18n) Module for MyTestStudent Web
 * Supports Uzbek Latin (default/primary), Russian, and English.
 */

export const DICTIONARIES = {
  uz: {
    // Header & Meta
    'app.title': 'MyTestStudent Web',
    'app.subtitle': 'Kompyuterlashtirilgan bilimni tekshirish tizimi',
    'theme.toggle': 'Mavzuni o\'zgartirish',
    'lang.select': 'Tilni tanlash',

    // Navigation & Tabs
    'nav.select': 'Test tanlash',
    'nav.register': 'Ro\'yxatdan o\'tish',
    'nav.testing': 'Test sinovi',
    'nav.results': 'Natijalar',
    'nav.review': 'Xatolar tahlili',

    // Test Selector
    'selector.title': 'Test to\'plamini tanlang',
    'selector.subtitle': 'Mavjud testlardan birini tanlang yoki .json / .mtf / .csv faylini yuklang',
    'selector.load_sample': 'Namunaviy test: Ginekologiya va Akusherlik (5-kurs)',
    'selector.upload_file': 'Faylni tanlang yoki shu yerga tashlang (.json, .mtf, .csv)',
    'selector.no_tests': 'Hozircha saqlangan testlar yo\'q. Fayl yuklang yoki namunaviy testni tanlang.',
    'selector.stored_tests': 'Saqlangan testlar',
    'selector.btn_start': 'Testga kirish',
    'selector.btn_delete': 'O\'chirish',

    // Student Registration
    'reg.title': 'Talabani ro\'yxatga olish',
    'reg.subtitle': 'Testni boshlashdan oldin ma\'lumotlaringizni kiriting',
    'reg.fullname': 'F.I.SH. (Familiya, Ism, Sharif)',
    'reg.fullname_placeholder': 'Masalan: Rayimov Olloberdi',
    'reg.group': 'Guruh / Kurs / Bo\'lim',
    'reg.group_placeholder': 'Masalan: 501-guruh, Davolash ishi',
    'reg.btn_begin': 'Testni boshlash',
    'reg.error_required': 'Iltimos, ism-familiyangizni kiriting!',

    // Testing Interface
    'test.question_of': 'Savol {current} / {total}',
    'test.time_left': 'Qolgan vaqt:',
    'test.unlimited': 'Cheklanmagan',
    'test.flag': 'Ko\'rib chiqish uchun belgilash',
    'test.unflag': 'Belgini olib tashlash',
    'test.btn_prev': '« Oldingi',
    'test.btn_next': 'Keyingi »',
    'test.btn_finish': 'Testni yakunlash',
    'test.confirm_finish': 'Rostdan ham testni yakunlamoqchimisiz? Javob berilmagan savollar 0 ball bilan baholanadi.',
    'test.time_up_alert': 'Ajratilgan vaqt tugadi! Test natijalari avtomatik hisoblanmoqda...',
    'test.palette_title': 'Savollar palitrasi',
    'test.palette_current': 'Joriy savol',
    'test.palette_answered': 'Javob berilgan',
    'test.palette_flagged': 'Belgilangan',
    'test.palette_unanswered': 'Javob berilmagan',

    // Question Type Labels & Instructions
    'qtype.single': 'Bitta to\'g\'ri javobni tanlang',
    'qtype.multiple': 'Bir yoki bir nechta to\'g\'ri javoblarni tanlang',
    'qtype.boolean': 'Tasdiq to\'g\'ri yoki noto\'g\'riligini belgilang',
    'qtype.text': 'Qisqa javobni kiriting',
    'qtype.number': 'Raqamli qiymatni kiriting',
    'qtype.order': 'Elementlarni to\'g\'ri ketma-ketlikda joylashtiring (ko\'tarish/tushirish)',
    'qtype.match': 'Mos keluvchi juftliklarni tanlang',
    'qtype.true': 'To\'g\'ri (Haqiqat)',
    'qtype.false': 'Noto\'g\'ri (Yolg\'on)',
    'qtype.order_up': 'Yuqoriga',
    'qtype.order_down': 'Pastga',
    'qtype.select_match_placeholder': '-- Muvofiq variantni tanlang --',

    // Results Dashboard
    'results.title': 'Test natijalari',
    'results.student': 'Talaba:',
    'results.group': 'Guruhi:',
    'results.test_name': 'Test nomi:',
    'results.date': 'Sana va vaqt:',
    'results.score': 'Umumiy to\'plangan ball:',
    'results.percentage': 'Foiz ko\'rsatkichi:',
    'results.grade': 'Yakuniy baho:',
    'results.status': 'Holati:',
    'results.passed': 'Sinovdan o\'tdi (ZACHET)',
    'results.failed': 'Sinovdan o\'tmadi (YIQILDI)',
    'results.correct_answers': 'To\'g\'ri javoblar:',
    'results.partial_answers': 'Qisman to\'g\'ri:',
    'results.incorrect_answers': 'Noto\'g\'ri javoblar:',
    'results.unanswered': 'Javobsiz qoldirilgan:',
    'results.btn_review': 'Xatolarni tahlil qilish',
    'results.btn_retry': 'Testni qayta topshirish',
    'results.btn_export_json': 'JSON yuklab olish',
    'results.btn_export_csv': 'CSV yuklab olish',
    'results.btn_print': 'Hisobotni chop etish',

    // Review Interface
    'review.title': 'Xatolar ustida ishlash',
    'review.subtitle': 'Savollar bo\'yicha to\'liq tahlil, sizning javoblaringiz va izohlar',
    'review.filter_all': 'Barcha savollar',
    'review.filter_correct': 'Faqat to\'g\'ri',
    'review.filter_incorrect': 'Xato va qisman',
    'review.your_answer': 'Sizning javobingiz:',
    'review.correct_answer': 'To\'g\'ri javob:',
    'review.explanation': 'Klinik / Ilmiy izoh:',
    'review.points': 'Ball:',
    'review.no_answer': '(Javob belgilanmagan)',
    'review.btn_back_results': '« Natijalarga qaytish',

    // Grading Labels
    'grade_5': '5 (A\'lo)',
    'grade_4': '4 (Yaxshi)',
    'grade_3': '3 (Qoniqarli)',
    'grade_2': '2 (Qoniqarsiz)'
  },

  ru: {
    'app.title': 'MyTestStudent Web',
    'app.subtitle': 'Компьютерная система тестирования знаний',
    'theme.toggle': 'Сменить тему',
    'lang.select': 'Выбор языка',

    'nav.select': 'Выбор теста',
    'nav.register': 'Регистрация',
    'nav.testing': 'Тестирование',
    'nav.results': 'Результаты',
    'nav.review': 'Работа над ошибками',

    'selector.title': 'Выберите тест',
    'selector.subtitle': 'Выберите сохраненный тест или загрузите файл (.json, .mtf, .csv)',
    'selector.load_sample': 'Пример теста: Гинекология и акушерство (5 курс)',
    'selector.upload_file': 'Выберите или перетащите файл сюда (.json, .mtf, .csv)',
    'selector.no_tests': 'Нет сохраненных тестов. Загрузите файл или выберите пример.',
    'selector.stored_tests': 'Сохраненные тесты',
    'selector.btn_start': 'Перейти к тесту',
    'selector.btn_delete': 'Удалить',

    'reg.title': 'Регистрация учащегося',
    'reg.subtitle': 'Перед началом тестирования укажите ваши данные',
    'reg.fullname': 'Ф.И.О.',
    'reg.fullname_placeholder': 'Например: Иванов Иван Иванович',
    'reg.group': 'Группа / Класс',
    'reg.group_placeholder': 'Например: 501 группа',
    'reg.btn_begin': 'Начать тест',
    'reg.error_required': 'Пожалуйста, укажите ваши данные!',

    'test.question_of': 'Вопрос {current} из {total}',
    'test.time_left': 'Осталось времени:',
    'test.unlimited': 'Без ограничения',
    'test.flag': 'Пометить для проверки',
    'test.unflag': 'Снять пометку',
    'test.btn_prev': '« Предыдущий',
    'test.btn_next': 'Следующий »',
    'test.btn_finish': 'Завершить тест',
    'test.confirm_finish': 'Вы действительно хотите завершить тест? Неотвеченные вопросы будут оценены в 0 баллов.',
    'test.time_up_alert': 'Время истекло! Результаты теста обрабатываются...',
    'test.palette_title': 'Палитра вопросов',
    'test.palette_current': 'Текущий',
    'test.palette_answered': 'Отвечен',
    'test.palette_flagged': 'Помечен',
    'test.palette_unanswered': 'Без ответа',

    'qtype.single': 'Выберите один правильный ответ',
    'qtype.multiple': 'Выберите один или несколько правильных ответов',
    'qtype.boolean': 'Укажите истинность или ложность утверждения',
    'qtype.text': 'Введите краткий текстовый ответ',
    'qtype.number': 'Введите числовой ответ',
    'qtype.order': 'Укажите правильный порядок элементов',
    'qtype.match': 'Установите соответствие',
    'qtype.true': 'Верно (Истина)',
    'qtype.false': 'Неверно (Ложь)',
    'qtype.order_up': 'Вверх',
    'qtype.order_down': 'Вниз',
    'qtype.select_match_placeholder': '-- Выберите вариант --',

    'results.title': 'Результаты тестирования',
    'results.student': 'Студент:',
    'results.group': 'Группа:',
    'results.test_name': 'Название теста:',
    'results.date': 'Дата и время:',
    'results.score': 'Набрано баллов:',
    'results.percentage': 'Процент выполнения:',
    'results.grade': 'Итоговая оценка:',
    'results.status': 'Статус:',
    'results.passed': 'Тест сдан (ЗАЧЕТ)',
    'results.failed': 'Тест не сдан (НЕЗАЧЕТ)',
    'results.correct_answers': 'Правильных ответов:',
    'results.partial_answers': 'Частично правильных:',
    'results.incorrect_answers': 'Неправильных ответов:',
    'results.unanswered': 'Без ответа:',
    'results.btn_review': 'Работа над ошибками',
    'results.btn_retry': 'Пройти снова',
    'results.btn_export_json': 'Экспорт в JSON',
    'results.btn_export_csv': 'Экспорт в CSV',
    'results.btn_print': 'Печать отчета',

    'review.title': 'Работа над ошибками',
    'review.subtitle': 'Подробный анализ вопросов, ваших ответов и пояснений',
    'review.filter_all': 'Все вопросы',
    'review.filter_correct': 'Только правильные',
    'review.filter_incorrect': 'С ошибками',
    'review.your_answer': 'Ваш ответ:',
    'review.correct_answer': 'Правильный ответ:',
    'review.explanation': 'Пояснение:',
    'review.points': 'Балл:',
    'review.no_answer': '(Нет ответа)',
    'review.btn_back_results': '« Назад к результатам',

    'grade_5': '5 (Отлично)',
    'grade_4': '4 (Хорошо)',
    'grade_3': '3 (Удовлетворительно)',
    'grade_2': '2 (Неудовлетворительно)'
  },

  en: {
    'app.title': 'MyTestStudent Web',
    'app.subtitle': 'Computer-Based Knowledge Testing System',
    'theme.toggle': 'Toggle Theme',
    'lang.select': 'Language',

    'nav.select': 'Select Test',
    'nav.register': 'Registration',
    'nav.testing': 'Testing',
    'nav.results': 'Results',
    'nav.review': 'Review Mistakes',

    'selector.title': 'Select a Test',
    'selector.subtitle': 'Choose an existing test or upload a file (.json, .mtf, .csv)',
    'selector.load_sample': 'Sample Test: Gynecology & Obstetrics (5th Year)',
    'selector.upload_file': 'Choose or drag & drop a test file (.json, .mtf, .csv)',
    'selector.no_tests': 'No saved tests. Upload a file or load the sample test.',
    'selector.stored_tests': 'Saved Tests',
    'selector.btn_start': 'Select Test',
    'selector.btn_delete': 'Delete',

    'reg.title': 'Student Registration',
    'reg.subtitle': 'Enter your credentials before beginning the test',
    'reg.fullname': 'Full Name',
    'reg.fullname_placeholder': 'e.g. John Doe',
    'reg.group': 'Group / Class',
    'reg.group_placeholder': 'e.g. Group 501',
    'reg.btn_begin': 'Start Test',
    'reg.error_required': 'Please provide your full name!',

    'test.question_of': 'Question {current} of {total}',
    'test.time_left': 'Time Remaining:',
    'test.unlimited': 'Unlimited',
    'test.flag': 'Flag for Review',
    'test.unflag': 'Unflag',
    'test.btn_prev': '« Previous',
    'test.btn_next': 'Next »',
    'test.btn_finish': 'Finish Test',
    'test.confirm_finish': 'Are you sure you want to finish the test? Unanswered questions will receive 0 points.',
    'test.time_up_alert': 'Time is up! Calculating test results...',
    'test.palette_title': 'Question Palette',
    'test.palette_current': 'Current',
    'test.palette_answered': 'Answered',
    'test.palette_flagged': 'Flagged',
    'test.palette_unanswered': 'Unanswered',

    'qtype.single': 'Select one correct answer',
    'qtype.multiple': 'Select one or more correct answers',
    'qtype.boolean': 'Indicate whether the statement is True or False',
    'qtype.text': 'Enter a short text answer',
    'qtype.number': 'Enter numeric value',
    'qtype.order': 'Arrange the items in correct chronological or logical sequence',
    'qtype.match': 'Match corresponding pairs',
    'qtype.true': 'True',
    'qtype.false': 'False',
    'qtype.order_up': 'Move Up',
    'qtype.order_down': 'Move Down',
    'qtype.select_match_placeholder': '-- Choose matching option --',

    'results.title': 'Test Assessment Results',
    'results.student': 'Student:',
    'results.group': 'Group:',
    'results.test_name': 'Test Title:',
    'results.date': 'Date & Time:',
    'results.score': 'Score Earned:',
    'results.percentage': 'Percentage:',
    'results.grade': 'Final Grade:',
    'results.status': 'Status:',
    'results.passed': 'Passed (PASS)',
    'results.failed': 'Failed (FAIL)',
    'results.correct_answers': 'Correct Answers:',
    'results.partial_answers': 'Partially Correct:',
    'results.incorrect_answers': 'Incorrect Answers:',
    'results.unanswered': 'Unanswered:',
    'results.btn_review': 'Review Mistakes',
    'results.btn_retry': 'Retake Test',
    'results.btn_export_json': 'Export JSON',
    'results.btn_export_csv': 'Export CSV',
    'results.btn_print': 'Print Report',

    'review.title': 'Review Mistakes & Explanations',
    'review.subtitle': 'Detailed question breakdown with correct solutions and clinical explanations',
    'review.filter_all': 'All Questions',
    'review.filter_correct': 'Correct Only',
    'review.filter_incorrect': 'Incorrect & Partial',
    'review.your_answer': 'Your Answer:',
    'review.correct_answer': 'Correct Answer:',
    'review.explanation': 'Explanation:',
    'review.points': 'Points:',
    'review.no_answer': '(No answer provided)',
    'review.btn_back_results': '« Back to Results',

    'grade_5': '5 (Excellent)',
    'grade_4': '4 (Good)',
    'grade_3': '3 (Satisfactory)',
    'grade_2': '2 (Unsatisfactory)'
  }
};

let currentLanguage = 'uz';

export function setLanguage(lang) {
  if (DICTIONARIES[lang]) {
    currentLanguage = lang;
    try {
      localStorage.setItem('mytest_lang', lang);
    } catch (e) {}
    document.documentElement.lang = lang;
    return true;
  }
  return false;
}

export function getLanguage() {
  return currentLanguage;
}

export function t(key, params = {}) {
  const dict = DICTIONARIES[currentLanguage] || DICTIONARIES['uz'];
  let text = dict[key] || DICTIONARIES['uz'][key] || key;
  Object.keys(params).forEach(p => {
    text = text.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
  });
  return text;
}

// Auto-initialize from stored setting or browser preference
export function initLocalization() {
  try {
    const saved = localStorage.getItem('mytest_lang');
    if (saved && DICTIONARIES[saved]) {
      setLanguage(saved);
      return;
    }
  } catch (e) {}
  setLanguage('uz');
}
