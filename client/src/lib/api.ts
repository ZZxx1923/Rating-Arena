/**
 * API Integration Service
 * Connects to Rating Arena Backend: https://arena-server-c8xo.onrender.com
 * Design: Arctic Glass (Corporate Glassmorphism)
 */

const API_BASE_URL = "https://arena-server-c8xo.onrender.com";

// ─── Types ────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: number;
  username: string;
  role: string;
  canViewResults: number;
}

export interface ApiEvaluation {
  id: number;
  targetName: string;
  avgScore: number;
  details: Record<string, number>;
  comment: string;
  status: "Pending" | "Approved" | "Rejected";
  submittedBy: string;
  isAnonymous: number;
  createdAt: string;
  rejectionReason?: string;
}

export interface ApiEmployee {
  id: number;
  name: string;
  nameEn?: string;
  department?: string;
  departmentEn?: string;
  createdAt: string;
}

export interface ApiDepartment {
  id: number;
  name: string;
  nameEn?: string;
  createdAt: string;
}

export interface ApiQuestion {
  id: number;
  questionText: string;
  questionTextEn?: string;
  questionType: string;
  createdAt: string;
}

// ─── Authentication ────────────────────────────────────────────────────────

export async function apiLogin(username: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
}

// ─── Users Management ────────────────────────────────────────────────────────

export async function apiGetUsers(): Promise<ApiUser[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Get users API error:", error);
    return [];
  }
}

export async function apiCreateUser(username: string, password: string, role: string = "user") {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Create user API error:", error);
    throw error;
  }
}

export async function apiUpdateUser(id: number, updates: { role?: string; canViewResults?: number }) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Update user API error:", error);
    throw error;
  }
}

export async function apiDeleteUser(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Delete user API error:", error);
    throw error;
  }
}

// ─── Evaluations ────────────────────────────────────────────────────────────

export async function apiGetEvaluations(): Promise<ApiEvaluation[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/evaluations`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Get evaluations API error:", error);
    return [];
  }
}

export async function apiSubmitEvaluation(evaluation: {
  targetName: string;
  avgScore: number;
  details: Record<string, number>;
  comment?: string;
  submittedBy?: string;
  isAnonymous?: boolean;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/evaluations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...evaluation,
        status: "Pending",
        isAnonymous: evaluation.isAnonymous ? 1 : 0,
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Submit evaluation API error:", error);
    throw error;
  }
}

export async function apiUpdateEvaluationStatus(id: number, status: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/evaluations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Update evaluation status API error:", error);
    throw error;
  }
}

export async function apiDeleteEvaluation(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/evaluations/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Delete evaluation API error:", error);
    throw error;
  }
}

// ─── Questions/Criteria ────────────────────────────────────────────────────

export async function apiGetQuestions(): Promise<ApiQuestion[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/questions`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Get questions API error:", error);
    return [];
  }
}

export async function apiCreateQuestion(questionText: string, questionTextEn?: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionText, questionTextEn }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Create question API error:", error);
    throw error;
  }
}

export async function apiDeleteQuestion(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Delete question API error:", error);
    throw error;
  }
}

// ─── Employees ────────────────────────────────────────────────────────────

export async function apiGetEmployees(): Promise<ApiEmployee[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/employees`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Get employees API error:", error);
    return [];
  }
}

export async function apiCreateEmployee(name: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Create employee API error:", error);
    throw error;
  }
}

export async function apiDeleteEmployee(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Delete employee API error:", error);
    throw error;
  }
}

// ─── Departments ────────────────────────────────────────────────────────

export async function apiGetDepartments(): Promise<ApiDepartment[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/departments`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Get departments API error:", error);
    return [];
  }
}

export async function apiCreateDepartment(name: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/departments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Create department API error:", error);
    throw error;
  }
}

export async function apiDeleteDepartment(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Delete department API error:", error);
    throw error;
  }
}

// ─── Health Check ────────────────────────────────────────────────────────

export async function apiHealthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, { method: "GET" });
    return response.ok;
  } catch (error) {
    console.warn("API health check failed:", error);
    return false;
  }
}
