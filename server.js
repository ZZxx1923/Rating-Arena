const express = require("express");
const mysql   = require("mysql2");
const cors    = require("cors");
const https   = require("https");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// استخدام متغيرات البيئة
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

/* ── Create tables if not exist ── */
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
        if (err) console.error("Error creating users table:", err);
        
        db.query("SHOW COLUMNS FROM users LIKE 'canViewResults'", (err, result) => {
            if (!err && result.length === 0) {
                db.query("ALTER TABLE users ADD COLUMN canViewResults TINYINT(1) DEFAULT 1");
            }
        });
        db.query("SHOW COLUMNS FROM users LIKE 'role'", (err, result) => {
            if (!err && result.length === 0) {
                db.query("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user'");
            }
        });
        db.query("SELECT id FROM users WHERE username = 'omar'", (err, result) => {
            if (result && result.length === 0) {
                db.query("INSERT INTO users (username, password, role) VALUES ('omar', '123456', 'admin')");
            }
        });
    });

    db.query(`
        CREATE TABLE IF NOT EXISTS evaluations (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            targetName  VARCHAR(200) NOT NULL,
            avgScore    DECIMAL(4,2) DEFAULT 0,
            comment     TEXT,
            status      VARCHAR(50) DEFAULT 'Pending',
            rejectionReason TEXT,
            submittedBy VARCHAR(100),
            isAnonymous TINYINT(1) DEFAULT 0,
            createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error("Error creating evaluations table:", err);
        
        db.query("SHOW COLUMNS FROM evaluations LIKE 'rejectionReason'", (err, result) => {
            if (!err && result.length === 0) {
                db.query("ALTER TABLE evaluations ADD COLUMN rejectionReason TEXT");
            }
        });
        db.query("SHOW COLUMNS FROM evaluations LIKE 'isAnonymous'", (err, result) => {
            if (!err && result.length === 0) {
                db.query("ALTER TABLE evaluations ADD COLUMN isAnonymous TINYINT(1) DEFAULT 0");
            }
        });
    });

    db.query(`
        CREATE TABLE IF NOT EXISTS questions (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            questionText VARCHAR(500) NOT NULL,
            questionTextEn VARCHAR(500),
            questionType VARCHAR(50) DEFAULT 'rating',
            createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error("Error creating questions table:", err);
        
        db.query("SHOW COLUMNS FROM questions LIKE 'questionTextEn'", (err, result) => {
            if (!err && result.length === 0) {
                db.query("ALTER TABLE questions ADD COLUMN questionTextEn VARCHAR(500)");
            }
        });
        
        db.query("SELECT id FROM questions LIMIT 1", (err, result) => {
            if (err || (result && result.length === 0)) {
                console.log("إضافة الأسئلة الافتراضية...");
                const defaultQuestions = [
                    ['جودة العمل المقدم؟', 'Quality of work delivered?', 'rating'],
                    ['القيادة والمبادرة؟', 'Leadership and initiative?', 'rating'],
                    ['الالتزام بالوقت والمواعيد؟', 'Punctuality and deadlines?', 'rating'],
                    ['التعاون مع الفريق؟', 'Teamwork and collaboration?', 'rating']
                ];
                defaultQuestions.forEach(q => {
                    db.query("INSERT INTO questions (questionText, questionTextEn, questionType) VALUES (?, ?, ?)", q);
                });
            }
        });
    });

    db.query(`
        CREATE TABLE IF NOT EXISTS employees (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            name        VARCHAR(255) NOT NULL UNIQUE,
            department  VARCHAR(255),
            createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.query(`
        CREATE TABLE IF NOT EXISTS departments (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            name        VARCHAR(255) NOT NULL UNIQUE,
            createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

/* ════════════════════════════════
   AUTH
════════════════════════════════ */
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    db.query(
        "SELECT * FROM users WHERE username=? AND password=?",
        [username, password],
        (err, result) => {
            if (err) {
                console.error("Login Error:", err);
                return res.status(500).json({ message: "خطأ في السيرفر" });
            }
            if (result.length > 0) {
                const user = result[0];
                res.json({ 
                    success: true, 
                    message: "تم تسجيل الدخول",
                    user: {
                        username: user.username,
                        role: user.role,
                        canViewResults: user.canViewResults
                    }
                });
            } else {
                res.json({ success: false, message: "بيانات خطأ" });
            }
        }
    );
});

/* ════════════════════════════════
   USERS
════════════════════════════════ */
app.get("/users", (req, res) => {
    db.query("SELECT id, username, canViewResults, role FROM users ORDER BY id", (err, result) => {
        if (err) {
            console.error("Get Users Error:", err);
            return res.status(500).json({ message: "خطأ في السيرفر" });
        }
        res.json(result);
    });
});

app.patch("/users/:id/role", (req, res) => {
    const { role } = req.body;
    db.query(
        "UPDATE users SET role=? WHERE id=?",
        [role, req.params.id],
        (err) => {
            if (err) {
                console.error("Update Role Error:", err);
                return res.status(500).json({ message: "فشل التحديث" });
            }
            res.json({ success: true });
        }
    );
});

app.post("/users", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.json({ success: false, message: "البيانات ناقصة" });

    db.query("SELECT id FROM users WHERE username=?", [username], (err, result) => {
        if (err) return res.status(500).json({ message: "خطأ" });
        if (result.length > 0)
            return res.json({ success: false, message: "اسم المستخدم موجود مسبقاً" });

        db.query("INSERT INTO users (username, password) VALUES (?,?)", [username, password], (err2) => {
            if (err2) return res.status(500).json({ message: "فشل الإضافة" });
            res.json({ success: true });
        });
    });
});

app.delete("/users/:id", (req, res) => {
    db.query("DELETE FROM users WHERE id=?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "فشل الحذف" });
        res.json({ success: true });
    });
});

/* ════════════════════════════════
   EMPLOYEES
════════════════════════════════ */
app.get("/employees", (req, res) => {
    db.query("SELECT * FROM employees ORDER BY name", (err, result) => {
        if (err) {
            console.error("Get Employees Error:", err);
            return res.status(500).json({ message: "خطأ في السيرفر" });
        }
        res.json(result || []);
    });
});

app.post("/employees", (req, res) => {
    const { name, department } = req.body;
    if (!name) return res.json({ success: false, message: "اسم الموظف مطلوب" });
    db.query("INSERT INTO employees (name, department) VALUES (?, ?)", [name, department || null], (err, result) => {
        if (err) {
            console.error("Add Employee Error:", err);
            return res.status(500).json({ success: false, message: "فشل إضافة الموظف" });
        }
        res.json({ success: true, id: result.insertId });
    });
});

app.delete("/employees/:id", (req, res) => {
    db.query("DELETE FROM employees WHERE id=?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "فشل حذف الموظف" });
        res.json({ success: true });
    });
});

/* ════════════════════════════════
   DEPARTMENTS
════════════════════════════════ */
app.get("/departments", (req, res) => {
    db.query("SELECT * FROM departments ORDER BY name", (err, result) => {
        if (err) {
            console.error("Get Departments Error:", err);
            return res.status(500).json({ message: "خطأ في السيرفر" });
        }
        res.json(result || []);
    });
});

app.post("/departments", (req, res) => {
    const { name } = req.body;
    if (!name) return res.json({ success: false, message: "اسم القسم مطلوب" });
    db.query("INSERT INTO departments (name) VALUES (?)", [name], (err, result) => {
        if (err) {
            console.error("Add Department Error:", err);
            return res.status(500).json({ success: false, message: "فشل إضافة القسم" });
        }
        res.json({ success: true, id: result.insertId });
    });
});

app.delete("/departments/:id", (req, res) => {
    db.query("DELETE FROM departments WHERE id=?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "فشل حذف القسم" });
        res.json({ success: true });
    });
});

/* ════════════════════════════════
   EVALUATIONS
════════════════════════════════ */
app.get("/evaluations", (req, res) => {
    db.query(
        "SELECT * FROM evaluations ORDER BY createdAt DESC",
        (err, result) => {
            if (err) {
                console.error("Get Evaluations Error:", err);
                // محاولة استعلام بديل في حال كان اسم العمود مختلفاً (createdAt vs created_at)
                db.query("SELECT * FROM evaluations ORDER BY id DESC", (err2, result2) => {
                    if (err2) return res.status(500).json({ message: "خطأ في قاعدة البيانات", error: err.message });
                    res.json(result2 || []);
                });
                return;
            }
            res.json(result || []);
        }
    );
});

app.post("/evaluations", (req, res) => {
    const { targetName, avgScore, comment, status, submittedBy, isAnonymous } = req.body;
    if (!targetName) return res.json({ success: false, message: "بيانات ناقصة" });

    const sql = "INSERT INTO evaluations (targetName, avgScore, comment, status, submittedBy, isAnonymous) VALUES (?,?,?,?,?,?)";
    const values = [targetName, avgScore || 0, comment || '', status || 'Pending', submittedBy || '', isAnonymous ? 1 : 0];
    
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Post Evaluation Error:", err);
            // محاولة إدراج بدون الأعمدة الجديدة في حال فشل الإدراج
            db.query("INSERT INTO evaluations (targetName, avgScore, comment, status) VALUES (?,?,?,?)", 
            [targetName, avgScore || 0, comment || '', status || 'Pending'], (err2, result2) => {
                if (err2) return res.status(500).json({ success: false, message: "فشل الحفظ النهائي", error: err.message });
                res.json({ success: true, id: result2.insertId });
            });
            return;
        }
        res.json({ success: true, id: result.insertId });
    });
});

app.patch("/evaluations/:id", (req, res) => {
    const { status, rejectionReason } = req.body;
    db.query(
        "UPDATE evaluations SET status=?, rejectionReason=? WHERE id=?",
        [status, rejectionReason || null, req.params.id],
        (err) => {
            if (err) {
                console.error("Update Evaluation Error:", err);
                return res.status(500).json({ message: "فشل التحديث" });
            }
            res.json({ success: true });
        }
    );
});

app.delete("/evaluations/:id", (req, res) => {
    db.query("DELETE FROM evaluations WHERE id=?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "فشل الحذف" });
        res.json({ success: true });
    });
});

/* ════════════════════════════════
   QUESTIONS MANAGEMENT
════════════════════════════════ */
app.get("/questions", (req, res) => {
    db.query("SELECT * FROM questions ORDER BY id", (err, result) => {
        if (err) {
            console.error("Get Questions Error:", err);
            return res.status(500).json({ message: "خطأ" });
        }
        res.json(result || []);
    });
});

app.post("/questions", (req, res) => {
    const { questionText, questionTextEn, questionType } = req.body;
    if (!questionText) return res.json({ success: false, message: "نص السؤال مطلوب" });

    db.query(
        "INSERT INTO questions (questionText, questionTextEn, questionType) VALUES (?,?,?)",
        [questionText, questionTextEn || questionText, questionType || 'rating'],
        (err, result) => {
            if (err) {
                console.error("Post Question Error:", err);
                return res.status(500).json({ success: false, message: "فشل الإضافة" });
            }
            res.json({ success: true, id: result.insertId });
        }
    );
});

app.delete("/questions/:id", (req, res) => {
    db.query("DELETE FROM questions WHERE id=?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "فشل الحذف" });
        res.json({ success: true });
    });
});

/* ════════════════════════════════
   IMPORT FROM GOOGLE SHEETS
════════════════════════════════ */
app.post("/import-from-sheets", (req, res) => {
    const { scriptUrl } = req.body;
    if (!scriptUrl)
        return res.json({ success: false, message: "يرجى إدخال رابط Google Script" });

    const url = scriptUrl + "?action=get";

    https.get(url, (response) => {
        // Follow redirects
        if (response.statusCode === 302 || response.statusCode === 301) {
            https.get(response.headers.location, handleResponse);
        } else {
            handleResponse(response);
        }

        function handleResponse(resp) {
            let raw = '';
            resp.on('data', chunk => raw += chunk);
            resp.on('end', () => {
                try {
                    const rows = JSON.parse(raw);
                    if (!Array.isArray(rows) || rows.length === 0)
                        return res.json({ success: false, message: "لا توجد بيانات في الشيت" });

                    let imported = 0;
                    let done = 0;

                    rows.forEach(row => {
                        db.query(
                            `INSERT IGNORE INTO evaluations (targetName, avgScore, comment, status, submittedBy, createdAt)
                             VALUES (?,?,?,?,?,?)`,
                            [
                                row.targetName || '',
                                parseFloat(row.avgScore) || 0,
                                row.comment   || '',
                                row.status    || 'Pending',
                                row.submittedBy || 'Google Sheets',
                                row.date ? new Date(row.date) : new Date()
                            ],
                            (err) => {
                                if (!err) imported++;
                                done++;
                                if (done === rows.length)
                                    res.json({ success: true, imported, total: rows.length });
                            }
                        );
                    });
                } catch (e) {
                    res.json({ success: false, message: "فشل تحليل البيانات: " + e.message });
                }
            });
        }
    }).on('error', (e) => {
        res.json({ success: false, message: "تعذّر الوصول للشيت: " + e.message });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 السيرفر شغال على البورت ${PORT}`));
