import express, { Request, Response } from "express";
import {
  verifyJWT,
  isUserAdmin,
  createAdminUser,
  deleteUserByAdmin,
  updateUserPassword,
  createSupabaseServerClient,
} from "../supabaseServer";

const router = express.Router();

/**
 * Middleware to verify admin access
 */
async function requireAdmin(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization || null;
  const user = await verifyJWT(authHeader);

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const isAdmin = await isUserAdmin(user.id);
  if (!isAdmin) {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }

  (req as any).user = user;
  next();
}

/**
 * POST /api/admin/users
 * Create a new admin user (admin only)
 */
router.post("/users", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await createAdminUser(email, password);
    res.json(result);
  } catch (error: any) {
    console.error("Create admin user error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/admin/users/:userId
 * Delete a user (admin only)
 */
router.delete("/users/:userId", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await deleteUserByAdmin(userId);
    res.json(result);
  } catch (error: any) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/admin/users/:userId/password
 * Update user password (admin only)
 */
router.put("/users/:userId/password", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: "New password is required" });
    }

    const result = await updateUserPassword(userId, newPassword);
    res.json(result);
  } catch (error: any) {
    console.error("Update password error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/users
 * Get all users (admin only)
 */
router.get("/users", requireAdmin, async (req: Request, res: Response) => {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.json({ users: data });
  } catch (error: any) {
    console.error("Get users error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/evaluations
 * Get all evaluations (admin only)
 */
router.get("/evaluations", requireAdmin, async (req: Request, res: Response) => {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("evaluations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.json({ evaluations: data });
  } catch (error: any) {
    console.error("Get evaluations error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
