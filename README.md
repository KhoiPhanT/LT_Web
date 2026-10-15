# HiHiHaHa Auto — đồ án Lập trình Web

Ứng dụng quản lý gara tinh gọn cho nhóm bốn người. Giao diện Next.js chuyển `/api/v1/*` tới **Java Servlet trên Tomcat**; Servlet dùng JDBC và 8 bảng MySQL. Mã `AppServer`, DAO/model cũ, các trang và thư viện không còn dùng đã được xóa khỏi dự án.

## Chức năng và vai trò

| Vai trò | Chức năng |
| --- | --- |
| Quản lý gara (`MANAGER`) | Phân công lệnh, quản lý kho và danh mục dịch vụ/giá công, xem hiệu suất kỹ thuật viên, đối soát VietQR |
| Kỹ thuật viên kiêm tư vấn (`TECHNICIAN`) | Tiếp nhận xe, chọn nhiều dịch vụ cho một xe, cập nhật checklist 0/50/100% và hoàn thành lệnh được giao |
| Khách hàng (`CUSTOMER`) | Xác minh biển số + số điện thoại bằng OTP email, xem lệnh, báo đã chuyển khoản |

Lệnh đi qua `RECEIVED → IN_PROGRESS → WAITING_PAYMENT → COMPLETED`. Hóa đơn đi qua `UNPAID → PENDING_VERIFICATION → PAID`. Dịch vụ có giá công riêng, có thể gắn vật tư mặc định hoặc chỉ có tiền công. Một xe có thể dùng nhiều dịch vụ trong một lệnh; Servlet lấy giá công và vật tư từ MySQL rồi lưu giá tại thời điểm lập lệnh. Khi mọi công việc đạt 100%, Servlet trừ phụ tùng một lần trong cùng giao dịch MySQL với chuyển trạng thái. Khách báo đã chuyển khoản không tự xác nhận `PAID`; quản lý đối soát thủ công. VNPay chưa tích hợp nên không có nút thanh toán giả.

## Chạy dự án

[Hướng dẫn chạy thực tế](HUONG_DAN_CHAY_THUC_TE.md) ghi các lệnh đã kiểm chứng trên máy hiện tại và kịch bản demo từ dữ liệu mẫu.

1. Cài Docker Desktop và Node.js. Sao chép `.env.backend.example` thành `.env.backend.local`, đặt `MYSQL_ROOT_PASSWORD`. Đặt `GMAIL_USER`/`GMAIL_APP_PASSWORD` để gửi email thật; `DEMO_MODE=true` chỉ để xem mã OTP thử nghiệm trên máy demo.
   Nếu đã có volume MySQL từ bản cũ, dùng lại mật khẩu root của volume đó; đổi biến môi trường không đổi mật khẩu bên trong volume.
2. macOS/Linux: `./start_backend.sh`; Windows: khai báo các biến môi trường rồi chạy `start_backend.bat`. Script khởi động MySQL, áp dụng `backend2/src/main/resources/database/init.sql` với UTF-8 rồi khởi động WAR trên Tomcat. Script SQL có thể chạy lại, sửa các tên seed từng bị lỗi mã hóa và không xóa CSDL cũ.
3. Chạy `./start_client.sh` (Windows: `start_client.bat`), mở `http://localhost:3001`. Health check: `http://localhost:8089/api/v1/health` phải trả `backend: servlet` và `database: mysql`.

MySQL demo là `hihihaha_simple_db`, cổng mặc định `3307` (máy đang kiểm thử dùng `13307` qua `MYSQL_HOST_PORT`). API Servlet mặc định dùng cổng `8089`, Web dùng cổng `3001`. Docker chỉ mở MySQL/API trên `127.0.0.1`. Có thể đổi `MYSQL_HOST_PORT`/`BACKEND_HOST_PORT` trong `.env.backend.local`; khi đổi cổng backend, sửa `INTERNAL_BACKEND_URL` của Next.js cho khớp.

Tài khoản và hồ sơ mẫu ở [TAI_KHOAN_TEST.md](TAI_KHOAN_TEST.md). Seed có 14 phụ tùng và 16 dịch vụ niêm yết, cùng 5 lệnh đủ các trạng thái; khách có thể dùng ngay biển số và số điện thoại mẫu để yêu cầu OTP khi `DEMO_MODE=true`. Schema và dữ liệu mẫu ở [init.sql](backend2/src/main/resources/database/init.sql). CSDL cũ `app_state` không được chuyển tự động và không bị script mới xóa.

## Bốn luồng trình bày

| Thành viên | Giao diện → Servlet → MySQL |
| --- | --- |
| Lợi | Đăng nhập/OTP và VietQR → `AuthServlet`, `PaymentServlet` → `customers`, `invoices` |
| Khởi | Tiếp nhận/phân công/báo cáo → `WorkOrderServlet`, `AssignmentServlet`, `ReportServlet` → `work_orders`, `work_order_items`, `vehicles` |
| Tân | Kho và dịch vụ niêm yết → `InventoryServlet`, `ServiceServlet`, `InventoryDAO`, `ServiceDAO` → `parts`, `services` |
| Kiệt | Bắt đầu/cập nhật checklist/hoàn thành lệnh → `ProgressServlet`, `InventoryDAO.deductForOrder` → trạng thái lệnh và tồn kho |

Mỗi file mới/viết lại ghi người phụ trách ở đầu file; file dùng chung ghi theo hàm hoặc khối chức năng. [Bảng phân công code](PHAN_CONG_CODE.md) liệt kê từng file và hàm. Kịch bản demo ở [KICH_BAN_THUYET_TRINH_DAY_DU.md](bao_cao/KICH_BAN_THUYET_TRINH_DAY_DU.md).
Nhãn “phụ trách” là phân công rà soát, hoàn thiện và trình bày module; nhóm cần cập nhật nhãn theo đóng góp thực tế trước khi nộp.

## Kiểm tra

- `cd backend2 && mvn package` để build WAR.
- `cd client2 && npm ci && npm run build` để build giao diện.
- Khi Tomcat/MySQL đang chạy: `python3 backend2/tests/verify_servlet_flow.py`. Test tạo dữ liệu riêng và kiểm tra phân quyền, giá tính phía server, trừ tồn một lần, thiếu hàng rollback, OTP, thanh toán và đối soát.
- Trước khi thao tác lệnh mẫu: `python3 backend2/tests/verify_seed_data.py` để kiểm tra dữ liệu ban đầu. Kết quả đã chạy ở [KIEM_TRA_LUU_DU_LIEU.md](KIEM_TRA_LUU_DU_LIEU.md).

Tất cả API trả JSON dạng `{ "success": true, "data": ... }`; lỗi trả HTTP `400/401/403/404/409/503` và `message`. Quyền được kiểm tra ở backend từ phiên Tomcat. Next.js giữ tên/role trong localStorage chỉ để hiển thị menu.
