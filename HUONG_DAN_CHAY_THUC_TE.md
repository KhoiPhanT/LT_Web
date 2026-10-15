# Hướng dẫn chạy và demo bản Java Servlet

Các bước dưới đây đã được kiểm thử trên máy macOS của dự án ngày 14/10/2026. Cấu hình dùng Next.js `3001` → Tomcat `8089` → MySQL Docker `13307`. MySQL cục bộ đang chiếm cổng `3307`, nên `.env.backend.local` trên máy này đặt `MYSQL_HOST_PORT=13307`. Tệp này được Git bỏ qua và không chứa trong bản nộp.

Sau đợt dọn mã, các tiến trình của LT_WEB đã được dừng. Volume Docker `lt_web_mysql_ltweb_data` còn nguyên 5 lệnh mẫu; chạy hai script ở mục 2 để bắt đầu lại.

## 1. Chuẩn bị lần đầu

Cài Docker Desktop và Node.js. Từ thư mục gốc `LT_WEB`:

```bash
cp .env.backend.example .env.backend.local
```

Mở `.env.backend.local`, đặt `MYSQL_ROOT_PASSWORD` riêng cho máy của bạn. Giữ `DEMO_MODE=true` để thử OTP bằng mã hiện trên trang. Nếu cổng `3307` đã được dùng, đặt `MYSQL_HOST_PORT=13307` như máy đang kiểm thử. Nếu cổng `8089` đã được dùng, chọn `BACKEND_HOST_PORT` khác **và** sửa `INTERNAL_BACKEND_URL` trong `client2/.env.local` cho cùng cổng. Có thể để trống `GMAIL_USER` và `GMAIL_APP_PASSWORD` khi dùng demo OTP. Với email thật, đặt `DEMO_MODE=false`, dùng tài khoản Gmail/app password hợp lệ và đổi email khách mẫu thành địa chỉ nhận thư thật.

Cài dependency của Next.js nếu chưa có:

```bash
cd client2 && npm ci && cd ..
```

## 2. Khởi động

Mở Docker Desktop, rồi chạy ở thư mục gốc:

```bash
./start_backend.sh
```

Script tự khởi động MySQL, nạp schema và dữ liệu mẫu từ `backend2/src/main/resources/database/init.sql` bằng UTF-8, sửa tên tiếng Việt của các dòng seed từng bị nạp sai mã hóa, build WAR và đợi Tomcat health check đạt. Việc nạp lại không ghi đè tồn kho hoặc lệnh đã tạo. Mở terminal khác:

```bash
./start_client.sh
```

Vào [http://localhost:3001](http://localhost:3001). Có thể kiểm tra API ở [http://localhost:8089/api/v1/health](http://localhost:8089/api/v1/health); kết quả cần có `backend: servlet` và `database: mysql`. Hai lệnh khởi động trên đã được kiểm tra với dữ liệu mẫu thật.

## 3. Dữ liệu đã có sẵn

| Loại | Dữ liệu |
| --- | --- |
| Nhân viên | 1 quản lý, 2 kỹ thuật viên; mật khẩu demo chung `123456` |
| Khách và xe | Minh Anh `0901234567` / `59A-12345`; Quốc Nam `0902345678` / `51H-67890` |
| Kho và dịch vụ | 14 phụ tùng, 16 dịch vụ; hai dịch vụ chỉ có tiền công |
| Lệnh | `DEMO-001` chưa phân công; `DEMO-002` đang sửa; `DEMO-003` chờ khách báo chuyển khoản; `DEMO-004` đã thanh toán; `DEMO-005` chờ quản lý đối soát |
| Hóa đơn | 3 `UNPAID`, 1 `PENDING_VERIFICATION`, 1 `PAID` |

Tài khoản nhân viên chi tiết ở `TAI_KHOAN_TEST.md`. Khách đăng nhập tại `/login` bằng số điện thoại và biển số tương ứng. Với `DEMO_MODE=true`, mã OTP mới sinh được hiện trên trang; không có mã cố định.

## 4. Trình diễn bốn luồng

1. **Tân:** đăng nhập quản lý `0988888802` / `123456`, mở `/manager/inventory`, xem 14 phụ tùng và 16 dịch vụ, thêm phụ tùng, thêm dịch vụ có hoặc không có vật tư, chỉnh tồn và giá công.
2. **Khởi:** đăng nhập kỹ thuật viên `0988888803` / `123456`, mở `/technician/create-order`, tạo lệnh cho một biển số và số điện thoại mới, chọn ít nhất hai dịch vụ (ví dụ thay dầu và kiểm tra tổng quát). Sau đó đăng nhập quản lý tại `/manager` và phân công lệnh cho kỹ thuật viên An.
3. **Kiệt:** đăng nhập kỹ thuật viên An, mở `/technician`, bấm **Bắt đầu**, cập nhật từng công việc từ 0% → 50% → 100%, rồi **Hoàn thành sửa chữa**. Tồn phụ tùng giảm một lần; gọi hoàn thành lần nữa bị từ chối.
4. **Lợi:** vào `/login` với biển số/số điện thoại của lệnh vừa tạo, xác minh OTP, xem lệnh và trang VietQR, bấm **Đã chuyển khoản**. Đăng nhập quản lý, bấm **Xác nhận đã nhận tiền** để lệnh thành `COMPLETED` và hóa đơn thành `PAID`.

Nếu chỉ muốn thao tác trên dữ liệu mẫu, quản lý có thể phân công `DEMO-001`; kỹ thuật viên An có thể cập nhật checklist rồi hoàn thành `DEMO-002`; khách Minh Anh có thể báo chuyển khoản cho `DEMO-003`; quản lý có thể đối soát `DEMO-005`. Các thao tác này thay đổi trạng thái thật trong MySQL. Chạy lại `start_backend.sh` sẽ **giữ** thay đổi đó, không đưa lệnh về trạng thái ban đầu.

## 5. Kiểm tra và dừng

```bash
python3 backend2/tests/verify_seed_data.py
```

Lệnh trên chỉ đọc dữ liệu mẫu và phù hợp trước khi demo. Sau khi đã thao tác thay đổi trạng thái lệnh mẫu, một số assertion trạng thái ban đầu sẽ không còn đúng. Kiểm tra chi tiết đã thực hiện ở `KIEM_TRA_LUU_DU_LIEU.md`.

Dừng Next.js bằng `Ctrl+C` tại terminal của `start_client.sh`. Dừng Docker mà **giữ dữ liệu**:

```bash
set -a; source .env.backend.local; set +a
docker compose down
```

Không thêm `-v` nếu muốn giữ volume MySQL. Khi khởi động lại bằng `./start_backend.sh`, dữ liệu và trạng thái trước đó vẫn còn.
