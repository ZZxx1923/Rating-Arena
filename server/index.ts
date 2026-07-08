import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "./db.js"; // Ensure .js extension for ESM if needed, or just ./db
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT
const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access denied" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// ─── Auth Routes ────────────────────────────────────────────────────────────

app.post("/api/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/register", async (req: Request, res: Response) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from("users")
      .insert([{ username, password: hashedPassword, role: role || "user" }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: "User created", user: data });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// ─── API Routes ─────────────────────────────────────────────────────────────

app.get("/api/users", authenticateToken, async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("users").select("id, username, role, created_at");
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

app.get("/api/employees", authenticateToken, async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("employees").select("*");
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

app.get("/api/departments", authenticateToken, async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("departments").select("*");
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

app.get("/api/questions", authenticateToken, async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("questions").select("*");
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

app.post("/api/evaluations", authenticateToken, async (req: any, res: Response) => {
  const { employeeId, isAnonymous, ratings, comment } = req.body;
  try {
    const { data: evaluation, error: evalError } = await supabase
      .from("evaluations")
      .insert([{
        employee_id: employeeId,
        user_id: isAnonymous ? null : req.user.id,
        is_anonymous: isAnonymous,
        comment,
        status: "pending"
      }])
      .select()
      .single();

    if (evalError) throw evalError;

    const responseInserts = Object.entries(ratings).map(([qId, score]) => ({
      evaluation_id: evaluation.id,
      question_id: qId,
      score
    }));

    const { error: respError } = await supabase.from("responses").insert(responseInserts);
    if (respError) throw respError;

    res.status(201).json(evaluation);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/api/analytics", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { data: evaluations } = await supabase.from("evaluations").select("*, responses(*)");
    const { data: employees } = await supabase.from("employees").select("*");
    const { data: departments } = await supabase.from("departments").select("*");
    
    res.json({ evaluations, employees, departments });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Export the app for Vercel
export default app;
