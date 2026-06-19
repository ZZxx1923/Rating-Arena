/**
 * Internationalization (i18n) System
 * Supports: Arabic (AR) and English (EN)
 * Design: Arctic Glass (Corporate Glassmorphism)
 */

export type Language = "ar" | "en";

export interface TranslationStrings {
  // Navigation
  dashboard: string;
  newEvaluation: string;
  evaluations: string;
  employees: string;
  departments: string;
  users: string;
  analytics: string;
  logout: string;

  // Common
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  search: string;
  filter: string;
  status: string;
  actions: string;
  name: string;
  email: string;
  username: string;
  password: string;
  role: string;
  createdAt: string;
  updatedAt: string;

  // Roles
  admin: string;
  user: string;
  administrator: string;
  regularUser: string;

  // Evaluation
  evaluationForm: string;
  selectEmployee: string;
  selectDepartment: string;
  ratings: string;
  comments: string;
  anonymous: string;
  submitEvaluation: string;
  avgRating: string;
  score: string;
  pending: string;
  approved: string;
  rejected: string;
  approve: string;
  reject: string;
  rejectionReason: string;

  // Questions
  professionalism: string;
  respectfulness: string;
  communication: string;
  teamwork: string;
  problemSolving: string;
  workQuality: string;
  timeManagement: string;
  responsibility: string;
  customerService: string;
  leadership: string;
  cooperation: string;
  punctuality: string;
  overallPerformance: string;

  // Ratings
  veryPoor: string;
  poor: string;
  average: string;
  good: string;
  excellent: string;

  // Messages
  successCreated: string;
  successUpdated: string;
  successDeleted: string;
  errorOccurred: string;
  confirmDelete: string;
  noData: string;
  loading: string;

  // Dashboard
  totalUsers: string;
  totalEmployees: string;
  totalDepartments: string;
  totalEvaluations: string;
  pendingEvaluations: string;
  approvedEvaluations: string;
  rejectedEvaluations: string;
  recentEvaluations: string;
  viewAll: string;

  // Admin
  manageUsers: string;
  manageEmployees: string;
  manageDepartments: string;
  manageQuestions: string;
  settings: string;

  // Forms
  addEmployee: string;
  addDepartment: string;
  addUser: string;
  addQuestion: string;
  editEmployee: string;
  editDepartment: string;
  editUser: string;
  editQuestion: string;
  department: string;
  position: string;
  canViewResults: string;

  // Analytics
  evaluationTrend: string;
  evaluationStatus: string;
  evaluationsByDepartment: string;
  averageScores: string;
  topPerformers: string;
  bestDepartment: string;

  // Auth
  signIn: string;
  signUp: string;
  login: string;
  loginFailed: string;
  invalidCredentials: string;
  welcomeBack: string;

  // Misc
  language: string;
  theme: string;
  darkMode: string;
  lightMode: string;
  performance: string;
  measuredWithIntegrity: string;
}

const AR: TranslationStrings = {
  // Navigation
  dashboard: "لوحة التحكم",
  newEvaluation: "تقييم جديد",
  evaluations: "التقييمات",
  employees: "الموظفون",
  departments: "الأقسام",
  users: "المستخدمون",
  analytics: "التحليلات",
  logout: "تسجيل الخروج",

  // Common
  save: "حفظ",
  cancel: "إلغاء",
  delete: "حذف",
  edit: "تعديل",
  add: "إضافة",
  search: "بحث",
  filter: "تصفية",
  status: "الحالة",
  actions: "الإجراءات",
  name: "الاسم",
  email: "البريد الإلكتروني",
  username: "اسم المستخدم",
  password: "كلمة المرور",
  role: "الدور",
  createdAt: "تاريخ الإنشاء",
  updatedAt: "تاريخ التحديث",

  // Roles
  admin: "مدير",
  user: "مستخدم",
  administrator: "مسؤول النظام",
  regularUser: "مستخدم عادي",

  // Evaluation
  evaluationForm: "نموذج التقييم",
  selectEmployee: "اختر موظفاً",
  selectDepartment: "اختر قسماً",
  ratings: "التقييمات",
  comments: "التعليقات",
  anonymous: "مجهول",
  submitEvaluation: "إرسال التقييم",
  avgRating: "متوسط التقييم",
  score: "النقاط",
  pending: "قيد الانتظار",
  approved: "موافق عليه",
  rejected: "مرفوض",
  approve: "الموافقة",
  reject: "الرفض",
  rejectionReason: "سبب الرفض",

  // Questions
  professionalism: "الاحترافية",
  respectfulness: "الاحترام",
  communication: "مهارات التواصل",
  teamwork: "العمل الجماعي",
  problemSolving: "حل المشاكل",
  workQuality: "جودة العمل",
  timeManagement: "إدارة الوقت",
  responsibility: "المسؤولية",
  customerService: "خدمة العملاء",
  leadership: "القيادة",
  cooperation: "التعاون",
  punctuality: "الالتزام بالمواعيد",
  overallPerformance: "الأداء العام",

  // Ratings
  veryPoor: "سيء جداً",
  poor: "سيء",
  average: "متوسط",
  good: "جيد",
  excellent: "ممتاز",

  // Messages
  successCreated: "تم الإنشاء بنجاح",
  successUpdated: "تم التحديث بنجاح",
  successDeleted: "تم الحذف بنجاح",
  errorOccurred: "حدث خطأ",
  confirmDelete: "هل أنت متأكد من الحذف؟",
  noData: "لا توجد بيانات",
  loading: "جاري التحميل...",

  // Dashboard
  totalUsers: "إجمالي المستخدمين",
  totalEmployees: "إجمالي الموظفين",
  totalDepartments: "إجمالي الأقسام",
  totalEvaluations: "إجمالي التقييمات",
  pendingEvaluations: "التقييمات المعلقة",
  approvedEvaluations: "التقييمات الموافق عليها",
  rejectedEvaluations: "التقييمات المرفوضة",
  recentEvaluations: "التقييمات الأخيرة",
  viewAll: "عرض الكل",

  // Admin
  manageUsers: "إدارة المستخدمين",
  manageEmployees: "إدارة الموظفين",
  manageDepartments: "إدارة الأقسام",
  manageQuestions: "إدارة الأسئلة",
  settings: "الإعدادات",

  // Forms
  addEmployee: "إضافة موظف",
  addDepartment: "إضافة قسم",
  addUser: "إضافة مستخدم",
  addQuestion: "إضافة سؤال",
  editEmployee: "تعديل الموظف",
  editDepartment: "تعديل القسم",
  editUser: "تعديل المستخدم",
  editQuestion: "تعديل السؤال",
  department: "القسم",
  position: "المنصب",
  canViewResults: "يمكنه عرض النتائج",

  // Analytics
  evaluationTrend: "اتجاه التقييمات",
  evaluationStatus: "حالة التقييمات",
  evaluationsByDepartment: "التقييمات حسب القسم",
  averageScores: "متوسط النقاط",
  topPerformers: "أفضل الموظفين",
  bestDepartment: "أفضل قسم",

  // Auth
  signIn: "تسجيل الدخول",
  signUp: "إنشاء حساب",
  login: "دخول",
  loginFailed: "فشل تسجيل الدخول",
  invalidCredentials: "بيانات اعتماد غير صحيحة",
  welcomeBack: "أهلاً بعودتك",

  // Misc
  language: "اللغة",
  theme: "المظهر",
  darkMode: "الوضع الليلي",
  lightMode: "الوضع النهاري",
  performance: "الأداء",
  measuredWithIntegrity: "يتم قياسه بنزاهة",
};

const EN: TranslationStrings = {
  // Navigation
  dashboard: "Dashboard",
  newEvaluation: "New Evaluation",
  evaluations: "Evaluations",
  employees: "Employees",
  departments: "Departments",
  users: "Users",
  analytics: "Analytics",
  logout: "Logout",

  // Common
  save: "Save",
  cancel: "Cancel",
  delete: "Delete",
  edit: "Edit",
  add: "Add",
  search: "Search",
  filter: "Filter",
  status: "Status",
  actions: "Actions",
  name: "Name",
  email: "Email",
  username: "Username",
  password: "Password",
  role: "Role",
  createdAt: "Created At",
  updatedAt: "Updated At",

  // Roles
  admin: "Admin",
  user: "User",
  administrator: "Administrator",
  regularUser: "Regular User",

  // Evaluation
  evaluationForm: "Evaluation Form",
  selectEmployee: "Select Employee",
  selectDepartment: "Select Department",
  ratings: "Ratings",
  comments: "Comments",
  anonymous: "Anonymous",
  submitEvaluation: "Submit Evaluation",
  avgRating: "Average Rating",
  score: "Score",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  approve: "Approve",
  reject: "Reject",
  rejectionReason: "Rejection Reason",

  // Questions
  professionalism: "Professionalism",
  respectfulness: "Respectfulness",
  communication: "Communication Skills",
  teamwork: "Teamwork",
  problemSolving: "Problem Solving",
  workQuality: "Work Quality",
  timeManagement: "Time Management",
  responsibility: "Responsibility",
  customerService: "Customer Service",
  leadership: "Leadership",
  cooperation: "Cooperation",
  punctuality: "Punctuality",
  overallPerformance: "Overall Performance",

  // Ratings
  veryPoor: "Very Poor",
  poor: "Poor",
  average: "Average",
  good: "Good",
  excellent: "Excellent",

  // Messages
  successCreated: "Created successfully",
  successUpdated: "Updated successfully",
  successDeleted: "Deleted successfully",
  errorOccurred: "An error occurred",
  confirmDelete: "Are you sure you want to delete?",
  noData: "No data available",
  loading: "Loading...",

  // Dashboard
  totalUsers: "Total Users",
  totalEmployees: "Total Employees",
  totalDepartments: "Total Departments",
  totalEvaluations: "Total Evaluations",
  pendingEvaluations: "Pending Evaluations",
  approvedEvaluations: "Approved Evaluations",
  rejectedEvaluations: "Rejected Evaluations",
  recentEvaluations: "Recent Evaluations",
  viewAll: "View All",

  // Admin
  manageUsers: "Manage Users",
  manageEmployees: "Manage Employees",
  manageDepartments: "Manage Departments",
  manageQuestions: "Manage Questions",
  settings: "Settings",

  // Forms
  addEmployee: "Add Employee",
  addDepartment: "Add Department",
  addUser: "Add User",
  addQuestion: "Add Question",
  editEmployee: "Edit Employee",
  editDepartment: "Edit Department",
  editUser: "Edit User",
  editQuestion: "Edit Question",
  department: "Department",
  position: "Position",
  canViewResults: "Can View Results",

  // Analytics
  evaluationTrend: "Evaluation Trend",
  evaluationStatus: "Evaluation Status",
  evaluationsByDepartment: "Evaluations by Department",
  averageScores: "Average Scores",
  topPerformers: "Top Performers",
  bestDepartment: "Best Department",

  // Auth
  signIn: "Sign In",
  signUp: "Sign Up",
  login: "Login",
  loginFailed: "Login failed",
  invalidCredentials: "Invalid credentials",
  welcomeBack: "Welcome back",

  // Misc
  language: "Language",
  theme: "Theme",
  darkMode: "Dark Mode",
  lightMode: "Light Mode",
  performance: "Performance",
  measuredWithIntegrity: "Measured with integrity",
};

const translations: Record<Language, TranslationStrings> = {
  ar: AR,
  en: EN,
};

// Language management
let currentLanguage: Language = (localStorage.getItem("app_language") as Language) || "ar";

export function getCurrentLanguage(): Language {
  return currentLanguage;
}

export function setLanguage(lang: Language) {
  currentLanguage = lang;
  localStorage.setItem("app_language", lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.setAttribute("data-lang", lang);
}

export function t(key: keyof TranslationStrings): string {
  return translations[currentLanguage][key] || key;
}

export function getTranslations(): TranslationStrings {
  return translations[currentLanguage];
}

export function toggleLanguage(): Language {
  const newLang: Language = currentLanguage === "ar" ? "en" : "ar";
  setLanguage(newLang);
  return newLang;
}

// Initialize language on app start
export function initializeLanguage() {
  setLanguage(currentLanguage);
}
