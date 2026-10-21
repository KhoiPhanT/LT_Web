# Chạy trên domain cũ bằng Cloudflare Tunnel

Đã cập nhật ngày 21/10/2026 trên máy Khởi.

- Website: https://hihihahajv.quachtailoi.id.vn
- API cùng origin: https://hihihahajv.quachtailoi.id.vn/api/v1/health
- Luồng: HTTPS → Cloudflare Tunnel → http://127.0.0.1:8089 → Tomcat (JSP + Servlet) → MySQL Docker.
- Không cần chạy Next.js/cổng 3001. Các form JSP gửi đến `/actions/...` trên cùng domain, cookie phiên dùng cùng origin.

## Cấu hình đang sử dụng

File thật trên máy: `/Users/phanthienkhoi/config.yaml`. Đã sao lưu trước sửa tại `/Users/phanthienkhoi/config.yaml.backup-20261021-144514`.
Chỉ đổi service của tuyến giao diện từ `http://127.0.0.1:3001` thành `http://127.0.0.1:8089`; giữ nguyên tunnel, credentials, tuyến API và SSH cũ.
Không đưa file credentials, certificate hay token vào Git.

Phần ingress của hostname chính:

```yaml
ingress:
  - hostname: hihihahajv.quachtailoi.id.vn
    path: ^/api/v1(/.*)?$
    service: http://127.0.0.1:8089
  - hostname: hihihahajv.quachtailoi.id.vn
    service: http://127.0.0.1:8089
  # Giữ các tuyến có sẵn khác và tuyến cuối http_status:404 trong file thật.
```

## Khởi động lại

Mở Docker Desktop, sau đó:

```bash
cd /Users/phanthienkhoi/Documents/test/LTWEB/LT_Web
./start_backend.sh
cloudflared tunnel --config /Users/phanthienkhoi/config.yaml ingress validate
```

Tunnel hiện chạy trong tmux `hihihaha-web:2.0`. Khi tiến trình đó vẫn chạy, không cần mở thêm tunnel. Nếu đã dừng, chạy ở terminal riêng:

```bash
cloudflared tunnel --config /Users/phanthienkhoi/config.yaml run
```

Sau khi sửa cấu hình, khởi động lại tiến trình cloudflared để áp dụng. Các thông số Docker trong `.env.backend.local` hiện chọn project `ltweb-gara`, backend cổng 8089, MySQL cổng 13307; không dùng file env audit/test cho domain này.

## Xác nhận triển khai

- Ingress validate: OK.
- Trang chủ, CSS, API health trên hostname chính: HTTP 200.
- Đăng nhập quản lý qua HTTPS và mở danh sách phiếu bằng trình duyệt: thành công.
- Truy cập `/orders` khi chưa đăng nhập: chuyển hướng tương đối `/login/staff`, giữ HTTPS.
- Hostname API phụ cũ `api.hihihahajv.quachtailoi.id.vn` hiện lỗi TLS handshake ở Cloudflare; giữ nguyên cấu hình đó, ứng dụng JSP dùng API cùng hostname chính nên không phụ thuộc hostname phụ.

Đây là host từ máy cá nhân: máy cần bật, có mạng, Docker và cloudflared cần chạy. Cấu hình hiện là bản demo của môn học (`DEMO_MODE=true`, tài khoản mẫu, OTP demo hiển thị); không dùng dữ liệu khách thật. Xem hướng dẫn chạy đầy đủ tại `../HUONG_DAN_CHAY_THUC_TE.md`.
