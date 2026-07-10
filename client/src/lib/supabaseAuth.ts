import { supabase } from "./supabaseClient";

export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
}

export async function registerUser(email: string, password: string, role: "admin" | "user" = "user") {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create user");

    const { data: userData, error: dbError } = await supabase
      .from("users")
      .insert([
        {
          id: authData.user.id,
          email,
          role,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    return { user: userData, success: true };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const { data: userData, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (dbError) throw dbError;

    return { user: userData as AuthUser, session: data.session, success: true };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

export async function getCurrentAuthUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;

    if (!data.user) return null;

    const { data: userData, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (dbError) throw dbError;

    return userData as AuthUser;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

export async function updateUserRole(userId: string, role: "admin" | "user") {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ role })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return { user: data as AuthUser, success: true };
  } catch (error) {
    console.error("Update user role error:", error);
    throw error;
  }
}

export async function deleteUser(userId: string) {
  try {
    const { error: dbError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (dbError) throw dbError;

    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { users: data as AuthUser[], success: true };
  } catch (error) {
    console.error("Get all users error:", error);
    throw error;
  }
}
