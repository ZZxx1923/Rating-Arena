# Rating Arena - Full Stack Edition (Supabase) 🏆

**نظام تقييم الموظفين الحديث والاحترافي - نسخة Supabase المتكاملة**

نظام شامل لإدارة وتقييم أداء الموظفين مع واجهة مستخدم حديثة وآمنة وقابلة للتوسع، يعمل بالكامل على **Supabase** و **Vercel**.

---

## ✨ الميزات الرئيسية

### 🔐 الأمان والمصادقة
- ✅ نظام مصادقة متكامل باستخدام **Supabase Auth**.
- ✅ إدارة المستخدمين والأدوار (Admin/User).
- ✅ جلسات آمنة وموثوقة عبر JWT.

### 👥 إدارة الموظفين
- ✅ إضافة وتعديل وحذف الموظفين.
- ✅ تنظيم الموظفين حسب الأقسام.
- ✅ تتبع الإحصائيات والتقييمات لكل موظف.

### 📊 نظام التقييمات
- ✅ تقييمات متعددة المعايير (Criteria).
- ✅ تقييمات مجهولة الهوية (Anonymous) اختيارياً.
- ✅ نظام حالات التقييم (Pending, Approved, Rejected).

### 📈 التحليلات والإحصائيات
- ✅ لوحة تحكم تفاعلية للمسؤولين.
- ✅ رسوم بيانية توضيحية للأداء.
- ✅ إحصائيات دقيقة لكل قسم وموظف.

---

## 🛠️ التقنيات المستخدمة

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, Lucide Icons.
- **Backend:** Node.js (Vercel Functions), Express.
- **Database & Auth:** Supabase (PostgreSQL).
- **Deployment:** Vercel.

---

## 🚀 البدء السريع

### 1. إعداد قاعدة البيانات
قم بتشغيل الكود الموجود في `db_schema.sql` داخل **SQL Editor** في لوحة تحكم Supabase.

### 2. إعداد متغيرات البيئة
أضف المتغيرات التالية في Vercel و `.env`:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`

### 3. تشغيل التطبيق محلياً
```bash
pnpm install
pnpm dev
```

---

## 📁 دليل النشر
للحصول على تعليمات مفصلة خطوة بخطوة، يرجى مراجعة [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

---

**شكراً لاستخدامك Rating-Arena! 🙏**
إذا أعجبك المشروع، لا تنسَ إضافة ⭐ على GitHub!
