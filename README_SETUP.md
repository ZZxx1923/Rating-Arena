# Arena KSA - نظام تقييم الموظفين v2

## معلومات المشروع

**المشروع**: نظام إدارة تقييمات الموظفين الحديث  
**التقنيات**: React 19 + Vite + Tailwind CSS + Supabase  
**الاستضافة**: Vercel (متوافق تماماً)  
**قاعدة البيانات**: Supabase PostgreSQL

---

## بيانات الاتصال بـ Supabase

```
SUPABASE_URL: https://hvxtmijxqnjcvjkrmwiw.supabase.co
SUPABASE_ANON_KEY: sb_publishable_wim3K8oGikoSjKmMbvoWXA_IUb6znLE
```

---

## خطوات الإعداد الأولية

### 1. تشغيل كود SQL في Supabase

انسخ الكود التالي والصقه في **SQL Editor** داخل لوحة تحكم Supabase:

```sql
-- جدول الأقسام
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول الموظفين
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول التقييمات
CREATE TABLE IF NOT EXISTS public.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    ratings JSONB NOT NULL,
    comment TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- تفعيل Row Level Security
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول
CREATE POLICY "الجميع يمكنهم رؤية الأقسام" ON public.departments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "المشرفون يمكنهم تعديل الأقسام" ON public.departments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- إضافة بيانات أولية
INSERT INTO public.departments (name) VALUES ('الموارد البشرية'), ('تقنية المعلومات'), ('المبيعات')
ON CONFLICT (name) DO NOTHING;

-- وظيفة إنشاء مستخدم تلقائياً
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role)
    VALUES (NEW.id, NEW.email, 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. إنشاء حسابات تجريبية

في لوحة تحكم Supabase، اذهب إلى **Authentication** وأنشئ حسابين:

**حساب المسؤول:**
- البريد: `admin@example.com`
- كلمة المرور: `admin123`

**حساب المستخدم:**
- البريد: `user@example.com`
- كلمة المرور: `user123`

بعد الإنشاء، اذهب إلى جدول `users` وغيّر دور المسؤول من `user` إلى `admin`.

### 3. تشغيل المشروع محلياً

```bash
cd /home/ubuntu/arena-ksa-v2
pnpm install
pnpm dev
```

---

## النشر على Vercel

### الخطوة 1: ربط المشروع بـ GitHub

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create arena-ksa-v2 --private --source=. --remote=origin --push
```

### الخطوة 2: النشر على Vercel

1. اذهب إلى [Vercel](https://vercel.com/)
2. اضغط على **New Project**
3. اختر المستودع `arena-ksa-v2`
4. أضف متغيرات البيئة:
   - `VITE_SUPABASE_URL`: `https://hvxtmijxqnjcvjkrmwiw.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `sb_publishable_wim3K8oGikoSjKmMbvoWXA_IUb6znLE`
5. اضغط **Deploy**

---

## ملفات الاتصال بـ Supabase

- **`client/src/lib/supabaseClient.ts`**: تهيئة عميل Supabase
- **`client/src/lib/supabaseAuth.ts`**: خدمات المصادقة والمستخدمين
- **`client/src/lib/supabaseOperations.ts`**: عمليات قاعدة البيانات (CRUD)

---

## الميزات المدمجة

✅ نظام تسجيل دخول آمن مع Supabase Auth  
✅ إدارة المستخدمين والأدوار  
✅ إدارة الموظفين والأقسام  
✅ نظام التقييمات والتعليقات  
✅ لوحة تحكم للمشرفين  
✅ تصميم حديث "الزجاج القطبي"  
✅ متوافق تماماً مع Vercel

---

## حسابات تجريبية

| النوع | البريد | كلمة المرور |
|------|--------|-----------|
| مسؤول | admin@example.com | admin123 |
| مستخدم | user@example.com | user123 |

---

## الدعم والمساعدة

إذا واجهت أي مشاكل، تأكد من:
1. تشغيل كود SQL في Supabase
2. إنشاء الحسابات التجريبية
3. التحقق من متغيرات البيئة
4. إعادة تشغيل خادم التطوير
