import express from "express";
import { createServer as createViteServer } from "vite";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from 'url';
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  console.log("Starting server...");

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  let db: any;
  try {
    db = new Database("database.sqlite");
    db.exec(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'teacher',
        sheet_id TEXT
      );
      CREATE TABLE IF NOT EXISTS assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER,
        quarter TEXT,
        year INTEGER,
        total_score REAL,
        data TEXT,
        FOREIGN KEY(teacher_id) REFERENCES teachers(id)
      );
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
    console.log("Database initialized");
  } catch (err) {
    console.error("Database error:", err);
    // Continue even if DB fails so health check passes
  }

  // Migration: Ensure teachers table has username, password, role columns
  if (db) {
    try {
      console.log("Checking table schema...");
      const tableInfo = db.prepare("PRAGMA table_info(teachers)").all() as any[];
      const columns = tableInfo.map(c => c.name);
      console.log("Current columns:", columns);
      
      if (!columns.includes('username')) {
        console.log("Adding username column...");
        try {
          db.exec("ALTER TABLE teachers ADD COLUMN username TEXT");
          db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_teachers_username ON teachers(username)");
        } catch (e) {
          console.error("Failed to add username column:", e);
        }
      }
      if (!columns.includes('password')) {
        console.log("Adding password column...");
        try {
          db.exec("ALTER TABLE teachers ADD COLUMN password TEXT");
        } catch (e) {
          console.error("Failed to add password column:", e);
        }
      }
      if (!columns.includes('role')) {
        console.log("Adding role column...");
        try {
          db.exec("ALTER TABLE teachers ADD COLUMN role TEXT DEFAULT 'teacher'");
        } catch (e) {
          console.error("Failed to add role column:", e);
        }
      }
      console.log("Schema check complete");
    } catch (e) {
      console.error("Migration error during schema check:", e);
    }

    function removeAccents(str: string) {
      return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D');
    }

    // Migration: Ensure all teachers have usernames and passwords
    try {
      // Re-check columns before running query to avoid "no such column" error if migration failed
      const tableInfo = db.prepare("PRAGMA table_info(teachers)").all() as any[];
      const columns = tableInfo.map(c => c.name);
      
      if (columns.includes('username')) {
        const teachersWithoutUsername = db.prepare("SELECT * FROM teachers WHERE username IS NULL").all() as any[];
        if (teachersWithoutUsername.length > 0) {
          console.log(`Found ${teachersWithoutUsername.length} teachers without username, updating...`);
          const update = db.prepare("UPDATE teachers SET username = ?, password = ?, role = ? WHERE id = ?");
          const existingUsernames = new Set(db.prepare("SELECT username FROM teachers WHERE username IS NOT NULL").all().map((r: any) => r.username));
          
          teachersWithoutUsername.forEach(t => {
            const parts = t.name.trim().split(/\s+/);
            const givenName = removeAccents(parts[parts.length - 1]).toLowerCase();
            let username = givenName;
            let counter = 1;
            while (existingUsernames.has(username)) {
              username = `${givenName}${counter}`;
              counter++;
            }
            existingUsernames.add(username);
            const password = `${givenName}123`;
            update.run(username, password, 'teacher', t.id);
          });
        }
      }

      // Migration: Ensure admin exists
      if (columns.includes('role') && columns.includes('username')) {
        const adminExists = db.prepare("SELECT COUNT(*) as count FROM teachers WHERE role = 'admin'").get() as { count: number };
        if (adminExists.count === 0) {
          db.prepare("INSERT INTO teachers (name, username, password, role) VALUES (?, ?, ?, ?)").run("Admin Hệ Thống", "admin", "admin123", "admin");
        }
      }

      // Seed teachers if not already present
      if (columns.includes('username')) {
        const teacherNames = [
          "Quảng Trọng Bạch", "Lê Thị Kim Bông", "Huỳnh Trung Châu", "Nguyễn Thị Hồ Diễm", "Đỗ Thị Ngọc Diệp",
          "Hồ Thị Dung", "Nguyễn Thị Mai Duyên", "Đặng Thị Điệp", "Nguyễn Thanh Đông", "Nguyễn Thị Thúy Hà",
          "Trần Thị Thu Hà", "Võ Thị Hoàng Hà", "Phạm Thanh Hải", "Đặng Thanh Hải", "Trần Văn Hảo",
          "Lê Thị Cẩm Hằng", "Nguyễn Thị Hồng Hoa", "Lê Thị Anh Hoàng", "Phạm Ngọc Huề", "Huỳnh Thị Huyền",
          "Đậu Công Hữu", "Nguyễn Duy Khảnh", "Trần Hoàng Khánh", "Võ Thị Thiếu Khanh", "Nguyễn Vũ Khương",
          "Nguyễn Thị Thuý Kiều", "Cao Thị Lệ", "Phạm Ngọc Liêm", "Nguyễn Trần Linh", "Nguyễn Thị Kiều Loan",
          "Huỳnh Đình Long", "Thái Văn Luyến", "Hồ Văn Lực", "Võ Thị Lý", "Trịnh Công Minh",
          "Nguyễn Văn Nam", "Ngô Thị Thanh Nga", "Trịnh Thị Hoàng Nga", "Đặng Thị Thanh Nga", "LỮ ANH NGỌC",
          "Nguyễn Tiến Ngọc", "Hồ Thị Ánh Nguyệt", "Lê Tấn Phát", "Nguyễn Thị Hồng Phi", "Hồ Phúc",
          "Nguyễn Văn Phước", "Phạm Thị Phường", "Phạm Nam Hồng Quân", "Lê Văn Quý", "Nguyễn Thị Lệ Quyên",
          "Hà Thị Dạ Quỳnh", "Võ Như Quỳnh", "NGUYỄN VĂN SIN", "Phạm Thạch Sinh", "Lâm Thị Tiên Son",
          "Trần Linh Tâm", "Mai Việt Thái", "Bùi Thị Thanh", "Hà Văn Thanh", "Nguyễn Thị Thu Thanh",
          "Lê Thị Phương Thảo", "Trần Thị Thu Thảo", "Nguyễn Thị Thiềm", "Nguyễn Thị Thiện", "Hồ Quang Thoại",
          "Bùi Thị Thu Thu", "Nguyễn Thị Thu", "Đoàn Thuật", "Nguyễn Thị Bích Thùy", "Nguyễn Thị Thanh Thủy",
          "Nguyễn Thị Thủy", "Phan Thị Thúy", "Đặng Văn Thủy", "Phạm Thị Minh Thư", "Lê Quốc Tiến",
          "Lê Văn Tiến", "Nguyễn Thị Minh Tỉnh", "Phạm Thị Trà", "Ngô Thị Thùy Trang", "Trịnh Thị Hoàng Trinh",
          "Trần Văn Tuấn", "Trần Thị Tuyến", "Bùi Vũ Tuyết", "Nguyễn Văn Tự", "Lại Thị Bảo Uyên",
          "Nguyễn Thị Bích Vân", "Huỳnh Trọng Viễn", "Trần Phương Vỹ", "Phạm Thị Xuân", "Huỳnh Thị Yến"
        ];

        const checkExists = db.prepare("SELECT id FROM teachers WHERE name = ?");
        const insert = db.prepare("INSERT INTO teachers (name, username, password, role) VALUES (?, ?, ?, ?)");
        const existingUsernames = new Set(db.prepare("SELECT username FROM teachers WHERE username IS NOT NULL").all().map((r: any) => r.username));

        teacherNames.forEach(name => {
          const exists = checkExists.get(name);
          if (!exists) {
            const parts = name.trim().split(/\s+/);
            const givenName = removeAccents(parts[parts.length - 1]).toLowerCase();
            let username = givenName;
            let counter = 1;
            while (existingUsernames.has(username)) {
              username = `${givenName}${counter}`;
              counter++;
            }
            existingUsernames.add(username);
            const password = `${givenName}123`;
            insert.run(name, username, password, 'teacher');
            console.log(`Seeded teacher: ${name} (username: ${username})`);
          }
        });
      }
    } catch (e) {
      console.error("Seeding error:", e);
    }
  }

  const oauth2Client = new OAuth2Client(
    process.env.CLIENT_ID || "placeholder",
    process.env.CLIENT_SECRET || "placeholder",
    `${process.env.APP_URL || "http://localhost:3000"}/auth/callback`
  );

  // Helper to get Google Client
  async function getGoogleClient() {
    const tokensRow = db.prepare("SELECT value FROM settings WHERE key = 'google_tokens'").get() as any;
    if (!tokensRow) return null;
    const tokens = JSON.parse(tokensRow.value);
    const client = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
    client.setCredentials(tokens);
    return client;
  }

  // Auth Routes
  app.get("/api/auth/status", async (req, res) => {
    const tokensRow = db.prepare("SELECT value FROM settings WHERE key = 'google_tokens'").get() as any;
    res.json({ connected: !!tokensRow });
  });

  // Auth Routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    try {
      const user = db.prepare("SELECT * FROM teachers WHERE username = ? AND password = ?").get(username, password) as any;
      if (user) {
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      } else {
        res.status(401).json({ error: "Sai tên đăng nhập hoặc mật khẩu" });
      }
    } catch (e: any) {
      console.error("Login error:", e);
      if (e.message.includes("no such column: username")) {
        res.status(500).json({ error: "Hệ thống đang cập nhật cơ sở dữ liệu. Vui lòng thử lại sau vài giây." });
      } else {
        res.status(500).json({ error: "Lỗi hệ thống" });
      }
    }
  });

  // API Routes
  app.get("/api/teachers", (req, res) => {
    const teachers = db.prepare(`
      SELECT t.*, a.total_score, a.data as assessment_data
      FROM teachers t
      LEFT JOIN assessments a ON a.id = (
        SELECT id FROM assessments WHERE teacher_id = t.id ORDER BY id DESC LIMIT 1
      )
    `).all();
    res.json(teachers);
  });

  app.post("/api/teachers", (req, res) => {
    const { name, email } = req.body;
    const info = db.prepare("INSERT INTO teachers (name, email) VALUES (?, ?)").run(name, email);
    res.json({ id: info.lastInsertRowid, name, email });
  });

  app.get("/api/auth/url", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file"
      ],
      prompt: "consent"
    });
    res.json({ url });
  });

  app.get("/auth/callback", async (req, res) => {
    const { code } = req.query;
    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run('google_tokens', JSON.stringify(tokens));
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Xác thực thành công. Cửa sổ này sẽ tự động đóng.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Error getting tokens", error);
      res.status(500).send("Authentication failed");
    }
  });

  app.post("/api/save-assessment", async (req, res) => {
    const { teacherId, quarter, year, scores, rawScores, rawBonus, totals, isFinal } = req.body;
    
    try {
      const client = await getGoogleClient();
      const sheets = client ? google.sheets({ version: "v4", auth: client }) : null;

      const teacher = db.prepare("SELECT * FROM teachers WHERE id = ?").get(teacherId) as any;
      if (!teacher) return res.status(404).json({ error: "Teacher not found" });

      let spreadsheetId = teacher.sheet_id;

      if (sheets) {
        if (!spreadsheetId) {
          const resource = {
            properties: { title: `KPI_${teacher.name}_${year}` },
          };
          const spreadsheet = await sheets.spreadsheets.create({
            requestBody: resource,
            fields: "spreadsheetId",
          });
          spreadsheetId = spreadsheet.data.spreadsheetId;
          db.prepare("UPDATE teachers SET sheet_id = ? WHERE id = ?").run(spreadsheetId, teacherId);
        }

        const sheetTitle = `Quý ${quarter} - ${year}`;
        try {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
              requests: [{ addSheet: { properties: { title: sheetTitle } } }]
            }
          });
        } catch (e) {}

        // Write data to the sheet
        const values = [
          ["TIÊU CHÍ", "ĐIỂM TỐI ĐA", "CÁ NHÂN TỰ CHẤM", "TỔ TRƯỞNG CHẤM", "THỦ TRƯỞNG CHẤM"],
          ...scores.map((s: any) => [s.label, s.maxPoints || "", s.self, s.lead, s.boss]),
          ["", "", "", "", ""],
          ["TỔNG ĐIỂM QUY ĐỔI", "", totals.self.toFixed(2), totals.lead.toFixed(2), totals.boss.toFixed(2)],
          ["TRẠNG THÁI", "", isFinal ? "ĐÃ CHỐT" : "LƯU TẠM", "", ""]
        ];

        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetTitle}!A1`,
          valueInputOption: "RAW",
          requestBody: { values },
        });
      }

      // Save to local database for quick access
      db.prepare(`
        INSERT INTO assessments (teacher_id, quarter, year, total_score, data)
        VALUES (?, ?, ?, ?, ?)
      `).run(teacherId, quarter, year, totals.boss || totals.lead || totals.self, JSON.stringify({ scores, rawScores, rawBonus, totals, isFinal, quarter, year }));

      res.json({ success: true, spreadsheetId, googleConnected: !!sheets });
    } catch (error: any) {
      console.error("Error saving to sheet", error);
      const errorMessage = error.response?.data?.error?.message || error.message || "Unknown error occurred";
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/get-assessment-from-sheet", async (req, res) => {
    const { teacherId, quarter, year } = req.body;
    
    try {
      const client = await getGoogleClient();
      if (!client) return res.status(400).json({ error: "Google chưa được kết nối" });
      const sheets = google.sheets({ version: "v4", auth: client });

      const teacher = db.prepare("SELECT * FROM teachers WHERE id = ?").get(teacherId) as any;
      if (!teacher || !teacher.sheet_id) return res.status(404).json({ error: "Sheet not found for this teacher" });

      const sheetTitle = `Quý ${quarter} - ${year}`;
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: teacher.sheet_id,
        range: `${sheetTitle}!A1:E100`,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: "No data found in sheet" });
      }

      // Return raw rows for display
      res.json({ rows });
    } catch (error: any) {
      console.error("Error reading from sheet", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is listening on port ${PORT}`);
    console.log(`Access the app at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
