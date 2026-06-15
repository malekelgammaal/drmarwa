# ✅ خطوات Supabase — تفعيل Email Confirmation
## اعمل دي في Dashboard بتاع Supabase

### 1. تفعيل تأكيد الإيميل عند التسجيل
1. افتح: https://supabase.com/dashboard/project/essanwtunejifzyuvgtu
2. من القائمة الجانبية: **Authentication → Providers → Email**
3. فعّل: ✅ **Confirm email**
4. احفظ

### 2. إضافة redirect URLs (مهم جداً للـ Password Reset)
1. من القائمة: **Authentication → URL Configuration**
2. في **Site URL**، تأكد أنها: `https://drmarwabadr.drmarwa.workers.dev`
3. في **Redirect URLs**، أضف هذين:
   ```
   https://drmarwabadr.drmarwa.workers.dev/reset-password.html
   https://drmarwabadr.drmarwa.workers.dev/**
   ```
4. احفظ

### 3. تخصيص إيميل التأكيد (اختياري لكن احترافي)
1. من القائمة: **Authentication → Email Templates**
2. في **Confirm signup** عدّل العنوان:
   - Subject: `Confirm your account — Dr. Marwa Badr Platform`
3. في **Reset Password** عدّل العنوان:
   - Subject: `Reset your password — Dr. Marwa Badr Platform`

### 4. تشغيل SQL (إذا لم تفعل بعد)
1. من القائمة: **SQL Editor**
2. افتح ملف: `supabase_purchases_setup.sql`
3. اضغط **Run**
