# HiHiHaHa Auto — Java Servlet, JSP và MySQL

Đồ án quản lý gara với giao diện JSP trắng đen. Trình duyệt gửi form đến Servlet; Servlet kiểm tra quyền, đọc/ghi MySQL qua JDBC và hiển thị JSP. Chạy **một ứng dụng Tomcat**, không cần Node.js hay Next.js.

Mã nguồn làm việc nằm trong `LTWEB/LT_Web`. Các bài giảng gốc nằm cạnh dự án, ở `LTWEB/tham-khao`. Bản sửa giữ ba vai trò, tám bảng và các chức năng của repo gốc. [Phân công Khởi/Lợi/Tân/Kiệt theo từng form, endpoint và hàm xử lý](PHAN_CONG_CODE.md). [Luồng và bảng đối chiếu đầy đủ](docs/LUONG_NGHIEP_VU_JSP.md).

## Chạy nhanh

Cần Docker Desktop đang chạy:

```sh
cp .env.backend.example .env.backend.local
# Sửa MYSQL_ROOT_PASSWORD trong .env.backend.local.
./start_backend.sh
```

Mở [http://localhost:8089](http://localhost:8089). Script đọc `.env.backend.local` bằng Docker Compose, tạo MySQL, nạp schema/seed rồi build WAR và chạy Tomcat. `DEMO_MODE=true` hiện OTP thử ngay trên trang, không gửi email. Các cổng có thể đổi trong `.env.backend.local`. Nếu đã có volume MySQL, dùng lại mật khẩu của volume đó.

Trên máy đang thực hiện bản sửa, đã cấu hình riêng project Docker `ltweb-gara`, MySQL cổng `13307`, web cổng `8089`; mật khẩu cục bộ nằm trong file môi trường được Git bỏ qua. [Hướng dẫn Docker, Windows và Tomcat thủ công](HUONG_DAN_CHAY_THUC_TE.md).

## Vai trò và đường đi

| Vai trò | Công việc |
| --- | --- |
| Quản lý (`MANAGER`) | Xem phiếu; phân công người sửa; quản lý phụ tùng, tồn thực tế, dịch vụ và giá công; xem hiệu suất theo ngày; đối soát chuyển khoản và hoàn tất phiếu |
| Kỹ thuật viên kiêm tư vấn (`TECHNICIAN`) | Tiếp nhận xe; chọn nhiều dịch vụ và số lượng; xem lại chi phí; theo dõi phiếu mình tạo/được giao; bắt đầu, lưu tiến độ từng việc và kết thúc sửa chữa |
| Khách hàng (`CUSTOMER`) | Xác minh biển số + điện thoại bằng OTP email; chỉ xem phiếu của xe đã xác minh; xem tiến độ, chi tiết tiền công/vật tư, VietQR; báo đã chuyển khoản |

Luồng:

1. Kỹ thuật viên nhập thông tin khách/xe và chọn dịch vụ ở `/orders/new`.
2. Trang `/orders/review` hiển thị thông tin và tổng dự kiến. Có thể quay lại sửa; chưa ghi phiếu vào DB.
3. Xác nhận tiếp nhận mới tạo phiếu `RECEIVED`. Quản lý mở phiếu và phân công, thấy số phiếu mỗi thợ đang nhận.
4. Người được giao bắt đầu sửa; chọn rõ “Chưa làm / Đang làm / Đã xong” cho từng công việc rồi lưu.
5. Khi mọi việc đạt 100%, người sửa xác nhận hoàn thành. Hệ thống kiểm tra và trừ vật tư một lần trong transaction, chuyển `WAITING_PAYMENT`.
6. Khách xem hóa đơn và VietQR, chuyển khoản rồi báo gara. Hóa đơn chuyển `PENDING_VERIFICATION`.
7. Quản lý kiểm tra giao dịch thực, xác nhận đã nhận đủ tiền; hóa đơn `PAID`, phiếu `COMPLETED`, gara bàn giao xe.

Các trạng thái dữ liệu giữ nguyên repo: `RECEIVED → IN_PROGRESS → WAITING_PAYMENT → COMPLETED`; hóa đơn `UNPAID → PENDING_VERIFICATION → PAID`. Bàn giao được diễn đạt trong bước hoàn tất, **không có trạng thái bàn giao riêng**. Giữ VietQR/đối soát thủ công; chưa tích hợp VNPay.

## Tài khoản demo

Vào `/login/staff`, mật khẩu chung **123456**:

| Người dùng | Điện thoại |
| --- | --- |
| Quản lý | `0988888802` |
| Kỹ thuật viên An | `0988888803` |
| Kỹ thuật viên Bình | `0988888804` |

Khách vào `/login/customer`: `59A-12345` + `0901234567`, hoặc `51H-67890` + `0902345678`. [Chi tiết tài khoản và email thật](TAI_KHOAN_TEST.md).

## Đọc mã nguồn

- `backend2/src/main/webapp/WEB-INF/views`: JSP, JSTL/EL, form HTML; không truy vấn SQL trong JSP.
- `backend2/src/main/webapp/assets/style.css`: CSS trắng đen, có bố cục màn hình hẹp.
- `servlet/PageServlet.java`: chuẩn bị các trang và phiếu nháp.
- `servlet/WorkOrderServlet`, `AssignmentServlet`, `ProgressServlet`, `PaymentServlet`, `InventoryServlet`, `ServiceServlet`, `AuthServlet`: xử lý form theo nghiệp vụ hiện có.
- `servlet/WebFlow.java`: đọc giá trị form và chuyển trang sau khi lưu. Dùng chung nghiệp vụ với API JSON cũ; không gọi HTTP nội bộ, không để JSP gọi API.
- `dao/OrderDAO`, `StaffDAO`, `InventoryDAO`, `ServiceDAO`: truy vấn JDBC.
- `filter/WebSessionFilter`: phiên, quyền mở trang, mã CSRF cho form; `SessionAuthFilter` bảo vệ API cũ.
- `backend2/src/main/resources/database/init.sql`: tám bảng, dữ liệu mẫu; giữ schema gốc.

Tên nhân viên và quyền được lưu trong HttpSession. Không dùng localStorage để quyết định quyền. POST lưu thành công trả redirect 303 để refresh trang không gửi lại form; phiếu nháp có mã xác nhận riêng để chống tạo trùng và nhầm giữa hai tab.

`client2/` đã được loại khỏi bản JSP; giao diện Next.js cũ có thể xem ở commit nguồn `a141d3595f51beb67c05470de8f792aaee5fd4c0` trong lịch sử Git. Các báo cáo và bảng phân công cũ là tài liệu của phiên bản trước; tài liệu luồng mới ở `docs/` là căn cứ cho lần sửa này.

## Kiểm tra

```sh
mvn -f backend2/pom.xml clean package
# Khi stack audit riêng cổng 18089 đang chạy, DEMO_MODE=true:
python3 backend2/tests/verify_jsp_flow.py
python3 backend2/tests/verify_servlet_flow.py
python3 backend2/tests/verify_audit_edges.py
```

Test JSP gửi form thật qua HTTP, kiểm tra ba vai trò, bản nháp chưa ghi DB, chống xác nhận lặp, mã hóa tiếng Việt, escape nội dung, kho/dịch vụ, phân công, checklist, OTP và thanh toán. Test nghiệp vụ cũ kiểm tra thêm giá tính phía server, giá lịch sử, trừ kho một lần và thiếu hàng rollback. Các test HTTP ghi mặc định vào cổng audit 18089, tạo dữ liệu thử riêng và giữ để đối chiếu. [Cách dựng stack audit](HUONG_DAN_CHAY_THUC_TE.md), [kết quả rà soát cuối](docs/RA_SOAT_CUOI.md).

`verify_seed_data.py` dùng trước khi thay đổi các phiếu seed. `verify_otp_rules.py` cần một stack test riêng có TTL ngắn như hướng dẫn đầu file.
