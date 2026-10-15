# Tài khoản demo của bản Servlet

| Vai trò | Số điện thoại | Mật khẩu | Trang |
| --- | --- | --- | --- |
| Quản lý gara | `0988888802` | `123456` | `/manager` |
| Kỹ thuật viên An | `0988888803` | `123456` | `/technician` |
| Kỹ thuật viên Bình | `0988888804` | `123456` | `/technician` |

Đây là tài khoản mẫu trong `hihihaha_simple_db`, mật khẩu lưu dạng BCrypt. Không dùng thông tin này khi triển khai công khai.

Khách hàng mẫu có sẵn:

| Tên | Số điện thoại | Biển số | Lệnh có thể xem |
| --- | --- | --- | --- |
| Nguyễn Minh Anh | `0901234567` | `59A-12345` | `DEMO-001`, `DEMO-003` |
| Trần Quốc Nam | `0902345678` | `51H-67890` | `DEMO-002`, `DEMO-004`, `DEMO-005` |

Khách không có mật khẩu: dùng biển số + số điện thoại ở `/login`. Với `DEMO_MODE=true`, mã OTP mới sinh được hiện trên trang để trình diễn; chế độ thường gửi mã vào email đã lưu và không trả mã trong API. Email seed là địa chỉ ví dụ, cần đổi thành email thật khi tắt demo mode. Không có mã OTP cố định.
