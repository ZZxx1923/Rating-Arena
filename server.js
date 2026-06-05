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
    if (err) console.log("DB Error:", err);
    else {
        console.log("✅ تم الاتصال بقاعدة البيانات");
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
            canViewResults TINYINT(1) DEFAULT 1
        )
    `, () => {
        // Migration: ensure canViewResults column exists if table was created earlier
        db.query("SHOW COLUMNS FROM users LIKE 'canViewResults'", (err, result) => {
            if (!err && result.length === 0) {
                db.query("ALTER TABLE users ADD COLUMN canViewResults TINYINT(1) DEFAULT 1");
            }
        });
        // Ensure 'omar' exists
        db.query("SELECT id FROM users WHERE username = 'omar'", (err, result) => {
            if (result && result.length === 0) {
                db.query("INSERT INTO users (username, password) VALUES ('omar', '123456')");
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
    `, () => {
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
    `, () => {
        // Migration: ensure questionTextEn exists
        db.query("SHOW COLUMNS FROM questions LIKE 'questionTextEn'", (err, result) => {
            if (!err && result.length === 0) {
                db.query("ALTER TABLE questions ADD COLUMN questionTextEn VARCHAR(500)");
            }
        });
        
        db.query("SELECT COUNT(*) as count FROM questions", (err, result) => {
            if (result && result[0].count === 0) {
                db.query("INSERT INTO questions (questionText, questionTextEn, questionType) VALUES (?, ?, ?)", 
                    ['جودة العمل المقدم؟', 'Quality of work delivered?', 'rating']);
                db.query("INSERT INTO questions (questionText, questionTextEn, questionType) VALUES (?, ?, ?)", 
                    ['القيادة والمبادرة؟', 'Leadership and initiative?', 'rating']);
            }
        });
    });
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
            if (err) return res.status(500).json({ message: "خطأ في السيرفر" });
            if (result.length > 0) {
                const user = result[0];
                res.json({ 
                    success: true, 
                    message: "تم تسجيل الدخول",
                    user: {
                        username: user.username,
                        role: user.username === 'omar' ? 'admin' : 'user',
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
    db.query("SELECT id, username, canViewResults FROM users ORDER BY id", (err, result) => {
        if (err) return res.status(500).json({ message: "خطأ في السيرفر" });
        res.json(result);
    });
});

app.patch("/users/:id/permission", (req, res) => {
    const { canViewResults } = req.body;
    db.query(
        "UPDATE users SET canViewResults=? WHERE id=?",
        [canViewResults ? 1 : 0, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ message: "فشل التحديث" });
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
   EVALUATIONS
════════════════════════════════ */
app.get("/evaluations", (req, res) => {
    db.query("SELECT * FROM evaluations ORDER BY created_at DESC", (err, results) => {
        if (err) {
            console.error("Fetch Eval Error:", err);
            return res.status(500).json({ error: err.message });
        }
        // التأكد من تحويل scores من نص إلى JSON إذا لزم الأمر
        const processed = results.map(row => {
            if (typeof row.scores === 'string') {
                try { row.scores = JSON.parse(row.scores); } catch(e) { row.scores = {}; }
            }
            return row;
        });
        res.json(processed);
    });
});


app.post("/evaluations", (req, res) => {
    const { target_type, target_name, evaluator_name, scores, comment, status } = req.body;
    
    // تحويل التقييمات إلى نص لحفظها في قاعدة البيانات
    const scoresStr = JSON.stringify(scores || {});
    
    const sql = "INSERT INTO evaluations (target_type, target_name, evaluator_name, scores, comment, status) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [
        target_type || 'employee', 
        target_name, 
        evaluator_name || 'Anonymous', 
        scoresStr, 
        comment || '', 
        status || 'pending'
    ], (err, result) => {
        if (err) {
            console.error("Insert Eval Error:", err);
            return res.status(500).json({ error: err.message });
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
            if (err) return res.status(500).json({ message: "فشل التحديث" });
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
        if (err) return res.status(500).json({ message: "خطأ" });
        res.json(result);
    });
});

app.post("/questions", (req, res) => {
    const { questionText, questionTextEn, questionType } = req.body;
    if (!questionText) return res.json({ success: false, message: "نص السؤال مطلوب" });

    db.query(
        "INSERT INTO questions (questionText, questionTextEn, questionType) VALUES (?,?,?)",
        [questionText, questionTextEn || questionText, questionType || 'rating'],
        (err, result) => {
            if (err) return res.status(500).json({ success: false, message: "فشل الإضافة" });
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
