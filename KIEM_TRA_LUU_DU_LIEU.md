> Tài liệu phiên bản trước khi chuyển JSP. Luồng và mã nguồn bổ sung của lần sửa 21/10/2026 xem [LUONG_NGHIEP_VU_JSP](docs/LUONG_NGHIEP_VU_JSP.md), cách chạy xem [README](README.md).

# Kiểm tra lưu dữ liệu của bản Servlet/MySQL

**Phụ trách kiểm tra:** Lợi (quyền, OTP, thanh toán), Khởi (lệnh, phân công, báo cáo), Tân (kho), Kiệt (tiến độ). Kiểm thử `AppServer` cũ đã được loại khỏi dự án.

## Môi trường đã chạy ngày 14/10/2026

- Docker Desktop 29.2.1; Tomcat 10.1.61 + JDK 21; MySQL 8.0.46.
- Next.js 14.2.15 tại `http://localhost:3001`, Tomcat tại `http://localhost:8089`, MySQL Docker tại `127.0.0.1:13307` trên máy này.
- `DEMO_MODE=true` để mã OTP được hiện cho lớp học. Email ví dụ trong seed không nhận thư thật.

## Kết quả

| Kiểm tra | Kết quả |
| --- | --- |
| `mvn clean package`, `npm run build`, `git diff --check` | Đạt |
| Docker build và `GET /api/v1/health` trên Tomcat | Đạt (`backend=servlet`, `database=mysql`) |
| Seed SQL chạy lần đầu và lần hai | Đạt; 3 nhân viên, 2 khách, 2 xe, 6 phụ tùng, 5 lệnh, 10 hạng mục, 5 hóa đơn; không nhân đôi dữ liệu |
| 5 lệnh có tổng tiền bằng tổng hạng mục và trạng thái/hóa đơn phù hợp | Đạt |
| `verify_seed_data.py` qua Servlet | Đạt; đọc đủ kho, lệnh mẫu, báo cáo và quyền của thợ |
| `verify_servlet_flow.py` qua Tomcat Docker trên database kiểm thử riêng | Đạt; quyền `401/403`, giá tính phía server, phân công, bắt đầu/hoàn thành, trừ kho một lần, thiếu hàng rollback, OTP sai/đúng, khách bị chặn xem lệnh người khác, báo và đối soát thanh toán |
| `verify_otp_rules.py` trên Docker project riêng với `OTP_TTL_MS=1200` | Đạt; mã hết hạn bị từ chối và sau 5 lần nhập sai bị khóa |
| Dừng và khởi động lại cả MySQL lẫn Tomcat trong môi trường kiểm thử | Đạt; lệnh đã `PAID` và lệnh thiếu hàng vẫn giữ đúng trạng thái |
| Next.js `/api/v1` proxy, 8 trang và cookie đăng nhập | Đạt trên `3001 → 8089` |
| Ràng buộc MySQL `chk_parts_price`, `chk_parts_stock`, `chk_item_quantity` | Có trong database Docker mới |

Kiểm thử luồng đầy đủ tạo dữ liệu ngẫu nhiên, nên đã chạy trên Docker project `ltweb_demo_verify` có volume riêng rồi xóa volume kiểm thử. Database demo thuộc project `lt_web` chỉ có dữ liệu mẫu ban đầu và được giữ trong volume khi dừng dịch vụ.

## Chạy lại

Từ thư mục gốc `LT_WEB`, sau khi `./start_backend.sh` hoàn tất:

```bash
python3 backend2/tests/verify_seed_data.py
```

`verify_seed_data.py` chỉ đọc dữ liệu. `verify_servlet_flow.py` tạo lệnh và phụ tùng kiểm thử, nên hãy chạy trên database thử riêng nếu cần giữ database demo sạch. Seed mẫu nằm trong `backend2/src/main/resources/database/init.sql` và được `start_backend.sh` nạp tự động.

`verify_otp_rules.py` chỉ dùng trên Docker project kiểm thử riêng với `DEMO_MODE=true`, `OTP_TTL_MS=1200` và `GARA_API_BASE` trỏ đúng cổng thử; không chạy trực tiếp trên môi trường demo mặc định 5 phút.

**Chưa kiểm thử SMTP Gmail thật:** kiểm thử OTP dùng `DEMO_MODE=true`. Với chế độ thật, cần email khách hợp lệ và `GMAIL_USER`/`GMAIL_APP_PASSWORD` hoạt động.
