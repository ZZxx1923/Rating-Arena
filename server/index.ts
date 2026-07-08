import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { supabase } from "./db"; // Import the Supabase client
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Middleware
app.use(express.json()); // For parsing application/json

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey";

// Middleware to protect routes
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401); // No token

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403); // Token no longer valid
    req.user = user;
    next();
  });
};

// Middleware for role-based access control
const authorizeRole = (roles: string[]) => (req: any, res: any, next: any) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).send("Access denied.");
  }
  next();
};

// --- API Endpoints ---

// Register User
app.post("/api/register", async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).send("Username and password are required.");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert([{ username, password: hashedPassword, role: role || "user" }])
      .select('id, username, role')
      .single();

    if (error) throw error;
    res.status(201).json({ message: "User registered successfully", user: data });
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).send("Username already exists.");
    }
    console.error("Registration error:", error);
    res.status(500).send("Server error during registration.");
  }
});

// Login User
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("Username and password are required.");
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return res.status(400).send("Invalid credentials.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid credentials.");
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Server error during login.");
  }
});

// Get all users (Admin only)
app.get("/api/users", authenticateToken, authorizeRole(["admin"]), async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, role, created_at');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).send("Server error.");
  }
});

// Delete User (Admin only)
app.delete("/api/users/:id", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.status(200).send("User deleted successfully.");
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).send("Server error.");
  }
});

// --- Questions Endpoints (Admin only) ---

// Get all questions
app.get("/api/questions", authenticateToken, authorizeRole(["admin"]), async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Get questions error:", error);
    res.status(500).send("Server error.");
  }
});

// Create a new question
app.post("/api/questions", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const { question_text, question_text_en, question_type } = req.body;
  if (!question_text) {
    return res.status(400).send("Question text is required.");
  }
  try {
    const { data, error } = await supabase
      .from('questions')
      .insert([{ question_text, question_text_en, question_type: question_type || "rating" }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error("Create question error:", error);
    res.status(500).send("Server error.");
  }
});

// Update a question
app.patch("/api/questions/:id", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { question_text, question_text_en, question_type } = req.body;
  try {
    const { data, error } = await supabase
      .from('questions')
      .update({ question_text, question_text_en, question_type, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Update question error:", error);
    res.status(500).send("Server error.");
  }
});

// Delete a question
app.delete("/api/questions/:id", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.status(200).send("Question deleted successfully.");
  } catch (error) {
    console.error("Delete question error:", error);
    res.status(500).send("Server error.");
  }
});

// --- Employees Endpoints ---

// Get all employees
app.get("/api/employees", authenticateToken, async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Get employees error:", error);
    res.status(500).send("Server error.");
  }
});

// Create a new employee
app.post("/api/employees", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const { name, name_en, position, department_id, email } = req.body;
  if (!name) {
    return res.status(400).send("Employee name is required.");
  }
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert([{ name, name_en, position, department_id, email }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error("Create employee error:", error);
    res.status(500).send("Server error.");
  }
});

// Update an employee
app.patch("/api/employees/:id", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { name, name_en, position, department_id, email } = req.body;
  try {
    const { data, error } = await supabase
      .from('employees')
      .update({ name, name_en, position, department_id, email, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Update employee error:", error);
    res.status(500).send("Server error.");
  }
});

// Delete an employee
app.delete("/api/employees/:id", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.status(200).send("Employee deleted successfully.");
  } catch (error) {
    console.error("Delete employee error:", error);
    res.status(500).send("Server error.");
  }
});

// --- Departments Endpoints ---

// Get all departments
app.get("/api/departments", authenticateToken, async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).send("Server error.");
  }
});

// Create a new department
app.post("/api/departments", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const { name, name_en } = req.body;
  if (!name) {
    return res.status(400).send("Department name is required.");
  }
  try {
    const { data, error } = await supabase
      .from('departments')
      .insert([{ name, name_en }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error("Create department error:", error);
    res.status(500).send("Server error.");
  }
});

// Update a department
app.patch("/api/departments/:id", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { name, name_en } = req.body;
  try {
    const { data, error } = await supabase
      .from('departments')
      .update({ name, name_en, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Update department error:", error);
    res.status(500).send("Server error.");
  }
});

// Delete a department
app.delete("/api/departments/:id", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.status(200).send("Department deleted successfully.");
  } catch (error) {
    console.error("Delete department error:", error);
    res.status(500).send("Server error.");
  }
});

// --- Evaluations Endpoints ---

// Get all evaluations (Admin only)
app.get("/api/evaluations", authenticateToken, authorizeRole(["admin"]), async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Get evaluations error:", error);
    res.status(500).send("Server error.");
  }
});

// Submit Evaluation
app.post("/api/evaluations", authenticateToken, async (req: any, res) => {
  const { employeeId, isAnonymous, ratings, comment } = req.body;
  const userId = isAnonymous ? null : req.user.id;

  if (!employeeId || !ratings) {
    return res.status(400).send("Employee ID and ratings are required.");
  }

  try {
    const { data: evaluation, error: evalError } = await supabase
      .from('evaluations')
      .insert([{ employee_id: employeeId, user_id: userId, is_anonymous: isAnonymous, comment }])
      .select()
      .single();

    if (evalError) throw evalError;

    const responses = Object.entries(ratings).map(([questionId, score]) => ({
      evaluation_id: evaluation.id,
      question_id: questionId,
      score
    }));

    const { error: respError } = await supabase
      .from('responses')
      .insert(responses);

    if (respError) throw respError;

    res.status(201).json({ message: "Evaluation submitted successfully", evaluationId: evaluation.id });
  } catch (error) {
    console.error("Submit evaluation error:", error);
    res.status(500).send("Server error during evaluation submission.");
  }
});

// Update Evaluation Status
app.patch("/api/evaluations/:id", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { status, rejection_reason } = req.body;
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .update({ status, rejection_reason, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Update evaluation status error:", error);
    res.status(500).send("Server error.");
  }
});

// Delete Evaluation
app.delete("/api/evaluations/:id", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('evaluations')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.status(200).send("Evaluation deleted successfully.");
  } catch (error) {
    console.error("Delete evaluation error:", error);
    res.status(500).send("Server error.");
  }
});

// Get Analytics
app.get("/api/analytics", authenticateToken, authorizeRole(["admin"]), async (_req, res) => {
  try {
    const { data: avgScores, error: err1 } = await supabase.rpc('get_average_scores');
    const { data: statusCounts, error: err2 } = await supabase.rpc('get_status_counts');
    
    if (err1 || err2) {
      // Fallback if RPCs are not defined
      const { data: evals, error: err3 } = await supabase.from('evaluations').select('status');
      if (err3) throw err3;
      const counts = evals.reduce((acc: any, curr: any) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {});
      res.json({ averageScores: [], statusCounts: Object.entries(counts).map(([status, count]) => ({ status, count })) });
    } else {
      res.json({ averageScores: avgScores, statusCounts: statusCounts });
    }
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).send("Server error.");
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
