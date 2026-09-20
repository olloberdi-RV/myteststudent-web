# MyTestStudent Web (v1.0.0)

Zamonaviy, moslashuvchan (responsive) va oflayn rejimda ishlovchi (PWA) kompyuterlashtirilgan bilimni tekshirish tizimi. Ushbu veb-ilova Windows uchun mo'ljallangan **MyTestStudent 10.2.0.2** (Embarcadero Delphi XE, Win32 GUI) dasturining funksional xususiyatlari, baholash qoidalari, taymer va aralashtirish algoritmlari asosida qayta ishlab chiqilgan.

---

## 🌟 Asosiy imkoniyatlar

1. **To'liq oflayn ishlash (PWA & Offline-First)**:
   * Internet aloqasisiz to'liq ishlaydi (Service Worker kesh va IndexedDB bazasi).
   * Mobil telefon, planshet va kompyuter ekranlariga avtomatik moslashadi.
2. **Ko'p tilli interfeys (i18n)**:
   * Asosiy til: **O'zbekcha (Lotin)**.
   * Qo'shimcha tillar: **Ruscha**, **Inglizcha** (sahifani qayta yuklamasdan dinamik o'zgaradi).
3. **Qo'llab-quvvatlanadigan savol turlari**:
   * **Yakka tanlov (`single`)** — radio tugmalar.
   * **Ko'p tanlov (`multiple`)** — chekbokslar, MyTestX standarti bo'yicha qisman ball va salbiy jarima hisobi bilan.
   * **Mantiqiy savollar (`boolean`)** — To'g'ri / Noto'g'ri.
   * **Qisqa matnli javob (`text`)** — katta-kichik harflarni inobatga olmagan holda matnni tekshirish.
   * **Raqamli javob (`number`)** — aniq raqam yoki ruxsat etilgan xatolik oralig'i (tolerance).
   * **Muvofiqlashtirish (`match`)** — chap va o'ng ustunlarni bog'lash.
   * **Ketma-ketlikni belgilash (`order`)** — elementlarni o'rnini almashtirish orqali to'g'ri joylashtirish.
4. **MyTestX baholash tizimi**:
   * O'zbekiston oliy ta'lim muassasalari standarti bo'yicha 5 ballik baholash shkalasi:
     * **5 (A'lo)**: $\ge 86\%$
     * **4 (Yaxshi)**: $71\% - 85\%$
     * **3 (Qoniqarli)**: $55\% - 70\%$
     * **2 (Qoniqarsiz)**: $< 55\%$
   * Sinovdan o'tish (Zachet / Nezachet) ko'rsatkichi.
5. **Xatolar ustida ishlash (Review Mistakes)**:
   * Yakuniy natijalar oynasida qaysi savolga qanday javob berilgani, to'g'ri javob va klinik/ilmiy izohlarni ko'rish imkoniyati.
6. **Fayllarni import va eksport qilish**:
   * `.json`, `.csv` va `.mtf` (MyTestX) formatidagi testlarni yuklash.
   * Natijalarni JSON va CSV formatida yuklab olish hamda brauzer orqali to'g'ridan-to'g'ri chop etish (`@media print`).

---

## 📁 Loyiha tuzilmasi

```
myteststudent-web/
├── index.html                  # Asosiy semantik HTML5 sahifa
├── manifest.json               # Progressive Web App (PWA) manifesti
├── sw.js                       # Oflayn ishlashni ta'minlovchi Service Worker
├── package.json                # Loyiha konfiguratsiyasi va test skriptlari
├── README.md                   # Loyiha qo'llanmasi
│
├── assets/
│   └── icons/                  # 192x192 va 512x512 SVG ikonkalari
│
├── css/
│   ├── app.css                 # Asosiy ranglar, mavzu (yorug'/qorong'u) va shriftlar
│   ├── components.css          # Kartochkalar, taymer, savollar palitrasi, natijalar
│   └── responsive.css          # Mobil, planshet va chop etish (@media print) uslublari
│
├── js/
│   ├── app.js                  # Asosiy orkestrator va fayl boshqaruvchisi
│   ├── ui.js                   # Interfeys boshqaruvi va dinamik savol renderlari
│   ├── question-manager.js     # Savollarni aralashtirish (Fisher-Yates) va sessiya
│   ├── scoring.js              # Baholash, qisman ball va baho hisoblash formulalari
│   ├── importer.js             # JSON, CSV va MTF fayllarini tahlil qiluvchi modul
│   ├── exporter.js             # JSON, CSV va chop etish eksport moduli
│   ├── localization.js         # Ko'p tilli lug'at (uz, ru, en)
│   └── storage.js              # IndexedDB ma'lumotlar bazasi bilan ishlash
│
├── data/
│   └── sample-tests/
│       └── ginekologiya5kurs_sample.json   # Akusherlik va ginekologiya namunaviy testi
│
└── tests/
    ├── scoring.test.js         # Baholash formulalarini sinovdan o'tkazish
    └── engine.test.js          # Sessiya va tasodifiylashtirish sinovlari
```

---

## 🚀 Ishga tushirish bo'yicha ko'rsatma

### 1. Mahalliy muhitda ishga tushirish (Local Server)
ES modullar (`import`/`export`) brauzer xavfsizlik talablariga ko'ra HTTP protokoli orqali ochilishi lozim:

```bash
# Python yordamida:
python3 -m http.server 8080

# Yoki Node.js (npx serve) yordamida:
npx serve .
```

Brauzerda `http://localhost:8080` manzilini oching.

### 2. Avtomatlashtirilgan testlarni tekshirish:
```bash
npm test
```
*(35 ta baholash sinovi va 13 ta sessiya boshqaruvi sinovlari to'liq muvaffaqiyatli o'tadi).*

---

## 🌐 Deploy qilish (Joylashtirish)

### GitHub Pages:
1. Ushbu papkani yangi GitHub omboriga (repository) `main` tarmog'iga yuklang (`git push`).
2. Repozitoriy sozlamalariga kiring: **Settings** → **Pages**.
3. **Branch** bo'limida `main` va `/ (root)` ni tanlab, **Save** tugmasini bosing.
4. Ilova bir necha soniyada `https://<foydalanuvchi>.github.io/<repo>/` manzilida ishga tushadi.

### Netlify:
* Loyiha papkasini to'g'ridan-to'g'ri Netlify Drag & Drop paneliga tashlang yoki Git omborini bog'lang (hech qanday murakkab build talab qilinmaydi).
