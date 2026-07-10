-- ==========================================
-- Arena-KSA Database Initialization Script
-- ==========================================

-- 1. إنشاء جدول الأقسام (Departments)
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. إنشاء جدول المستخدمين (Users)
-- ملاحظة: هذا الجدول يكمل معلومات المستخدم الموجودة في auth.users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. إنشاء جدول الموظفين (Employees)
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. إنشاء جدول التقييمات والتعليقات (Evaluations)
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

-- 5. إعداد صلاحيات الوصول (Row Level Security - RLS)

-- تفعيل RLS على الجداول
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- سياسات جدول المستخدمين
CREATE POLICY "المستخدمون يمكنهم رؤية بياناتهم الخاصة" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "المشرفون يمكنهم رؤية جميع المستخدمين" ON public.users
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- سياسات جدول الأقسام
CREATE POLICY "الجميع يمكنهم رؤية الأقسام" ON public.departments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "المشرفون فقط يمكنهم تعديل الأقسام" ON public.departments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- سياسات جدول الموظفين
CREATE POLICY "الجميع يمكنهم رؤية الموظفين" ON public.employees
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "المشرفون فقط يمكنهم تعديل الموظفين" ON public.employees
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- سياسات جدول التقييمات
CREATE POLICY "المستخدمون يمكنهم رؤية تقييماتهم الخاصة" ON public.evaluations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "المشرفون يمكنهم رؤية وإدارة جميع التقييمات" ON public.evaluations
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "المستخدمون يمكنهم إضافة تقييمات" ON public.evaluations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. وظيفة (Trigger) لإنشاء سجل مستخدم تلقائياً عند التسجيل في Auth
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

-- 7. إضافة بيانات أولية (اختياري)
INSERT INTO public.departments (name) VALUES ('الموارد البشرية'), ('تقنية المعلومات'), ('المبيعات')
ON CONFLICT (name) DO NOTHING;
