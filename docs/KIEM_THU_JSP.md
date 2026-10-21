> Kết quả mới nhất sau audit và bản sửa đồng thời nằm ở [RA_SOAT_CUOI.md](RA_SOAT_CUOI.md). Các mã fixture trong JSON đã được cập nhật bằng lần chạy audit cuối.

# Kiểm tra bản JSP — 21/10/2026

Kiểm thử trên macOS ARM64, Docker Desktop, Tomcat 10.1/JDK 21, MySQL 8; mã nguồn Java target 17. Build Maven cục bộ bằng JDK 25 cũng thành công.

| Kiểm tra đã thực hiện | Kết quả |
| --- | --- |
| `mvn -f backend2/pom.xml clean package` | PASS, tạo WAR |
| `verify_seed_data.py` trước khi thao tác dữ liệu | PASS: 14 phụ tùng, 16 dịch vụ, 5 phiếu demo, 2 thợ |
| `verify_jsp_flow.py` qua form HTTP thật | PASS; xem `jsp-test-result.json` |
| `verify_servlet_flow.py` của repo gốc | PASS; xem `api-test-result.json` |
| `git diff --check` | PASS |
| Xem trực tiếp bằng trình duyệt | Trang chủ, đăng nhập, danh sách, form tiếp nhận; chữ tiếng Việt đúng, JSP render qua Tomcat |

## Nội dung test JSP

- Người chưa đăng nhập được đưa tới đăng nhập; form thiếu CSRF bị từ chối.
- Sai mật khẩu hiển thị ngay trên form và giữ số điện thoại.
- Quản lý mở kho, dịch vụ, báo cáo và danh sách; không được mở tiếp nhận dành cho thợ.
- Thợ không mở trang quản lý kho; chỉ xem phiếu mình tạo hoặc được phân công.
- Thêm phụ tùng, sửa tồn; thêm/sửa giá dịch vụ có vật tư.
- Sai số điện thoại khi tiếp nhận trả lỗi, giữ thông tin và dịch vụ đã chọn.
- Xem lại phiếu chưa ghi CSDL; xác nhận mới tạo. Xác nhận lại bản nháp đã dùng bị từ chối.
- Nhiều dịch vụ, số lượng và tổng tiền tính từ giá MySQL. Nội dung giống thẻ script được escape khi hiển thị.
- Phân công hiển thị số phiếu đang nhận; thợ nhận việc, lưu 100% từng công việc rồi mới hoàn thành.
- Hoàn thành chuyển chờ thanh toán và giảm tồn đúng số lượng đã dùng.
- Khách xin OTP demo, xác minh, chỉ thấy xe của mình; hóa đơn có VietQR đúng mã/số tiền.
- Khách báo chuyển khoản chỉ chuyển sang chờ đối soát. Quản lý xác nhận mới ghi PAID/COMPLETED.
- Đăng xuất hủy phiên, mở lại trang riêng cần đăng nhập.

Test nghiệp vụ cũ kiểm tra thêm: không tin giá từ client, snapshot hóa đơn không đổi khi sửa giá dịch vụ, chặn sửa checklist sai vai trò/sai người/sai hạng mục, chưa xong checklist không kết thúc được, trừ kho không lặp, thiếu kho rollback.

## Dữ liệu và phạm vi kiểm thử

Lượt đầu dùng project Docker `ltweb-jsp` (đã dừng); lượt audit cuối dùng project `ltweb-audit`, cấu hình `.env.audit.local`. Các file env được Git bỏ qua và volume giữ lại để đối chiếu. Có thể đối chiếu các mã phiếu ghi trong hai file JSON kết quả.

Bản để mở demo dùng project **`ltweb-gara`** độc lập với dữ liệu audit, giữ các phiếu mẫu và phiếu demo nhóm 4. Cấu hình chạy ở `.env.backend.local`. Không chạy lại test ghi lên bản demo nếu muốn giữ nguyên danh mục mẫu; chỉ test seed/read-only trên bản này khi bàn giao.

Chưa kiểm thử gửi Gmail thật, chuyển tiền thật, Windows hoặc trình duyệt di động thật. CSS có breakpoint cho màn hình hẹp, nhưng đó không phải bằng chứng đã test trên thiết bị di động. OTP đã được sửa đồng thời và kiểm tra hết hạn/giới hạn lần thử ở lượt audit cuối.
