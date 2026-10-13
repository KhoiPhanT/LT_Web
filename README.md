# LT_WEB - HỆ THỐNG QUẢN LÝ GARA SỬA XE (HIHIHAHA AUTO)

Dự án môn Lập trình Web được tách biệt và tối ưu hóa theo mô hình RESTful CRUD:
- **Client 2:** Next.js 14 App Router (Tailwind CSS, Radix UI, TypeScript).
- **Backend 2:** Java Servlet + MySQL (Kiến trúc đơn giản, hỗ trợ cả Apache Tomcat và Standalone Java HTTP Server không cần cài đặt phức tạp).
- **GitHub Repository:** [https://github.com/TaiLoiZzzz/LT_WEB.git](https://github.com/TaiLoiZzzz/LT_WEB.git)

---

## 1. Cấu trúc thư mục

```text
LT_WEB/
├── client2/              # Giao diện Frontend Next.js 14
├── backend2/             # Backend Java Servlet + MySQL
│   ├── src/main/java/    # Mã nguồn Java (AppServer, Servlets, DAOs, Models)
│   ├── src/main/resources/database/init.sql  # Script tạo 8 bảng CSDL & dữ liệu mẫu
│   └── pom.xml           # Cấu hình Maven
├── DATABASE_ERD.puml     # Mã nguồn PlantUML Database ERD (Physical schema)
├── ENTITY_DIAGRAM.puml   # Mã nguồn PlantUML Conceptual Entity Diagram (Nghiệp vụ)
├── start_backend.bat     # Script 1-click khởi chạy Backend 2 (Port 8088)
└── start_client.bat      # Script 1-click khởi chạy Frontend Client 2 (Port 3000)
```

---

## 2. Hướng dẫn chạy nhanh (1-Click)

1. **Khởi chạy Backend (Port 8088):**
   - Click đúp vào file `start_backend.bat` hoặc mở terminal:
     ```bash
     .\start_backend.bat
     ```
2. **Khởi chạy Frontend (Port 3000):**
   - Click đúp vào file `start_client.bat` hoặc mở terminal:
     ```bash
     .\start_client.bat
     ```
3. Mở trình duyệt truy cập: `http://localhost:3000`

---

## 3. Tài khoản đăng nhập kiểm thử

| Vai trò | Tên đăng nhập | Mật khẩu | Mã PIN KTV | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **Cố vấn dịch vụ** | `advisor` | `123456` | `1111` | Tiếp nhận xe, lập báo giá |
| **Kỹ thuật viên 1** | `tech1` | `123456` | `2222` | Thực hiện checklist sửa chữa |
| **Kỹ thuật viên 2** | `tech2` | `123456` | `3333` | Thực hiện checklist sửa chữa |
| **Quản lý xưởng** | `manager` | `123456` | `4444` | Điều phối Kanban, phân khoang |
| **Giám đốc / Chủ** | `owner` | `123456` | `5555` | Báo cáo doanh thu xưởng |

---

## 4. Sơ đồ thiết kế (PlantUML)
- **Database ERD (Physical Schema):** Xem tại file `DATABASE_ERD.puml`.
- **Thực thể nghiệp vụ (Conceptual Entity):** Xem tại file `ENTITY_DIAGRAM.puml`.
