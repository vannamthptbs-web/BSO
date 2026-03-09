# Hệ thống đánh giá KPI Cán bộ - Giáo viên THPT Bình Sơn

Ứng dụng đánh giá KPI chuyên nghiệp, tích hợp Google Sheets để lưu trữ báo cáo và Gemini AI để phân tích kết quả.

## 🚀 Tính năng chính

- **Quản lý Giáo viên**: Danh sách giáo viên với tài khoản đăng nhập riêng.
- **Đánh giá KPI**: Mẫu đánh giá chi tiết theo quý, tự động tính điểm.
- **Kết nối Google Sheets**: Tự động tạo và cập nhật báo cáo lên Google Sheets của từng giáo viên.
- **Phân tích Gemini AI**: Sử dụng trí tuệ nhân tạo để nhận xét và gợi ý cải thiện dựa trên kết quả KPI.
- **Xuất dữ liệu**: Admin có quyền xuất danh sách tài khoản giáo viên ra file CSV.

## 🛠️ Công nghệ sử dụng

- **Frontend**: React, Tailwind CSS, Lucide Icons, Motion.
- **Backend**: Express, Node.js.
- **Database**: SQLite (Mặc định cho môi trường demo/phát triển).
- **AI**: Google Gemini API.
- **Integration**: Google Sheets API (OAuth2).

## 📦 Hướng dẫn triển khai (GitHub & Vercel)

### 1. Đưa lên GitHub

1. Tạo một repository mới trên GitHub.
2. Đẩy mã nguồn lên:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

### 2. Triển khai lên Vercel

1. Truy cập [Vercel](https://vercel.com) và kết nối với repository GitHub của bạn.
2. Cấu hình các **Environment Variables** (Biến môi trường) sau trong bảng điều khiển Vercel:
   - `GEMINI_API_KEY`: Khóa API từ Google AI Studio.
   - `CLIENT_ID`: Google OAuth Client ID.
   - `CLIENT_SECRET`: Google OAuth Client Secret.
   - `APP_URL`: URL của ứng dụng trên Vercel (ví dụ: `https://your-app.vercel.app`).

### ⚠️ Lưu ý quan trọng về Cơ sở dữ liệu

Ứng dụng hiện đang sử dụng **SQLite** (`database.sqlite`). Trên Vercel (Serverless), tệp tin này sẽ **không được lưu trữ vĩnh viễn** (dữ liệu sẽ bị mất khi serverless function khởi động lại).

**Để sử dụng lâu dài trên Vercel, bạn nên:**
- Sử dụng **Vercel Postgres** hoặc **Neon**.
- Hoặc sử dụng **Turso** (SQLite trên đám mây) để giữ nguyên cấu trúc code hiện tại nhưng có tính năng lưu trữ vĩnh viễn.

## 🔑 Tài khoản mặc định

- **Admin**: `admin` / `admin123`
- **Giáo viên**: Tên (không dấu) / Tên + 123 (ví dụ: `nam` / `nam123`)

## 📄 Giấy phép

Dự án này được phát triển cho mục đích giáo dục và quản lý nội bộ.
