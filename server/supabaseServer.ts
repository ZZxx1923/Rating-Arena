import { createClient as createServerClient } from "@supabase/supabase-js";

/**
 * Initialize Supabase Server Client
 * This is used for secure backend operations with the secret key
 * Should only be used in server-side code, never expose to client
 */
export function createSupabaseServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "Missing Supabase server configuration. Please set SUPABASE_URL and SUPABASE_SECRET_KEY in your environment."
    );
  }

  return createServerClient(supabaseUrl, supabaseSecretKey);
}

/**
 * Verify JWT Token from Authorization header
 * Used to authenticate API requests from the client
 */
export async function verifyJWT(authHeader: string | null) {
  if (!authHeader) {
    return null;
  }

  try {
    const token = authHeader.replace("Bearer ", "");
    const supabase = createSupabaseServerClient();

    // Verify the JWT token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

/**
 * Get user role from database
 * Used to check if user is admin or regular user
 */
export async function getUserRole(userId: string) {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.role;
  } catch (error) {
    console.error("Get user role error:", error);
    return null;
  }
}

/**
 * Check if user is admin
 */
export async function isUserAdmin(userId: string) {
  const role = await getUserRole(userId);
  return role === "admin";
}

/**
 * Create a new user with admin access
 * Only admins can call this
 */
export async function createAdminUser(email: string, password: string) {
  try {
    const supabase = createSupabaseServerClient();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      throw authError || new Error("Failed to create user");
    }

    // Create user record in database with admin role
    const { data: userData, error: dbError } = await supabase
      .from("users")
      .insert([
        {
          id: authData.user.id,
          email,
          role: "admin",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    return { user: userData, success: true };
  } catch (error) {
    console.error("Create admin user error:", error);
    throw error;
  }
}

/**
 * Delete user by ID (admin only)
 */
export async function deleteUserByAdmin(userId: string) {
  try {
    const supabase = createSupabaseServerClient();

    // Delete from database first
    const { error: dbError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (dbError) {
      throw dbError;
    }

    // Delete from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      throw authError;
    }

    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    throw error;
  }
}

/**
 * Update user password (admin only)
 */
export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      throw error;
    }

    return { user: data.user, success: true };
  } catch (error) {
    console.error("Update user password error:", error);
    throw error;
  }
}
