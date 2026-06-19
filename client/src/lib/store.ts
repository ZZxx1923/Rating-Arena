/**
 * Employee Evaluation System - Data Store
 * Design: Arctic Glass (Corporate Glassmorphism)
 * All data is stored in localStorage for persistence
 */

export type Role = "admin" | "user";

export interface User {
  id: string;
  username: string;
  password: string;
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

const STORAGE_KEYS = {
  USERS: "ees_users",
  DEPARTMENTS: "ees_departments",
  EMPLOYEES: "ees_employees",
  EVALUATIONS: "ees_evaluations",
  CURRENT_USER: "ees_current_user",
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

function seedData() {
  const existingUsers = getUsers();
  if (existingUsers.length > 0) return; // already seeded

  const adminUser: User = {
    id: generateId(),
    username: "admin",
    password: "admin123",
    role: "admin",
    createdAt: new Date().toISOString(),
  };

  const regularUser: User = {
    id: generateId(),
    username: "user",
    password: "user123",
    role: "user",
    createdAt: new Date().toISOString(),
  };

  saveUsers([adminUser, regularUser]);

  const departments: Department[] = [
    { id: generateId(), name: "Human Resources", createdAt: new Date().toISOString() },
    { id: generateId(), name: "Engineering", createdAt: new Date().toISOString() },
    { id: generateId(), name: "Sales & Marketing", createdAt: new Date().toISOString() },
    { id: generateId(), name: "Finance", createdAt: new Date().toISOString() },
    { id: generateId(), name: "Operations", createdAt: new Date().toISOString() },
  ];
  saveDepartments(departments);

  const employees: Employee[] = [
    { id: generateId(), name: "Sarah Johnson", position: "HR Manager", departmentId: departments[0].id, email: "sarah.j@company.com", createdAt: new Date().toISOString() },
    { id: generateId(), name: "Michael Chen", position: "Senior Developer", departmentId: departments[1].id, email: "m.chen@company.com", createdAt: new Date().toISOString() },
    { id: generateId(), name: "Emily Rodriguez", position: "Sales Director", departmentId: departments[2].id, email: "e.rodriguez@company.com", createdAt: new Date().toISOString() },
    { id: generateId(), name: "David Kim", position: "Financial Analyst", departmentId: departments[3].id, email: "d.kim@company.com", createdAt: new Date().toISOString() },
    { id: generateId(), name: "Jessica Thompson", position: "Operations Lead", departmentId: departments[4].id, email: "j.thompson@company.com", createdAt: new Date().toISOString() },
    { id: generateId(), name: "Alex Martinez", position: "Frontend Engineer", departmentId: departments[1].id, email: "a.martinez@company.com", createdAt: new Date().toISOString() },
    { id: generateId(), name: "Rachel Brown", position: "Marketing Specialist", departmentId: departments[2].id, email: "r.brown@company.com", createdAt: new Date().toISOString() },
  ];
  saveEmployees(employees);

  // Seed some sample evaluations
  const now = new Date();
  const evaluations: Evaluation[] = [
    {
      id: generateId(),
      employeeId: employees[0].id,
      userId: regularUser.id,
      isAnonymous: false,
      ratings: { professionalism: 5, respectfulness: 5, communication: 4, teamwork: 5, problemSolving: 4, workQuality: 5, timeManagement: 4, responsibility: 5, customerService: 4, leadership: 4, cooperation: 5, punctuality: 5, overallPerformance: 5 },
      comment: "Excellent team leader with great communication skills.",
      status: "approved",
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      employeeId: employees[1].id,
      userId: regularUser.id,
      isAnonymous: true,
      ratings: { professionalism: 4, respectfulness: 4, communication: 3, teamwork: 4, problemSolving: 5, workQuality: 5, timeManagement: 3, responsibility: 4, customerService: 3, leadership: 3, cooperation: 4, punctuality: 4, overallPerformance: 4 },
      comment: "Strong technical skills, could improve on communication.",
      status: "approved",
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      employeeId: employees[2].id,
      userId: adminUser.id,
      isAnonymous: false,
      ratings: { professionalism: 5, respectfulness: 5, communication: 5, teamwork: 4, problemSolving: 4, workQuality: 4, timeManagement: 5, responsibility: 5, customerService: 5, leadership: 5, cooperation: 4, punctuality: 5, overallPerformance: 5 },
      status: "pending",
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      employeeId: employees[3].id,
      userId: regularUser.id,
      isAnonymous: false,
      ratings: { professionalism: 3, respectfulness: 3, communication: 2, teamwork: 3, problemSolving: 3, workQuality: 3, timeManagement: 2, responsibility: 3, customerService: 2, leadership: 2, cooperation: 3, punctuality: 3, overallPerformance: 3 },
      comment: "Needs improvement in several areas.",
      status: "rejected",
      rejectionReason: "Evaluation seems biased. Please re-evaluate objectively.",
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      employeeId: employees[4].id,
      userId: adminUser.id,
      isAnonymous: true,
      ratings: { professionalism: 4, respectfulness: 4, communication: 4, teamwork: 5, problemSolving: 4, workQuality: 4, timeManagement: 4, responsibility: 5, customerService: 4, leadership: 4, cooperation: 5, punctuality: 4, overallPerformance: 4 },
      status: "pending",
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
  saveEvaluations(evaluations);
}

// ─── Users ────────────────────────────────────────────────────────────────────

export function getUsers(): User[] {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

export function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function addUser(user: Omit<User, "id" | "createdAt">): User {
  const users = getUsers();
  const newUser: User = { ...user, id: generateId(), createdAt: new Date().toISOString() };
  saveUsers([...users, newUser]);
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates };
  saveUsers(users);
  return users[idx];
}

export function deleteUser(id: string): boolean {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== id);
  if (filtered.length === users.length) return false;
  saveUsers(filtered);
  return true;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function login(username: string, password: string): User | null {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  }
  return null;
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!data) return null;
  const stored = JSON.parse(data) as User;
  // Refresh from users list to get latest role/data
  const users = getUsers();
  const fresh = users.find(u => u.id === stored.id);
  if (!fresh) {
    logout();
    return null;
  }
  return fresh;
}

// ─── Departments ──────────────────────────────────────────────────────────────

export function getDepartments(): Department[] {
  const data = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
  return data ? JSON.parse(data) : [];
}

export function saveDepartments(departments: Department[]) {
  localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
}

export function addDepartment(name: string): Department {
  const departments = getDepartments();
  const newDept: Department = { id: generateId(), name, createdAt: new Date().toISOString() };
  saveDepartments([...departments, newDept]);
  return newDept;
}

export function updateDepartment(id: string, name: string): Department | null {
  const departments = getDepartments();
  const idx = departments.findIndex(d => d.id === id);
  if (idx === -1) return null;
  departments[idx] = { ...departments[idx], name };
  saveDepartments(departments);
  return departments[idx];
}

export function deleteDepartment(id: string): boolean {
  const departments = getDepartments();
  const filtered = departments.filter(d => d.id !== id);
  if (filtered.length === departments.length) return false;
  saveDepartments(filtered);
  return true;
}

// ─── Employees ────────────────────────────────────────────────────────────────

export function getEmployees(): Employee[] {
  const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
  return data ? JSON.parse(data) : [];
}

export function saveEmployees(employees: Employee[]) {
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
}

export function addEmployee(employee: Omit<Employee, "id" | "createdAt">): Employee {
  const employees = getEmployees();
  const newEmp: Employee = { ...employee, id: generateId(), createdAt: new Date().toISOString() };
  saveEmployees([...employees, newEmp]);
  return newEmp;
}

export function updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
  const employees = getEmployees();
  const idx = employees.findIndex(e => e.id === id);
  if (idx === -1) return null;
  employees[idx] = { ...employees[idx], ...updates };
  saveEmployees(employees);
  return employees[idx];
}

export function deleteEmployee(id: string): boolean {
  const employees = getEmployees();
  const filtered = employees.filter(e => e.id !== id);
  if (filtered.length === employees.length) return false;
  saveEmployees(filtered);
  return true;
}

// ─── Evaluations ──────────────────────────────────────────────────────────────

export function getEvaluations(): Evaluation[] {
  const data = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
  return data ? JSON.parse(data) : [];
}

export function saveEvaluations(evaluations: Evaluation[]) {
  localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));
}

export function addEvaluation(evaluation: Omit<Evaluation, "id" | "createdAt" | "updatedAt" | "status">): Evaluation {
  const evaluations = getEvaluations();
  const now = new Date().toISOString();
  const newEval: Evaluation = {
    ...evaluation,
    id: generateId(),
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
  saveEvaluations([...evaluations, newEval]);
  return newEval;
}

export function updateEvaluationStatus(
  id: string,
  status: EvaluationStatus,
  rejectionReason?: string
): Evaluation | null {
  const evaluations = getEvaluations();
  const idx = evaluations.findIndex(e => e.id === id);
  if (idx === -1) return null;
  evaluations[idx] = {
    ...evaluations[idx],
    status,
    rejectionReason: status === "rejected" ? rejectionReason : undefined,
    updatedAt: new Date().toISOString(),
  };
  saveEvaluations(evaluations);
  return evaluations[idx];
}

export function deleteEvaluation(id: string): boolean {
  const evaluations = getEvaluations();
  const filtered = evaluations.filter(e => e.id !== id);
  if (filtered.length === evaluations.length) return false;
  saveEvaluations(filtered);
  return true;
}

export function hasUserEvaluatedEmployee(userId: string, employeeId: string): boolean {
  const evaluations = getEvaluations();
  return evaluations.some(e => e.userId === userId && e.employeeId === employeeId);
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function getStats() {
  const users = getUsers();
  const employees = getEmployees();
  const departments = getDepartments();
  const evaluations = getEvaluations();

  const pending = evaluations.filter(e => e.status === "pending").length;
  const approved = evaluations.filter(e => e.status === "approved").length;
  const rejected = evaluations.filter(e => e.status === "rejected").length;

  const approvedEvals = evaluations.filter(e => e.status === "approved");
  let avgRating = 0;
  if (approvedEvals.length > 0) {
    const totalRatings = approvedEvals.flatMap(e => Object.values(e.ratings));
    avgRating = totalRatings.reduce((a, b) => a + b, 0) / totalRatings.length;
  }

  return {
    totalUsers: users.length,
    totalEmployees: employees.length,
    totalDepartments: departments.length,
    totalEvaluations: evaluations.length,
    pending,
    approved,
    rejected,
    avgRating: Math.round(avgRating * 10) / 10,
  };
}

export function getEmployeeStats(employeeId: string) {
  const evaluations = getEvaluations().filter(
    e => e.employeeId === employeeId && e.status === "approved"
  );

  if (evaluations.length === 0) {
    return { avgRating: 0, totalEvaluations: 0, ratingDistribution: {1:0,2:0,3:0,4:0,5:0}, questionAverages: {} };
  }

  const allRatings = evaluations.flatMap(e => Object.values(e.ratings));
  const avgRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;

  const ratingDistribution: Record<number, number> = {1:0,2:0,3:0,4:0,5:0};
  allRatings.forEach(r => { ratingDistribution[r] = (ratingDistribution[r] || 0) + 1; });

  const questionAverages: Record<string, number> = {};
  EVALUATION_QUESTIONS.forEach(q => {
    const qRatings = evaluations.map(e => e.ratings[q.id]).filter(Boolean);
    if (qRatings.length > 0) {
      questionAverages[q.id] = qRatings.reduce((a, b) => a + b, 0) / qRatings.length;
    }
  });

  return {
    avgRating: Math.round(avgRating * 10) / 10,
    totalEvaluations: evaluations.length,
    ratingDistribution,
    questionAverages,
  };
}

// Initialize seed data on module load
seedData();
