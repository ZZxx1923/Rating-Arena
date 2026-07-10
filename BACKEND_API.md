# Backend API Documentation

## Overview
هذا المشروع يستخدم Express.js مع Supabase Server SDK لإدارة عمليات Backend الآمنة.

## متغيرات البيئة المطلوبة

```env
# Supabase Server Configuration
SUPABASE_URL=https://hvxtmijxqnjcvjkrmwiw.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_wim3K8oGikoSjKmMbvoWXA_IUb6znLE
SUPABASE_SECRET_KEY=sb_secret_faxxkOsHHDO2C9MoGK40og_chawYK-d
SUPABASE_JWKS_URL=https://hvxtmijxqnjcvjkrmwiw.supabase.co/auth/v1/.well-known/jwks.json
```

## API Endpoints

### Admin Routes (`/api/admin`)

جميع هذه الـ endpoints تتطلب:
1. رسالة Authorization header مع JWT token: `Authorization: Bearer <token>`
2. المستخدم يجب أن يكون admin

#### 1. إنشاء مستخدم جديد (Admin)
```
POST /api/admin/users
Content-Type: application/json
Authorization: Bearer <token>

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "role": "admin",
    "created_at": "2026-07-10T06:00:00Z"
  },
  "success": true
}
```

#### 2. حذف مستخدم
```
DELETE /api/admin/users/:userId
Authorization: Bearer <token>

Response:
{
  "success": true
}
```

#### 3. تحديث كلمة مرور المستخدم
```
PUT /api/admin/users/:userId/password
Content-Type: application/json
Authorization: Bearer <token>

{
  "newPassword": "newPassword123"
}

Response:
{
  "user": { ... },
  "success": true
}
```

#### 4. الحصول على جميع المستخدمين
```
GET /api/admin/users
Authorization: Bearer <token>

Response:
{
  "users": [
    {
      "id": "user-id",
      "email": "user@example.com",
      "role": "admin",
      "created_at": "2026-07-10T06:00:00Z"
    }
  ]
}
```

#### 5. الحصول على جميع التقييمات
```
GET /api/admin/evaluations
Authorization: Bearer <token>

Response:
{
  "evaluations": [
    {
      "id": "eval-id",
      "employee_id": "emp-id",
      "user_id": "user-id",
      "is_anonymous": false,
      "ratings": { "performance": 4, "teamwork": 5 },
      "comment": "Great work!",
      "status": "pending",
      "created_at": "2026-07-10T06:00:00Z"
    }
  ]
}
```

## كيفية الحصول على JWT Token

### من Frontend:
```javascript
import { supabase } from "@/lib/supabaseClient";

// بعد تسجيل الدخول
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// استخدام Token في API calls
const response = await fetch("/api/admin/users", {
  headers: {
    "Authorization": `Bearer ${token}`
  }
});
```

## معالجة الأخطاء

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```
السبب: لا يوجد token أو token غير صحيح

### 403 Forbidden
```json
{
  "error": "Forbidden: Admin access required"
}
```
السبب: المستخدم ليس admin

### 500 Server Error
```json
{
  "error": "Error message"
}
```
السبب: خطأ في الخادم

## أمان البيانات

1. **Secret Key**: يتم استخدام `SUPABASE_SECRET_KEY` فقط في Backend، لا تعرضه في Frontend
2. **JWT Verification**: جميع الطلبات يتم التحقق منها عبر JWT token
3. **Admin Check**: يتم التحقق من دور المستخدم قبل تنفيذ أي عملية حساسة
4. **CORS**: يجب تفعيل CORS للسماح بالطلبات من Frontend

## مثال استخدام كامل

```typescript
// Frontend - إنشاء مستخدم جديد
async function createNewAdmin(email: string, password: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch("/api/admin/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
}
```
