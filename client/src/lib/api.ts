/**
 * API Integration Service
 * Connects to Rating Arena Backend
 * Design: Arctic Glass (Corporate Glassmorphism)
 */

const API_BASE_URL = ""; // Use relative path for Vercel deployment

// Helper to get JWT token
function getToken(): string | null {
  return localStorage.getItem("token");
}

// Helper for authenticated fetch requests
async function authenticatedFetch(url: string, options?: RequestInit) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options?.headers || {}),
  };
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || "API request failed");
  }
  return response;
}

// ─── Types ────────────────────────────────────────────────────────────────

export type ApiRole = "admin" | "user";

export interface ApiUser {
  id: string;
  username: string;
  role: ApiRole;
  created_at: string;
}

export interface ApiEvaluation {
  id: string;
  employee_id: string;
  user_id: string | null;
  is_anonymous: boolean;
  ratings: Record<string, number>;
  comment?: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiEmployee {
  id: string;
  name: string;
  name_en?: string;
  department_id?: string;
  position?: string;
  email?: string;
  created_at: string;
}

export interface ApiDepartment {
  id: string;
  name: string;
  name_en?: string;
  created_at: string;
}

export interface ApiQuestion {
  id: string;
  question_text: string;
  question_text_en?: string;
  question_type: string;
  created_at: string;
}

// ─── Authentication ────────────────────────────────────────────────────────

export async function apiLogin(username: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok && data.token) {
      localStorage.setItem("token", data.token);
      return { user: data.user, token: data.token };
    }
    throw new Error(data.message || "Login failed");
  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
}

export function apiLogout() {
  localStorage.removeItem("token");
}

// ─── Users Management ────────────────────────────────────────────────────────

export async function apiGetUsers(): Promise<ApiUser[]> {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/users`);
    return await response.json();
  } catch (error) {
    console.error("Get users API error:", error);
    return [];
  }
}

export async function apiRegisterUser(username: string, password: string, role: ApiRole = "user"): Promise<ApiUser> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Registration failed");
    return data.user; // Assuming backend returns { message, user }
  } catch (error) {
    console.error("Register user API error:", error);
    throw error;
  }
}

export async function apiUpdateUser(id: string, updates: { username?: string; password?: string; role?: ApiRole }): Promise<ApiUser> {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "User update failed");
    return data; // Assuming backend returns the updated user directly
  } catch (error) {
    console.error("Update user API error:", error);
    throw error;
  }
}

export async function apiDeleteUser(id: string) {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/users/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "User deletion failed");
    return data;
  } catch (error) {
    console.error("Delete user API error:", error);
    throw error;
  }
}

// ─── Evaluations ────────────────────────────────────────────────────────────

export async function apiGetEvaluations(): Promise<ApiEvaluation[]> {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/evaluations`);
    return await response.json();
  } catch (error) {
    console.error("Get evaluations API error:", error);
    return [];
  }
}

export async function apiSubmitEvaluation(evaluation: {
  employeeId: string;
  isAnonymous: boolean;
  ratings: Record<string, number>;
  comment?: string;
}) {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/evaluations`, {
      method: "POST",
      body: JSON.stringify(evaluation),
    });
    return await response.json();
  } catch (error) {
    console.error("Submit evaluation API error:", error);
    throw error;
  }
}

export async function apiUpdateEvaluationStatus(id: string, status: string, rejectionReason?: string) {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/evaluations/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, rejection_reason: rejectionReason }),
    });
    return await response.json();
  } catch (error) {
    console.error("Update evaluation status API error:", error);
    throw error;
  }
}

export async function apiDeleteEvaluation(id: string) {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/evaluations/${id}`, {
      method: "DELETE",
    });
    return await response.json();
  } catch (error) {
    console.error("Delete evaluation API error:", error);
    throw error;
  }
}

// ─── Questions/Criteria ────────────────────────────────────────────────────

export async function apiGetQuestions(): Promise<ApiQuestion[]> {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/questions`);
    return await response.json();
  } catch (error) {
    console.error("Get questions API error:", error);
    return [];
  }
}

export async function apiCreateQuestion(question_text: string, question_text_en?: string, question_type: string = "rating"): Promise<ApiQuestion> {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/questions`, {
      method: "POST",
      body: JSON.stringify({ question_text, question_text_en, question_type }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Question creation failed");
    return data;
  } catch (error) {
    console.error("Create question API error:", error);
    throw error;
  }
}

export async function apiUpdateQuestion(id: string, updates: { question_text?: string; question_text_en?: string; question_type?: string }): Promise<ApiQuestion> {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/questions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Question update failed");
    return data;
  } catch (error) {
    console.error("Update question API error:", error);
    throw error;
  }
}

export async function apiDeleteQuestion(id: string) {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/questions/${id}`, {
      method: "DELETE",
    });
    return await response.json();
  } catch (error) {
    console.error("Delete question API error:", error);
    throw error;
  }
}

// ─── Employees ────────────────────────────────────────────────────────────

export async function apiGetEmployees(): Promise<ApiEmployee[]> {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/employees`);
    return await response.json();
  } catch (error) {
    console.error("Get employees API error:", error);
    return [];
  }
}

export async function apiCreateEmployee(employee: Omit<ApiEmployee, "id" | "created_at">): Promise<ApiEmployee> {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/employees`, {
      method: "POST",
      body: JSON.stringify(employee),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Employee creation failed");
    return data;
  } catch (error) {
    console.error("Create employee API error:", error);
    throw error;
  }
}

export async function apiUpdateEmployee(id: string, updates: Partial<Omit<ApiEmployee, "id" | "created_at">>): Promise<ApiEmployee> {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/employees/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Employee update failed");
    return data;
  } catch (error) {
    console.error("Update employee API error:", error);
    throw error;
  }
}

export async function apiDeleteEmployee(id: string) {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/employees/${id}`, {
      method: "DELETE",
    });
    return await response.json();
  } catch (error) {
    console.error("Delete employee API error:", error);
    throw error;
  }
}

// ─── Departments ────────────────────────────────────────────────────────

export async function apiGetDepartments(): Promise<ApiDepartment[]> {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/departments`);
    return await response.json();
  } catch (error) {
    console.error("Get departments API error:", error);
    return [];
  }
}

export async function apiCreateDepartment(name: string, name_en?: string): Promise<ApiDepartment> {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/departments`, {
      method: "POST",
      body: JSON.stringify({ name, name_en }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Department creation failed");
    return data;
  } catch (error) {
    console.error("Create department API error:", error);
    throw error;
  }
}

export async function apiUpdateDepartment(id: string, updates: Partial<Omit<ApiDepartment, "id" | "created_at">>): Promise<ApiDepartment> {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/departments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Department update failed");
    return data;
  } catch (error) {
    console.error("Update department API error:", error);
    throw error;
  }
}

export async function apiDeleteDepartment(id: string) {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/departments/${id}`, {
      method: "DELETE",
    });
    return await response.json();
  } catch (error) {
    console.error("Delete department API error:", error);
    throw error;
  }
}

// ─── Analytics ────────────────────────────────────────────────────────

export async function apiGetAnalytics() {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/analytics`);
    return await response.json();
  } catch (error) {
    console.error("Get analytics API error:", error);
    throw error;
  }
}

// ─── Health Check ────────────────────────────────────────────────────────

export async function apiHealthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users`, { method: "GET", headers: { Authorization: `Bearer ${getToken()}` } });
    return response.ok;
  } catch (error) {
    console.warn("API health check failed:", error);
    return false;
  }
}
