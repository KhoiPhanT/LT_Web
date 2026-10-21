> Tài liệu phiên bản trước khi chuyển JSP. Luồng và mã nguồn bổ sung của lần sửa 21/10/2026 xem [LUONG_NGHIEP_VU_JSP](docs/LUONG_NGHIEP_VU_JSP.md), cách chạy xem [README](README.md).

# Rà soát vận hành bản Servlet tinh gọn

Bản chạy hiện tại là Next.js → Tomcat/Jakarta Servlet → MySQL 8 bảng quan hệ. `AppServer` và các DAO/model cũ đã được xóa khỏi dự án; không nằm trong WAR.

## Đã xử lý qua chạy thực tế

- `DBContext` nạp MySQL JDBC driver trong classloader của Tomcat. Trước sửa, Docker Tomcat trả `503` với lỗi `No suitable driver found`; sau sửa, health và API đều trả dữ liệu MySQL thật.
- `start_backend.sh` chờ MySQL và health check Tomcat rồi mới báo API sẵn sàng.
- Seed SQL tạo hồ sơ khách, xe, kho, lệnh và hóa đơn mẫu ở mọi trạng thái chính; chạy lại không nhân đôi và không xóa dữ liệu đang có.
- Luồng Servlet kiểm tra quyền theo HttpSession, giá phụ tùng từ MySQL, giao dịch trừ kho đúng một lần và đối soát VietQR bởi quản lý.
- OTP hết hạn và giới hạn 5 lần nhập sai được kiểm chứng trên Docker project riêng với thời hạn rút ngắn; mặc định vẫn 5 phút.
- Mã Java và kiểm thử snapshot cũ, trang/asset/thư viện không còn dùng đã được dọn khỏi dự án.

Kết quả kiểm thử chi tiết ở `KIEM_TRA_LUU_DU_LIEU.md`. Cách chạy và trình diễn thực tế ở `HUONG_DAN_CHAY_THUC_TE.md`.
