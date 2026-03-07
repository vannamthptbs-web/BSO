import express from "express";
import { createServer as createViteServer } from "vite";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Database (SQLite)
const db = new Database("database.sqlite");
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

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = Number(process.env.PORT) || 3000;

  console.log(`Starting server using SQLite...`);

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      database: "sqlite",
      connected: true,
      debug: {
        seedingStatus
      }
    });
  });

  function removeAccents(str: string) {
    return str.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D');
  }

  // Seed teachers
  let seedingStatus = "pending";
  async function seedTeachers() {
    seedingStatus = "started";
    try {
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

      const adminExists = db.prepare("SELECT id FROM teachers WHERE username = 'admin'").get();
      if (!adminExists) {
        db.prepare("INSERT INTO teachers (name, username, password, role) VALUES (?, ?, ?, ?)").run("Admin Hệ Thống", "admin", "admin123", "admin");
      }
      const existing = db.prepare("SELECT name, username FROM teachers").all();
      const existingNames = new Set(existing.map((t: any) => t.name));
      const existingUsernames = new Set(existing.map((t: any) => t.username));

      for (const name of teacherNames) {
        if (!existingNames.has(name)) {
          const parts = name.trim().split(/\s+/);
          const givenName = removeAccents(parts[parts.length - 1]).toLowerCase();
          let username = givenName;
          let counter = 1;
          while (existingUsernames.has(username)) { username = `${givenName}${counter}`; counter++; }
          existingUsernames.add(username);
          db.prepare("INSERT INTO teachers (name, username, password, role) VALUES (?, ?, ?, ?)").run(name, username, `${givenName}123`, 'teacher');
        }
      }
      seedingStatus = "completed";
      console.log("Seeding complete.");
    } catch (e: any) {
      seedingStatus = "error: " + e.message;
      console.error("Seeding error:", e);
    }
  }

  seedTeachers();

  const oauth2Client = new OAuth2Client(
    process.env.CLIENT_ID || "placeholder",
    process.env.CLIENT_SECRET || "placeholder",
    `${process.env.APP_URL || "http://localhost:3000"}/auth/callback`
  );

  async function getGoogleClient() {
    let tokens;
    const row = db.prepare("SELECT value FROM settings WHERE key = 'google_tokens'").get();
    if (!row) return null;
    tokens = JSON.parse(row.value);
    const client = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
    client.setCredentials(tokens);
    return client;
  }

  app.get("/api/admin/export-teachers", async (req, res) => {
    try {
      const teachers = db.prepare("SELECT name, username, password, role FROM teachers").all();
      res.json(teachers);
    } catch (e) {
      res.status(500).json({ error: "Lỗi xuất dữ liệu" });
    }
  });

  app.get("/api/auth/status", async (req, res) => {
    let connected = false;
    const row = db.prepare("SELECT value FROM settings WHERE key = 'google_tokens'").get();
    connected = !!row;
    res.json({ connected });
  });

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = db.prepare("SELECT * FROM teachers WHERE username = ? AND password = ?").get(username, password);
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      } else {
        res.status(401).json({ error: "Sai tên đăng nhập hoặc mật khẩu" });
      }
    } catch (e) {
      res.status(500).json({ error: "Lỗi hệ thống" });
    }
  });

  app.get("/api/teachers", async (req, res) => {
    try {
      const teachers = db.prepare(`
        SELECT t.*, a.total_score, a.data as assessment_data
        FROM teachers t
        LEFT JOIN assessments a ON a.id = (SELECT id FROM assessments WHERE teacher_id = t.id ORDER BY id DESC LIMIT 1)
      `).all();
      res.json(teachers);
    } catch (e) {
      res.status(500).json({ error: "Lỗi lấy danh sách" });
    }
  });

  app.post("/api/teachers", async (req, res) => {
    const { name, email } = req.body;
    const info = db.prepare("INSERT INTO teachers (name, email) VALUES (?, ?)").run(name, email);
    res.json({ id: info.lastInsertRowid, name, email });
  });

  app.get("/api/auth/url", (req, res) => {
    res.json({ url: oauth2Client.generateAuthUrl({ access_type: "offline", scope: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.file"], prompt: "consent" }) });
  });

  app.get("/auth/callback", async (req, res) => {
    const { code } = req.query;
    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run('google_tokens', JSON.stringify(tokens));
      res.send(`<html><body><script>if(window.opener){window.opener.postMessage({type:'OAUTH_AUTH_SUCCESS'},'*');window.close();}else{window.location.href='/';}</script></body></html>`);
    } catch (error) {
      res.status(500).send("Auth failed");
    }
  });

  app.post("/api/save-assessment", async (req, res) => {
    const { teacherId, quarter, year, scores, rawScores, rawBonus, totals, isFinal } = req.body;
    try {
      const client = await getGoogleClient();
      const sheets = client ? google.sheets({ version: "v4", auth: client }) : null;
      const teacher = db.prepare("SELECT * FROM teachers WHERE id = ?").get(teacherId);
      if (!teacher) return res.status(404).json({ error: "Not found" });

      let spreadsheetId = teacher.sheet_id;
      if (sheets) {
        if (!spreadsheetId) {
          const ss = await sheets.spreadsheets.create({ requestBody: { properties: { title: `KPI_${teacher.name}_${year}` } }, fields: "spreadsheetId" });
          spreadsheetId = ss.data.spreadsheetId;
          db.prepare("UPDATE teachers SET sheet_id = ? WHERE id = ?").run(spreadsheetId, teacherId);
        }
        const sheetTitle = `Quý ${quarter} - ${year}`;
        try { await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: [{ addSheet: { properties: { title: sheetTitle } } }] } }); } catch (e) {}
        const values = [["TIÊU CHÍ", "ĐIỂM TỐI ĐA", "CÁ NHÂN TỰ CHẤM", "TỔ TRƯỞNG CHẤM", "THỦ TRƯỞNG CHẤM"], ...scores.map((s: any) => [s.label, s.maxPoints || "", s.self, s.lead, s.boss]), ["", "", "", "", ""], ["TỔNG ĐIỂM QUY ĐỔI", "", totals.self.toFixed(2), totals.lead.toFixed(2), totals.boss.toFixed(2)], ["TRẠNG THÁI", "", isFinal ? "ĐÃ CHỐT" : "LƯU TẠM", "", ""]];
        await sheets.spreadsheets.values.update({ spreadsheetId, range: `${sheetTitle}!A1`, valueInputOption: "RAW", requestBody: { values } });
      }

      const assessmentData = JSON.stringify({ scores, rawScores, rawBonus, totals, isFinal, quarter, year });
      db.prepare("INSERT INTO assessments (teacher_id, quarter, year, total_score, data) VALUES (?, ?, ?, ?, ?)").run(teacherId, quarter, year, totals.boss || totals.lead || totals.self, assessmentData);
      res.json({ success: true, spreadsheetId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/get-assessment-from-sheet", async (req, res) => {
    const { teacherId, quarter, year } = req.body;
    try {
      const client = await getGoogleClient();
      if (!client) return res.status(400).json({ error: "Google not connected" });
      const sheets = google.sheets({ version: "v4", auth: client });
      const teacher = db.prepare("SELECT * FROM teachers WHERE id = ?").get(teacherId);
      if (!teacher || !teacher.sheet_id) return res.status(404).json({ error: "No sheet" });
      const response = await sheets.spreadsheets.values.get({ spreadsheetId: teacher.sheet_id, range: `Quý ${quarter} - ${year}!A1:E100` });
      res.json({ rows: response.data.values });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));
  }

  app.post("/api/gemini/analyze", async (req, res) => {
    const { data } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Hãy phân tích kết quả đánh giá KPI sau đây và đưa ra nhận xét, gợi ý cải thiện cho giáo viên. Kết quả: ${JSON.stringify(data)}`,
        config: {
          systemInstruction: "Bạn là một chuyên gia quản lý giáo dục, hãy đưa ra nhận xét chuyên nghiệp, mang tính xây dựng bằng tiếng Việt."
        }
      });
      res.json({ analysis: response.text });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.listen(PORT, "0.0.0.0", () => console.log(`Server listening on port ${PORT}`));
  return app;
}

export const appPromise = startServer();
export default async (req: any, res: any) => {
  const app = await appPromise;
  return app(req, res);
};
