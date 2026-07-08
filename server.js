const express = require("express");
const mysql   = require("mysql2");
const cors    = require("cors");
const https   = require("https");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host:     "localhost",
    user:     "root",
    password: "",
    database: "employee_system"
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
            password VARCHAR(255) NOT NULL
        )
    `, () => {
        // Ensure 'omar' exists
        db.query("INSERT IGNORE INTO users (username, password) VALUES ('omar', '123456')");
    });

    db.query(`
        CREATE TABLE IF NOT EXISTS evaluations (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            targetName  VARCHAR(200) NOT NULL,
            avgScore    DECIMAL(4,2) DEFAULT 0,
            comment     TEXT,
            status      VARCHAR(50) DEFAULT 'Pending',
            submittedBy VARCHAR(100),
            createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.query(`
        CREATE TABLE IF NOT EXISTS questions (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            questionText VARCHAR(500) NOT NULL,
            questionType VARCHAR(50) DEFAULT 'rating',
            createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, () => {
        db.query("SELECT COUNT(*) as count FROM questions", (err, result) => {
            if (result && result[0].count === 0) {
                db.query("INSERT INTO questions (questionText, questionType) VALUES (?, ?)", ['Quality of work delivered?', 'rating']);
                db.query("INSERT INTO questions (questionText, questionType) VALUES (?, ?)", ['Leadership and initiative?', 'rating']);
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
            if (err) return res.status(500).send("خطأ في السيرفر");
            res.send(result.length > 0 ? "تم تسجيل الدخول" : "بيانات خطأ");
        }
    );
});

/* ════════════════════════════════
   USERS
════════════════════════════════ */
app.get("/users", (req, res) => {
    db.query("SELECT id, username FROM users ORDER BY id", (err, result) => {
        if (err) return res.status(500).json({ message: "خطأ في السيرفر" });
        res.json(result);
    });
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
    db.query(
        "SELECT * FROM evaluations ORDER BY createdAt DESC",
        (err, result) => {
            if (err) return res.status(500).json({ message: "خطأ" });
            res.json(result);
        }
    );
});

app.post("/evaluations", (req, res) => {
    const { targetName, avgScore, comment, status, submittedBy } = req.body;
    if (!targetName) return res.json({ success: false, message: "بيانات ناقصة" });

    db.query(
        "INSERT INTO evaluations (targetName, avgScore, comment, status, submittedBy) VALUES (?,?,?,?,?)",
        [targetName, avgScore || 0, comment || '', status || 'Pending', submittedBy || ''],
        (err, result) => {
            if (err) return res.status(500).json({ success: false, message: "فشل الحفظ" });
            res.json({ success: true, id: result.insertId });
        }
    );
});

app.patch("/evaluations/:id", (req, res) => {
    const { status } = req.body;
    db.query(
        "UPDATE evaluations SET status=? WHERE id=?",
        [status, req.params.id],
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
    const { questionText, questionType } = req.body;
    if (!questionText) return res.json({ success: false, message: "نص السؤال مطلوب" });

    db.query(
        "INSERT INTO questions (questionText, questionType) VALUES (?,?)",
        [questionText, questionType || 'rating'],
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

app.listen(3000, () => console.log("🚀 السيرفر شغال على البورت 3000"));
