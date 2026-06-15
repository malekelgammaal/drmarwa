# 🏥 منصة Dr. Marwa Badr — التقرير الشامل للأنظمة

> تقرير مراجعة كاملة لجميع أنظمة وخصائص الموقع
> آخر تحديث: مايو 2026

---

## 🗂️ هيكل المشروع

| المكوّن | الوصف |
|---|---|
| **Frontend** | HTML + CSS + Vanilla JS (بدون framework) |
| **Backend** | Node.js + Express.js (على Render.com) |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (JWT) |
| **Hosting** | Cloudflare Pages — `drmarwabadr.drmarwa.workers.dev` |
| **Payment** | Gammal Tech SDK |
| **Analytics** | Google Analytics 4 (GA4) |

---

## 📄 الصفحات — 17 صفحة HTML

| الصفحة | الوظيفة | الحماية |
|---|---|---|
| `index.html` | الصفحة الرئيسية | عامة |
| `checkout.html` | صفحة الدفع | تتطلب Login |
| `payment-success.html` | تأكيد الدفع + callback | تتطلب Login + txn |
| `my-courses.html` | دوراتي المشتراة | تتطلب Login |
| `course-cbt-course.html` | محتوى CBT | تتطلب شراء |
| `course-dbt-course.html` | محتوى DBT | تتطلب شراء |
| `course-act-course.html` | محتوى ACT | تتطلب شراء |
| `course-healing-journey-program.html` | محتوى رحلة تعافي | تتطلب شراء |
| `course-personality-disorders-course.html` | محتوى اضطرابات الشخصية | تتطلب شراء |
| `course-tri-therapy-bundle.html` | محتوى الباقة الثلاثية | تتطلب شراء |
| `blog.html` | صفحة المدونة | عامة |
| `admin.html` | لوحة التحكم (CMS) | عامة (حماية بالمعرفة فقط) |
| `reset-password.html` | إعادة تعيين كلمة المرور | عامة |
| `terms.html` | الشروط والأحكام | عامة |
| `privacy-policy.html` | سياسة الخصوصية | عامة |
| `refund-policy.html` | سياسة الاسترداد | عامة |
| `gammal-tech.html` | صفحة Gammal Tech (SEO) | عامة |

---

## ⚙️ الأنظمة الرئيسية

---

### 1️⃣ نظام المصادقة (Auth System)

**الملفات:** `server.js` + `js/script.js`

#### المميزات:
- **Sign Up** — تسجيل بالاسم + البريد + كلمة المرور
- **Email OTP Verification** — كود تحقق 6 أرقام عبر البريد
- **Login** — بالبريد وكلمة المرور
- **Forgot Password** — رابط إعادة التعيين يُرسَل للبريد
- **Reset Password** — صفحة مستقلة لتعيين كلمة مرور جديدة
- **Logout** — مسح الـ session من localStorage
- **Persistent Session** — الجلسة محفوظة في `localStorage` بعد إغلاق المتصفح

#### الـ Endpoints:
```
POST /api/auth/signup       — إنشاء حساب
POST /api/auth/login        — تسجيل الدخول
POST /api/auth/verify-otp   — التحقق من الكود
POST /api/auth/forgot-password — طلب رابط استعادة
```

#### الحالة: ✅ شغّال

---

### 2️⃣ نظام الكورسات والدورات

**الملفات:** `server.js` + `js/script.js` + `index.html`

#### المميزات:
- **6 دورات** مخزّنة في Supabase
- **Static Fallback** — تظهر الـ 6 دورات فوراً حتى قبل رد الـ API
- **Dynamic Load** — تُحدَّث تلقائياً من API إذا كان الـ backend متاح
- **Bundle Card** — بطاقة خاصة مميزة للـ Tri-Therapy Bundle
- **Pricing Display** — سعر البيع + السعر الأصلي مشطوب + badge الخصم

#### الأسعار الحالية:
| الدورة | سعر البيع | السعر الأصلي | الخصم |
|---|---|---|---|
| رحلة تعافي | $99.99 | $150.00 | 33% |
| CBT | $149.99 | $200.00 | 25% |
| DBT | $174.99 | $225.00 | 22% |
| ACT | $149.99 | $200.00 | 25% |
| اضطرابات الشخصية | $174.99 | $225.00 | 22% |
| Tri-Therapy Bundle | $349.99 | $425.00 | 18% |

#### الـ Endpoint:
```
GET /api/courses  — جلب كل الدورات
```

#### الحالة: ✅ شغّال

---

### 3️⃣ نظام الدفع (Payment System)

**الملفات:** `js/payment-service.js` + `checkout.html` + `payment-success.html`

#### تدفق الدفع الكامل:
```
1. المستخدم يضغط "Subscribe to Access" على كارد الدورة
2. يتحقق إذا كان مسجّل — إذا لا: يفتح نافذة Login
3. يُنقَل لـ checkout.html?course=SLUG
4. يظهر ملخص الدورة والسعر
5. يضغط "Pay Securely Now"
6. يُفتَح Gammal Tech SDK للدفع
7. بعد الدفع: redirect لـ payment-success.html?course=SLUG&txn=TXN_ID
8. الصفحة تسجّل الشراء في Supabase
9. يُنقَل المستخدم لصفحة المحتوى
```

#### الـ Callback URLs:
- رحلة تعافي: `…/payment-success.html?course=healing-journey-program`
- CBT: `…/payment-success.html?course=cbt-course`
- DBT: `…/payment-success.html?course=dbt-course`
- ACT: `…/payment-success.html?course=act-course`
- اضطرابات الشخصية: `…/payment-success.html?course=personality-disorders-course`
- Tri-Therapy: `…/payment-success.html?course=tri-therapy-bundle`

#### الـ Endpoints:
```
POST /api/record-purchase   — تسجيل الشراء (يتطلب JWT)
GET  /api/check-access      — التحقق من صلاحية الوصول
GET  /api/my-courses        — جلب دورات المستخدم
```

#### مميزات الأمان:
- ✅ التحقق من JWT قبل تسجيل أي شراء
- ✅ منع تكرار التسجيل (idempotent بالـ transaction_id)
- ✅ `is_active` flag لإمكانية تعطيل الوصول يدوياً

#### الحالة: ✅ جاهز — ينتظر تفعيل Gammal Tech SDK

---

### 4️⃣ نظام حماية محتوى الدورات (Course Guard)

**الملف:** `js/payment-service.js` → `guardCoursePage()`

#### كيف يعمل:
```
1. صفحة الدورة تستدعي PaymentService.guardCoursePage('cbt-course')
2. يتحقق من JWT → يبعت لـ /api/check-access
3. إذا مفيش شراء: redirect لـ /#courses?locked=SLUG
4. إذا فيه شراء: يكمل تحميل الصفحة
```

#### Admin Preview Bypass:
```
?preview=drmarwabadr1984
```
يتجاوز كل الفحوصات ويعرض badge "Admin Preview Mode"

#### الحالة: ✅ شغّال

---

### 5️⃣ نظام إدارة المحتوى (CMS — Admin Panel)

**الملف:** `admin.html` + `server.js`

#### المميزات:
- **Dashboard** — إحصائيات (عدد الدورات، المقالات، الآراء)
- **إدارة الدورات** — إضافة / تعديل / حذف / إعادة ترتيب (↑↓)
- **إدارة المقالات** — إضافة / تعديل / حذف / إعادة ترتيب
- **إدارة الآراء** — إضافة / تعديل / حذف / إعادة ترتيب
- **إدارة الأقسام** — تعديل عناوين ومحتوى أقسام الصفحة الرئيسية

#### الـ Endpoints (CRUD كامل):
```
POST/PUT/DELETE /api/posts/:id
POST/PUT/DELETE /api/courses/:id
POST/PUT/DELETE /api/testimonials/:id
PUT /api/{table}/reorder        ← يعتمد على order_index في DB
PUT /api/sections/:key
```

> **ملاحظة:** يحتاج تشغيل `add_order_index.sql` في Supabase لتفعيل الـ Reorder

#### الحالة: ✅ شغّال (Reorder يحتاج SQL)

---

### 6️⃣ نظام المدونة (Blog System)

**الملفات:** `blog.html` + `index.html` + `server.js`

#### المميزات:
- يجلب المقالات من Supabase تلقائياً
- يعرض آخر 3 مقالات في الصفحة الرئيسية
- صفحة مدونة مستقلة تعرض كل المقالات
- دعم "اقرأ المزيد" لعرض المحتوى الكامل inline
- تاريخ المقال بالعربية

#### الحالة: ✅ شغّال

---

### 7️⃣ نظام الآراء (Testimonials)

**الملف:** `index.html` + `server.js`

#### المميزات:
- يجلب الآراء من Supabase ديناميكياً
- يعرض النجوم (⭐) واسم صاحب الرأي
- Fallback بـ 3 آراء افتراضية

#### الحالة: ✅ شغّال

---

### 8️⃣ نظام My Courses (دوراتي)

**الملف:** `my-courses.html`

#### المميزات:
- يجلب كل المشتريات من `/api/my-courses`
- يعرض كل دورة مع زر "Access Course"
- يظهر زر "My Courses" في الـ Navbar فقط لو المستخدم اشترى

#### الحالة: ✅ شغّال

---

### 9️⃣ نظام إعادة تعيين كلمة المرور

**الملف:** `reset-password.html` + `server.js`

#### المميزات:
- الـ reset link يُرسَل للبريد من Supabase
- صفحة مستقلة لتعيين الكلمة الجديدة
- يستخدم Supabase Hash Fragment في الـ URL

#### الـ Redirect URL المضبوط:
```
https://drmarwabadr.drmarwa.workers.dev/reset-password.html
```

#### الحالة: ✅ شغّال

---

### 🔟 نظام الـ Quiz (اختبار تحديد الدورة)

**الملف:** `index.html` + `js/script.js`

#### المميزات:
- 6 أسئلة تحدد الدورة الأنسب للمستخدم
- يعرض اسم الدورة المقترحة + شرح مفصّل
- يفتح في Modal أنيق

#### الحالة: ✅ شغّال

---

### 1️⃣1️⃣ نظام Analytics (Google Analytics 4)

**الملف:** `js/analytics.js` + `index.html`

#### المميزات:
- GA4 مع Consent Mode
- Cookie Consent Banner
- يتتبع: CTA clicks، Quiz starts/completions، Bundle views، Course views

#### الحالة: ✅ شغّال

---

### 1️⃣2️⃣ نظام Booking (الحجز)

**الملف:** `index.html`

#### المميزات:
- رابط Cal.com لحجز استشارة مجانية
- زر WhatsApp Floating ثابت على الشاشة
- رابط WhatsApp: `+965 6069 5570`

#### الحالة: ✅ شغّال

---

### 1️⃣3️⃣ نظام الـ Dist Builder

**الملف:** `dist-watcher.js`

#### المميزات:
- ينسخ 17 HTML + CSS + JS + Images + Fonts
- يُحدَّث يدوياً بأمر `node dist-watcher.js`
- ملف `dist/` هو اللي يُرفَع على Cloudflare

#### الحالة: ✅ شغّال

---

## 🎨 Design System

| العنصر | التفاصيل |
|---|---|
| **Font** | Inter (Google Fonts) |
| **Theme** | Dark Mode افتراضي + Light Mode toggle |
| **Colors** | Primary: `teal #14b8a6` / Muted / Border |
| **CSS Variables** | `--primary`, `--bg`, `--card-bg`, `--border`, `--text`, `--muted` |
| **Animations** | fade-up، float، pulse، spin |
| **Glassmorphism** | `.glass-card`, `.glass-panel` |
| **Responsive** | Mobile-first، hamburger menu |
| **RTL Support** | `dir="rtl"` للعربية، Arabic fonts |

---

## 🗄️ قاعدة البيانات (Supabase)

### الجداول:
| الجدول | الحقول الرئيسية |
|---|---|
| `courses` | id, title, price, original_price, discount_badge, image_url, is_bundle, duration, excerpt, order_index |
| `posts` | id, title, excerpt, content, date, order_index |
| `testimonials` | id, author, quote, rating, order_index |
| `sections` | id, section_key, title, subtitle, content, is_visible |
| `purchases` | id, user_id, course_id, transaction_id, amount_paid, currency, purchased_at, is_active |

### Row Level Security:
- ✅ `SELECT` مفتوح للعموم على courses/posts/testimonials
- ✅ `purchases` محميّة بالـ JWT

---

## 📦 ملفات SQL المتاحة

| الملف | الوظيفة |
|---|---|
| `update_prices.sql` | UPSERT أسعار الـ 6 دورات (يضيف + يحدّث) |
| `add_order_index.sql` | إضافة عمود order_index لتفعيل الـ Reorder |
| `supabase_setup.sql` | الإعداد الكامل لقاعدة البيانات من الصفر |
| `supabase_final_fix.sql` | نسخة محدَّثة من الإعداد |
| `supabase_purchases_setup.sql` | إنشاء جدول المشتريات |

---

## 🚨 الخطوات المطلوبة قبل الإطلاق

| الخطوة | الحالة |
|---|---|
| تشغيل `update_prices.sql` في Supabase | ⚠️ مطلوب |
| تشغيل `add_order_index.sql` في Supabase | ⚠️ مطلوب (للـ Reorder) |
| رفع `dist/` على Cloudflare | ⚠️ مطلوب |
| إضافة Callback URLs في Gammal Tech | ⚠️ مطلوب |
| تأكد من تفعيل Gammal Tech SDK في `checkout.html` | ⚠️ راجع مع Gammal Tech |

---

## ✅ ما يعمل الآن بدون أي إجراء

- الصفحة الرئيسية + كل الـ 6 دورات (static fallback)
- Auth (Login / Signup / Forgot Password / Reset)
- Blog (يجلب من Supabase)
- Quiz (تحديد الدورة)
- Dark/Light Mode
- Cookie Consent + GA4
- WhatsApp Floating Button
- Booking (Cal.com)
- Admin CMS (إضافة/تعديل/حذف — بدون Reorder)
- صفحات المحتوى (بحماية Admin Preview)
