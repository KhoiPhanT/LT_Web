# Kịch bản trình bày bản Servlet tinh gọn

Trước buổi demo: chạy `./start_backend.sh`, `./start_client.sh`, mở `/api/v1/health` để xác nhận `backend: servlet`. Bật `DEMO_MODE=true` nếu chưa cấu hình Gmail thử nghiệm. Dùng một biển số, số điện thoại và email demo mới; không dùng dữ liệu cá nhân thật.

## 1. Tân — kho phụ tùng

Đăng nhập quản lý ở `/staff/login`, mở `/manager/inventory`. Thêm phụ tùng với giá vật tư và tồn kho 2, sau đó tạo dịch vụ gắn phụ tùng đó với giá công niêm yết và một dịch vụ chỉ có tiền công. Xem `POST /api/v1/inventory`, `POST /api/v1/services`; mở `InventoryServlet`, `ServiceServlet`, hai DAO và các bảng `parts`, `services` trong MySQL. Giải thích rằng kỹ thuật viên chỉ được xem kho, không sửa tồn.

## 2. Khởi — tiếp nhận và phân công

Đăng nhập kỹ thuật viên, mở `/technician/create-order`. Nhập xe/khách/email và chọn dịch vụ gắn phụ tùng Tân vừa tạo và dịch vụ chỉ có tiền công trong cùng một lệnh; xem tổng tiền của cả hai. Gửi một lần, ghi mã lệnh do `POST /api/v1/work-orders` trả về. Chỉ `WorkOrderServlet` tính lại giá của từng dịch vụ và phụ tùng từ CSDL và tạo lệnh/hóa đơn trong giao dịch. Đăng nhập quản lý, mở `/manager`, phân công lệnh vừa tạo; chỉ `PATCH /api/v1/assignments/{code}` và `AssignmentServlet`. Trang này còn hiển thị số lệnh giao, sửa xong, tỷ lệ hoàn thành lấy từ `ReportServlet`, không dùng điểm giả.

## 3. Kiệt — tiến độ và trừ tồn

Đăng nhập đúng kỹ thuật viên được phân công, mở `/technician`, bấm **Bắt đầu**, cập nhật công việc 0% → 50% → 100%, rồi **Hoàn thành sửa chữa**. Trước 100%, nút hoàn thành bị khóa và API trả `409`. Chỉ các request `POST /api/v1/progress/{code}/start`, `PATCH /api/v1/progress/{code}/items/{itemId}` và `POST /api/v1/progress/{code}/finish`, `ProgressServlet` và `InventoryDAO.deductForOrder`. Quay lại kho kiểm tra tồn giảm từ 2 xuống 0. Bấm hoàn thành lại: API trả `409`, tồn không giảm thêm. Nếu thiếu tồn, giao dịch rollback và lệnh vẫn đang sửa.

## 4. Lợi — OTP và thanh toán

Khách mở `/login`, nhập đúng biển số/số điện thoại của lệnh, yêu cầu OTP. Mã được gửi vào email đã lưu; chế độ demo có mã mới sinh hiển thị. Chỉ `AuthServlet` kiểm tra cặp định danh và phiên khách. Khách mở `/customer/payment/{code}`, xem tổng tiền và VietQR, bấm **Đã chuyển khoản**; trạng thái thành `PENDING_VERIFICATION`. Đăng nhập quản lý, bấm **Xác nhận đã nhận tiền** để chuyển `PAID` và lệnh thành `COMPLETED`. Chỉ `PaymentServlet`: khách không thể tự gọi thao tác xác nhận.

## Kết thúc

Cả nhóm chỉ rõ đường đi frontend → Servlet → DAO/JDBC → MySQL. Script demo chạy WAR trên Tomcat. Khởi động lại backend và tải lại lệnh để cho thấy dữ liệu nằm trong MySQL.
