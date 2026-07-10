# دليل إعداد Supabase لمشروع Arena-KSA

لقد قمت بتجهيز الكود اللازم لربط مشروعك بـ Supabase. لكي يعمل المشروع بشكل كامل، يرجى اتباع الخطوات التالية:

## 1. إنشاء مشروع في Supabase
1. اذهب إلى [Supabase](https://supabase.com/) وأنشئ مشروعاً جديداً.
2. احصل على `URL` و `Anon Key` من إعدادات المشروع (Settings > API).

## 2. إعداد قاعدة البيانات (SQL)
قم بتشغيل الكود التالي في "SQL Editor" داخل لوحة تحكم Supabase لإنشاء الجداول اللازمة:

```sql
-- جدول المستخدمين (يرتبط بـ Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول الأقسام
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول الموظفين
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  department_id UUID REFERENCES departments(id),
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول التقييمات والتعليقات
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  is_anonymous BOOLEAN DEFAULT FALSE,
  ratings JSONB NOT NULL,
  comment TEXT,
  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## 3. إعداد المتغيرات البيئية
قم بإنشاء ملف باسم `.env` في المجلد الرئيسي للمشروع وأضف القيم الخاصة بك:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. الصفحات الجديدة التي تمت إضافتها
*   `client/src/pages/LoginSupabase.tsx`: صفحة تسجيل دخول محدثة.
*   `client/src/pages/AdminUsers.tsx`: لوحة تحكم لإدارة المستخدمين وأدوارهم.
*   `client/src/pages/AdminEmployees.tsx`: لوحة تحكم لإدارة الموظفين والتعليقات.

## 5. الخدمات التي تمت إضافتها
*   `client/src/lib/supabaseClient.ts`: تهيئة الاتصال بـ Supabase.
*   `client/src/lib/supabaseAuth.ts`: خدمات المصادقة.
*   `client/src/lib/supabaseOperations.ts`: عمليات قاعدة البيانات (CRUD).

---
**ملاحظة:** تأكد من تحديث ملف `App.tsx` ليتضمن المسارات (Routes) الجديدة لهذه الصفحات.
