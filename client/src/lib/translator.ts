/**
 * Translation Service
 * Handles automatic translation of employee names and questions
 * Uses a predefined translation map for consistency
 */

import type { Language } from "./i18n";

// Predefined translations for common names and positions
const nameTranslations: Record<string, Record<Language, string>> = {
  "Ahmed": { ar: "أحمد", en: "Ahmed" },
  "Fatima": { ar: "فاطمة", en: "Fatima" },
  "Mohammed": { ar: "محمد", en: "Mohammed" },
  "Sara": { ar: "سارة", en: "Sara" },
  "Ali": { ar: "علي", en: "Ali" },
  "Leila": { ar: "ليلى", en: "Leila" },
  "Hassan": { ar: "حسن", en: "Hassan" },
  "Amina": { ar: "أمينة", en: "Amina" },
  "Omar": { ar: "عمر", en: "Omar" },
  "Noor": { ar: "نور", en: "Noor" },
};

const positionTranslations: Record<string, Record<Language, string>> = {
  "Software Engineer": { ar: "مهندس برمجيات", en: "Software Engineer" },
  "Product Manager": { ar: "مدير المنتج", en: "Product Manager" },
  "Designer": { ar: "مصمم", en: "Designer" },
  "HR Manager": { ar: "مدير الموارد البشرية", en: "HR Manager" },
  "Sales Manager": { ar: "مدير المبيعات", en: "Sales Manager" },
  "Finance Manager": { ar: "مدير المالية", en: "Finance Manager" },
  "Operations Manager": { ar: "مدير العمليات", en: "Operations Manager" },
  "Quality Assurance": { ar: "ضمان الجودة", en: "Quality Assurance" },
  "Data Analyst": { ar: "محلل البيانات", en: "Data Analyst" },
  "Business Analyst": { ar: "محلل الأعمال", en: "Business Analyst" },
};

const departmentTranslations: Record<string, Record<Language, string>> = {
  "Engineering": { ar: "الهندسة", en: "Engineering" },
  "HR": { ar: "الموارد البشرية", en: "HR" },
  "Sales": { ar: "المبيعات", en: "Sales" },
  "Marketing": { ar: "التسويق", en: "Marketing" },
  "Finance": { ar: "المالية", en: "Finance" },
  "Operations": { ar: "العمليات", en: "Operations" },
  "IT": { ar: "تقنية المعلومات", en: "IT" },
  "Customer Support": { ar: "دعم العملاء", en: "Customer Support" },
  "Product": { ar: "المنتج", en: "Product" },
  "Design": { ar: "التصميم", en: "Design" },
};

const questionTranslations: Record<string, Record<Language, string>> = {
  "Professionalism": { ar: "الاحترافية", en: "Professionalism" },
  "Respectfulness": { ar: "الاحترام", en: "Respectfulness" },
  "Communication Skills": { ar: "مهارات التواصل", en: "Communication Skills" },
  "Teamwork": { ar: "العمل الجماعي", en: "Teamwork" },
  "Problem Solving": { ar: "حل المشاكل", en: "Problem Solving" },
  "Work Quality": { ar: "جودة العمل", en: "Work Quality" },
  "Time Management": { ar: "إدارة الوقت", en: "Time Management" },
  "Responsibility": { ar: "المسؤولية", en: "Responsibility" },
  "Customer Service": { ar: "خدمة العملاء", en: "Customer Service" },
  "Leadership": { ar: "القيادة", en: "Leadership" },
  "Cooperation": { ar: "التعاون", en: "Cooperation" },
  "Punctuality": { ar: "الالتزام بالمواعيد", en: "Punctuality" },
  "Overall Performance": { ar: "الأداء العام", en: "Overall Performance" },
};

/**
 * Translate a name from one language to another
 * If not found in predefined map, returns the original text
 */
export function translateName(name: string, targetLanguage: Language): string {
  if (!name) return "";
  
  // Check if exact match exists
  if (nameTranslations[name]) {
    return nameTranslations[name][targetLanguage];
  }
  
  // Try case-insensitive match
  const key = Object.keys(nameTranslations).find(
    k => k.toLowerCase() === name.toLowerCase()
  );
  
  if (key) {
    return nameTranslations[key][targetLanguage];
  }
  
  // Return original if no translation found
  return name;
}

/**
 * Translate a position/title
 */
export function translatePosition(position: string, targetLanguage: Language): string {
  if (!position) return "";
  
  if (positionTranslations[position]) {
    return positionTranslations[position][targetLanguage];
  }
  
  const key = Object.keys(positionTranslations).find(
    k => k.toLowerCase() === position.toLowerCase()
  );
  
  if (key) {
    return positionTranslations[key][targetLanguage];
  }
  
  return position;
}

/**
 * Translate a department name
 */
export function translateDepartment(department: string, targetLanguage: Language): string {
  if (!department) return "";
  if (departmentTranslations[department]) {
    return departmentTranslations[department][targetLanguage];
  }
  
  const key = Object.keys(departmentTranslations).find(
    k => k.toLowerCase() === department.toLowerCase()
  );
  
  if (key) {
    return departmentTranslations[key][targetLanguage];
  }
  
  return department;
}

/**
 * Translate a question/criterion
 */
export function translateQuestion(question: string, targetLanguage: Language): string {
  if (!question) return "";
  
  if (questionTranslations[question]) {
    return questionTranslations[question][targetLanguage];
  }
  
  const key = Object.keys(questionTranslations).find(
    k => k.toLowerCase() === question.toLowerCase()
  );
  
  if (key) {
    return questionTranslations[key][targetLanguage];
  }
  
  return question;
}

/**
 * Batch translate multiple items
 */
export function translateBatch(
  items: string[],
  type: "name" | "position" | "department" | "question",
  targetLanguage: Language
): string[] {
  const translator = {
    name: translateName,
    position: translatePosition,
    department: translateDepartment,
    question: translateQuestion,
  }[type];
  
  return items.map(item => translator(item, targetLanguage));
}

/**
 * Add new translation to the map
 */
export function addTranslation(
  type: "name" | "position" | "department" | "question",
  key: string,
  arValue: string,
  enValue: string
): void {
  const maps = {
    name: nameTranslations,
    position: positionTranslations,
    department: departmentTranslations,
    question: questionTranslations,
  };
  
  maps[type][key] = { ar: arValue, en: enValue };
  
  // Persist to localStorage
  localStorage.setItem(
    `translations_${type}`,
    JSON.stringify(maps[type])
  );
}

/**
 * Load custom translations from localStorage
 */
export function loadCustomTranslations(): void {
  const types = ["name", "position", "department", "question"] as const;
  
  types.forEach(type => {
    const stored = localStorage.getItem(`translations_${type}`);
    if (stored) {
      try {
        const custom = JSON.parse(stored);
        const maps = {
          name: nameTranslations,
          position: positionTranslations,
          department: departmentTranslations,
          question: questionTranslations,
        };
        Object.assign(maps[type], custom);
      } catch (error) {
        console.error(`Failed to load custom ${type} translations:`, error);
      }
    }
  });
}

// Load custom translations on module import
loadCustomTranslations();
