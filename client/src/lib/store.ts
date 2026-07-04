/**
 * Employee Evaluation System - Data Store (Deprecated for API)
 * This file will be refactored to remove local storage logic
 * and rely entirely on the backend API.
 */

// These types are now defined in client/src/lib/api.ts and will be fetched from the backend
// Keeping them here for now for reference, but they will be removed or updated.

export type Role = "admin" | "user";

export interface User {
  id: string;
  username: string;
  role: Role;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  departmentId: string;
  email?: string;
  createdAt: string;
}

export type EvaluationStatus = "pending" | "approved" | "rejected";

export interface Evaluation {
  id: string;
  employeeId: string;
  userId: string;
  isAnonymous: boolean;
  ratings: Record<string, number>;
  comment?: string;
  status: EvaluationStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const EVALUATION_QUESTIONS = [
  { id: "professionalism", label: "Professionalism" },
  { id: "respectfulness", label: "Respectfulness" },
  { id: "communication", label: "Communication Skills" },
  { id: "teamwork", label: "Teamwork" },
  { id: "problemSolving", label: "Problem Solving" },
  { id: "workQuality", label: "Work Quality" },
  { id: "timeManagement", label: "Time Management" },
  { id: "responsibility", label: "Responsibility" },
  { id: "customerService", label: "Customer Service" },
  { id: "leadership", label: "Leadership" },
  { id: "cooperation", label: "Cooperation" },
  { id: "punctuality", label: "Punctuality" },
  { id: "overallPerformance", label: "Overall Performance" },
];

export const RATING_LABELS: Record<number, string> = {
  1: "Very Poor",
  2: "Poor",
  3: "Average",
  4: "Good",
  5: "Excellent",
};

// All local storage functions will be removed or replaced by API calls.
// For now, keeping stubs to avoid breaking existing frontend code immediately.

export function getUsers(): User[] { return []; }
export function saveUsers(users: User[]) { /* no-op */ }
export function addUser(user: Omit<User, "id" | "createdAt">): User | null { return null; }
export function updateUser(id: string, updates: Partial<User>): User | null { return null; }
export function deleteUser(id: string): boolean { return false; }

// Authentication functions will be moved to api.ts
export function login(username: string, password: string): User | null { return null; }
export function logout() { /* no-op */ }
export function getCurrentUser(): User | null { return null; }

export function getDepartments(): Department[] { return []; }
export function saveDepartments(departments: Department[]) { /* no-op */ }
export function addDepartment(name: string): Department | null { return null; }
export function updateDepartment(id: string, name: string): Department | null { return null; }
export function deleteDepartment(id: string): boolean { return false; }

export function getEmployees(): Employee[] { return []; }
export function saveEmployees(employees: Employee[]) { /* no-op */ }
export function addEmployee(employee: Omit<Employee, "id" | "createdAt">): Employee | null { return null; }
export function updateEmployee(id: string, updates: Partial<Employee>): Employee | null { return null; }
export function deleteEmployee(id: string): boolean { return false; }

export function getEvaluations(): Evaluation[] { return []; }
export function saveEvaluations(evaluations: Evaluation[]) { /* no-op */ }
export function addEvaluation(evaluation: Omit<Evaluation, "id" | "createdAt" | "updatedAt" | "status">): Evaluation | null { return null; }
export function updateEvaluationStatus(id: string, status: EvaluationStatus, rejectionReason?: string): Evaluation | null { return null; }
export function deleteEvaluation(id: string): boolean { return false; }
export function hasUserEvaluatedEmployee(userId: string, employeeId: string): boolean { return false; }

// Seed data function will be removed as data will come from the database
function seedData() { /* no-op */ }
// Call seedData only once
// seedData();
