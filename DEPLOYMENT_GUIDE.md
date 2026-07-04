# دليل نشر مشروع Rating Arena (نسخة Supabase)

هذا الدليل يشرح كيفية نشر مشروعك باستخدام **Vercel** و **Supabase**.

## الخطوة 1: إعداد Supabase
1. قم بإنشاء مشروع جديد على [Supabase](https://supabase.com/).
2. انتقل إلى **SQL Editor** وقم بتشغيل الكود الموجود في ملف `db_schema.sql`.
3. احصل على القيم التالية من إعدادات المشروع (Settings -> API):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## الخطوة 2: إعداد Vercel
1. قم بربط مستودع GitHub الخاص بك بـ Vercel.
2. سيقوم Vercel بالتعرف تلقائياً على إعدادات Vite.
3. أضف متغيرات البيئة التالية في إعدادات Vercel (Settings -> Environment Variables):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET` (قم بتوليد مفتاح عشوائي طويل)
   - `NODE_ENV` اضبطها على `production`

## الخطوة 3: النشر
- بمجرد دفع الكود (Push) إلى GitHub، سيقوم Vercel ببناء ونشر التطبيق تلقائياً.

## ملاحظات هامة
- تأكد من تثبيت التبعيات باستخدام `pnpm install`.
- الواجهة الخلفية تعمل كـ **Vercel Functions** من خلال مجلد `server`.
