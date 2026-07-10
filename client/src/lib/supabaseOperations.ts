import { supabase } from "./supabaseClient";

// ─── Departments ──────────────────────────────────────────────────────────────

export interface Department {
  id: string;
  name: string;
  created_at: string;
}

export async function getDepartments() {
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return { departments: data as Department[], success: true };
  } catch (error) {
    console.error("Get departments error:", error);
    throw error;
  }
}

export async function addDepartment(name: string) {
  try {
    const { data, error } = await supabase
      .from("departments")
      .insert([{ name, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return { department: data as Department, success: true };
  } catch (error) {
    console.error("Add department error:", error);
    throw error;
  }
}

export async function updateDepartment(id: string, name: string) {
  try {
    const { data, error } = await supabase
      .from("departments")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { department: data as Department, success: true };
  } catch (error) {
    console.error("Update department error:", error);
    throw error;
  }
}

export async function deleteDepartment(id: string) {
  try {
    const { error } = await supabase
      .from("departments")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Delete department error:", error);
    throw error;
  }
}

// ─── Employees ────────────────────────────────────────────────────────────────

export interface Employee {
  id: string;
  name: string;
  position: string;
  department_id: string;
  email?: string;
  created_at: string;
}

export async function getEmployees() {
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return { employees: data as Employee[], success: true };
  } catch (error) {
    console.error("Get employees error:", error);
    throw error;
  }
}

export async function getEmployeeById(id: string) {
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return { employee: data as Employee, success: true };
  } catch (error) {
    console.error("Get employee error:", error);
    throw error;
  }
}

export async function addEmployee(employee: Omit<Employee, "id" | "created_at">) {
  try {
    const { data, error } = await supabase
      .from("employees")
      .insert([{ ...employee, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return { employee: data as Employee, success: true };
  } catch (error) {
    console.error("Add employee error:", error);
    throw error;
  }
}

export async function updateEmployee(id: string, updates: Partial<Omit<Employee, "id" | "created_at">>) {
  try {
    const { data, error } = await supabase
      .from("employees")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { employee: data as Employee, success: true };
  } catch (error) {
    console.error("Update employee error:", error);
    throw error;
  }
}

export async function deleteEmployee(id: string) {
  try {
    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Delete employee error:", error);
    throw error;
  }
}

// ─── Evaluations ──────────────────────────────────────────────────────────────

export interface Evaluation {
  id: string;
  employee_id: string;
  user_id: string;
  is_anonymous: boolean;
  ratings: Record<string, number>;
  comment?: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export async function getEvaluations() {
  try {
    const { data, error } = await supabase
      .from("evaluations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { evaluations: data as Evaluation[], success: true };
  } catch (error) {
    console.error("Get evaluations error:", error);
    throw error;
  }
}

export async function getEvaluationsByEmployee(employeeId: string) {
  try {
    const { data, error } = await supabase
      .from("evaluations")
      .select("*")
      .eq("employee_id", employeeId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { evaluations: data as Evaluation[], success: true };
  } catch (error) {
    console.error("Get evaluations by employee error:", error);
    throw error;
  }
}

export async function getEvaluationsByUser(userId: string) {
  try {
    const { data, error } = await supabase
      .from("evaluations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { evaluations: data as Evaluation[], success: true };
  } catch (error) {
    console.error("Get evaluations by user error:", error);
    throw error;
  }
}

export async function addEvaluation(evaluation: Omit<Evaluation, "id" | "created_at" | "updated_at" | "status">) {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("evaluations")
      .insert([
        {
          ...evaluation,
          status: "pending",
          created_at: now,
          updated_at: now,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { evaluation: data as Evaluation, success: true };
  } catch (error) {
    console.error("Add evaluation error:", error);
    throw error;
  }
}

export async function updateEvaluationStatus(
  id: string,
  status: "pending" | "approved" | "rejected",
  rejectionReason?: string
) {
  try {
    const { data, error } = await supabase
      .from("evaluations")
      .update({
        status,
        rejection_reason: status === "rejected" ? rejectionReason : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { evaluation: data as Evaluation, success: true };
  } catch (error) {
    console.error("Update evaluation status error:", error);
    throw error;
  }
}

export async function deleteEvaluation(id: string) {
  try {
    const { error } = await supabase
      .from("evaluations")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Delete evaluation error:", error);
    throw error;
  }
}

export async function hasUserEvaluatedEmployee(userId: string, employeeId: string) {
  try {
    const { data, error } = await supabase
      .from("evaluations")
      .select("id")
      .eq("user_id", userId)
      .eq("employee_id", employeeId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found
    return { hasEvaluated: !!data, success: true };
  } catch (error) {
    console.error("Check evaluation error:", error);
    throw error;
  }
}
