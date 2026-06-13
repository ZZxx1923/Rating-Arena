const express = require("express");
const mysql   = require("mysql2");
const cors    = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host:     process.env.DB_HOST || "localhost",
    user:     process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "employee_system",
    port:     process.env.DB_PORT || 3306,
    ssl:      process.env.DB_HOST !== "localhost" ? { rejectUnauthorized: false } : null
});

db.connect((err) => {
    if (err) console.error("❌ DB Connection Error:", err);
    else {
        console.log("✅ تم الاتصال بقاعدة البيانات بنجاح");
        createTables();
    }
});

function createTables() {
    db.query(`
        CREATE TABLE IF NOT EXISTS users (
            id       INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            canViewResults TINYINT(1) DEFAULT 1,
            role VARCHAR(50) DEFAULT 'user'
        )
    `, (err) => {
        if (!err) {
            db.query("SELECT id FROM users WHERE username = 'omar'", (err, result) => {
                if (result && result.length === 0) {
                    db.query("INSERT INTO users (username, password, role) VALUES ('omar', '123456', 'admin')");
                }
            });
        }
    });

    db.query(`
        CREATE TABLE IF NOT EXISTS evaluations (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            targetName  VARCHAR(200) NOT NULL,
            avgScore    DECIMAL(4,2) DEFAULT 0,
            details     JSON,
            comment     TEXT,
            status      VARCHAR(50) DEFAULT 'Pending',
            rejectionReason TEXT,
            submittedBy VARCHAR(100),
            isAnonymous TINYINT(1) DEFAULT 0,
            createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.query(`
        CREATE TABLE IF NOT EXISTS questions (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            questionText VARCHAR(500) NOT NULL,
            questionTextEn VARCHAR(500),
            questionType VARCHAR(50) DEFAULT 'rating',
            createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.query(`
        CREATE TABLE IF NOT EXISTS employees (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            name        VARCHAR(255) NOT NULL,
            nameEn      VARCHAR(255),
            department  VARCHAR(255),
            departmentEn VARCHAR(255),
            createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.query(`
        CREATE TABLE IF NOT EXISTS departments (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            name        VARCHAR(255) NOT NULL,
            nameEn      VARCHAR(255),
            createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    db.query("SELECT * FROM users WHERE username=? AND password=?", [username, password], (err, result) => {
        if (err) return res.status(500).json({ message: "Error" });
        if (result.length > 0) {
            const user = result[0];
            res.json({ success: true, user: { username: user.username, role: user.role, canViewResults: user.canViewResults } });
        } else res.json({ success: false });
    });
});

app.get("/users", (req, res) => {
    db.query("SELECT id, username, canViewResults, role FROM users ORDER BY id", (err, result) => {
        if (err) return res.status(500).json({ message: "Error" });
        res.json(result);
    });
});

app.post("/users", (req, res) => {
    const { username, password, role } = req.body;
    db.query("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, password, role || 'user'], (err) => {
        if (err) return res.status(500).json({ success: false, message: "User exists" });
        res.json({ success: true });
    });
});

app.patch("/users/:id", (req, res) => {
    const fields = [];
    const values = [];
    if (req.body.role) { fields.push("role = ?"); values.push(req.body.role); }
    if (req.body.canViewResults !== undefined) { fields.push("canViewResults = ?"); values.push(req.body.canViewResults); }
    values.push(req.params.id);
    db.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

app.delete("/users/:id", (req, res) => {
    db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

app.get("/evaluations", (req, res) => {
    db.query("SELECT * FROM evaluations ORDER BY id DESC", (err, result) => {
        if (err) return res.status(500).json({ message: "Error" });
        res.json(result || []);
    });
});

app.post("/evaluations", (req, res) => {
    const { targetName, avgScore, details, comment, status, submittedBy, isAnonymous } = req.body;
    const sql = "INSERT INTO evaluations (targetName, avgScore, details, comment, status, submittedBy, isAnonymous) VALUES (?,?,?,?,?,?,?)";
    const values = [targetName, avgScore, JSON.stringify(details), comment, status || 'Pending', submittedBy, isAnonymous ? 1 : 0];
    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, id: result.insertId });
    });
});

app.patch("/evaluations/:id", (req, res) => {
    db.query("UPDATE evaluations SET status = ? WHERE id = ?", [req.body.status, req.params.id], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

app.delete("/evaluations/:id", (req, res) => {
    db.query("DELETE FROM evaluations WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

app.get("/questions", (req, res) => {
    db.query("SELECT * FROM questions ORDER BY id", (err, result) => {
        if (err) return res.status(500).json({ message: "Error" });
        res.json(result);
    });
});

app.post("/questions", (req, res) => {
    db.query("INSERT INTO questions (questionText, questionTextEn) VALUES (?, ?)", [req.body.questionText, req.body.questionTextEn], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

app.delete("/questions/:id", (req, res) => {
    db.query("DELETE FROM questions WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

app.get("/employees", (req, res) => {
    db.query("SELECT * FROM employees ORDER BY name", (err, result) => {
        if (err) return res.status(500).json({ message: "Error" });
        res.json(result);
    });
});

app.post("/employees", (req, res) => {
    db.query("INSERT INTO employees (name) VALUES (?)", [req.body.name], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

app.delete("/employees/:id", (req, res) => {
    db.query("DELETE FROM employees WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

app.get("/departments", (req, res) => {
    db.query("SELECT * FROM departments ORDER BY name", (err, result) => {
        if (err) return res.status(500).json({ message: "Error" });
        res.json(result);
    });
});

app.post("/departments", (req, res) => {
    db.query("INSERT INTO departments (name) VALUES (?)", [req.body.name], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

app.delete("/departments/:id", (req, res) => {
    db.query("DELETE FROM departments WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
