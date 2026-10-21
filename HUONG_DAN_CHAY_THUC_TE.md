# Hướng dẫn chạy đầy đủ — Java Servlet + JSP

## 1. Lấy mã nguồn và yêu cầu

```sh
git clone https://github.com/KhoiPhanT/LT_Web.git
cd LT_Web
```

Nếu đã có project trên máy, vào đúng thư mục và cập nhật mã nguồn sau khi lưu công việc đang sửa. Bản làm việc tại máy hiện tại là `LTWEB/LT_Web`.

Cách Docker cần **Docker Desktop đang chạy**, có **Docker Compose v2** hỗ trợ `--wait`. Kiểm tra:

```sh
docker version
docker compose version
```

Docker build tự dùng Maven và JDK 21 trong image, phục vụ WAR bằng Tomcat 10.1 và MySQL 8. **Không cần Node.js, npm, Next.js, JDK hay Maven trên máy host nếu dùng Docker.** Python 3 chỉ cần khi chạy bộ kiểm thử HTTP, không cần để dùng web.

## 2. Cấu hình môi trường

macOS/Linux:

```sh
cp .env.backend.example .env.backend.local
```

Windows CMD:

```bat
copy .env.backend.example .env.backend.local
notepad .env.backend.local
```

Sửa file vừa tạo, ví dụ:

```dotenv
MYSQL_ROOT_PASSWORD='mat-khau-demo-rieng-cua-ban'
MYSQL_HOST_PORT=13307
BACKEND_HOST_PORT=8089
COMPOSE_PROJECT_NAME=ltweb-gara
GMAIL_USER=
GMAIL_APP_PASSWORD=
DEMO_MODE=true
```

| Biến | Ý nghĩa |
| --- | --- |
| MYSQL_ROOT_PASSWORD | Mật khẩu root của MySQL demo. Bắt buộc. Giữ nguyên mật khẩu của volume đang dùng; đổi file env không đổi mật khẩu trong DB đã tồn tại. |
| MYSQL_HOST_PORT | Cổng MySQL trên máy host; ví dụ 13307. Các container vẫn liên lạc bằng cổng 3306. |
| BACKEND_HOST_PORT | Cổng giao diện và API trên máy host; mặc định 8089. |
| COMPOSE_PROJECT_NAME | Tên bộ container/volume. Giữ ổn định để dùng lại đúng dữ liệu. |
| DEMO_MODE | true: hiện OTP thử trên trang, không gửi email. false: gửi SMTP thật và không trả mã OTP cho trình duyệt. |
| GMAIL_USER / GMAIL_APP_PASSWORD | Tài khoản Gmail và App Password để gửi OTP thật. Để trống khi demo. |
| OTP_TTL_MS | Tùy chọn, mặc định 300000 ms. TTL ngắn chỉ dùng ở stack test. |

Docker Compose đọc `.env.backend.local` trực tiếp; các script không `source`/thực thi file env. Có thể đặt giá trị mật khẩu trong nháy đơn để giữ ký tự `$`, khoảng trắng và `#` nguyên văn. File local đã được `.gitignore` bỏ qua. Biến cùng tên được export trong shell có thể ưu tiên hơn file env; bỏ biến cũ nếu cấu hình thực tế khác điều vừa sửa.

## 3. Khởi động

macOS/Linux:

```sh
chmod +x start_backend.sh
./start_backend.sh
```

Windows CMD:

```bat
start_backend.bat
```

Hai script đều đọc `.env.backend.local`, chờ MySQL healthy, nạp `backend2/src/main/resources/database/init.sql`, build WAR và chờ Tomcat healthy. Script in địa chỉ web theo cổng thực tế. Không mở file JSP trực tiếp bằng trình duyệt.

Với ví dụ trên:

- Giao diện: **http://localhost:8089/**
- Health: **http://localhost:8089/api/v1/health** — thành công có `backend: servlet`, `database: mysql` trong `data`.
- MySQL từ IDE: host `127.0.0.1`, port `13307`, DB `hihihaha_simple_db`, user `root`, mật khẩu trong file local.

`start_client.sh/.bat` chỉ in địa chỉ JSP đang chạy; không cần chạy một frontend riêng. `client2/` đã được loại khỏi bản JSP để tránh chạy nhầm frontend cũ; bản nguồn vẫn có trong lịch sử Git.

## 4. Tài khoản và kiểm tra nhanh

Nhân viên mở `/login/staff`, mật khẩu demo chung **123456**:

| Vai trò | Điện thoại |
| --- | --- |
| Quản lý | 0988888802 |
| Thợ An | 0988888803 |
| Thợ Bình | 0988888804 |

Khách mở `/login/customer`, dùng một trong hai hồ sơ:

| Biển số | Điện thoại |
| --- | --- |
| 59A-12345 | 0901234567 |
| 51H-67890 | 0902345678 |

Với `DEMO_MODE=true`, nhập mã mới hiện trên trang bước 2. Mã không cố định và chỉ dùng một lần. Giữ quá 5 phút hoặc nhập sai quá số lần thì cần yêu cầu mã mới theo hướng dẫn màn hình.

Kịch bản demo đầy đủ:

1. Quản lý mở Kho/Dịch vụ, kiểm tra tồn và danh mục.
2. Thợ An mở Tiếp nhận xe, nhập một khách/xe mới, chọn hai dịch vụ.
3. Xem lại chi phí, xác nhận; ghi mã phiếu.
4. Quản lý mở phiếu mới và phân công An.
5. An mở phiếu được giao, bắt đầu, lưu từng việc 50 rồi 100. Mọi việc 100% mới mở nút hoàn thành.
6. Hoàn thành sửa chữa; phiếu chờ thanh toán và vật tư được trừ một lần. Thiếu hàng thì lệnh giữ trạng thái cũ, quản lý xử lý tồn rồi thợ thử lại.
7. Khách xin OTP bằng đúng biển số/điện thoại vừa tiếp nhận, mở hóa đơn, báo chuyển khoản.
8. Quản lý đối soát và xác nhận nhận tiền; phiếu hoàn tất. Khi demo thuần dữ liệu, chỉ mô phỏng các trạng thái, không cần chuyển tiền thật.
9. Quản lý xem báo cáo hiệu suất theo ngày phân công.

Một browser profile chỉ có một phiên đăng nhập. Dùng các profile/trình duyệt riêng nếu muốn mở đồng thời quản lý, thợ và khách; mở thêm tab cùng profile vẫn chia sẻ cookie.

## 5. Dừng, khởi động lại, xem log

Các lệnh sau dùng được trong Bash, PowerShell và CMD:

```sh
docker compose --env-file .env.backend.local ps
docker compose --env-file .env.backend.local logs --tail=80 backend2_servlet
docker compose --env-file .env.backend.local logs --tail=80 mysql_db
docker compose --env-file .env.backend.local stop
```

Sửa Java/JSP/CSS rồi chạy lại `start_backend.sh` hoặc `start_backend.bat` để build và cập nhật. Dữ liệu nằm trong named volume MySQL, không nằm trong container Tomcat. Không cần sửa schema cho những bản sửa audit hiện tại.

SQL init có thể chạy lại, giữ phiếu và dữ liệu nghiệp vụ đang có. Giữ nguyên `COMPOSE_PROJECT_NAME` và volume để tiếp tục DB cũ. `docker compose down -v` xóa volume dữ liệu; không dùng lệnh đó khi muốn giữ bài demo.

## 6. Lỗi thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| Không kết nối được Docker | Mở Docker Desktop, chờ engine sẵn sàng; chạy lại `docker version`. |
| `unknown flag: --wait` | Docker Compose đang quá cũ; cập nhật bản Compose đi cùng Docker Desktop rồi thử lại. |
| Cổng đã có ứng dụng dùng | Đổi MYSQL_HOST_PORT hoặc BACKEND_HOST_PORT trong file local, chạy lại script; dùng địa chỉ script vừa in. |
| MySQL báo Access denied sau khi đổi mật khẩu env | Dùng lại mật khẩu thật của volume. Không xóa volume để sửa lỗi nếu cần giữ dữ liệu. |
| Truy cập web bị connection refused | Kiểm tra `ps` và log Tomcat; chờ script báo healthy. |
| Trang báo CSDL chưa sẵn sàng | Kiểm tra MySQL healthy và mật khẩu; xem log backend. JDBC có timeout để request không chờ vô hạn. |
| Không thấy menu/chức năng mong muốn | Kiểm tra vai trò đang đăng nhập; dùng logout rồi đăng nhập lại đúng tài khoản. |
| Phiếu đã thanh toán biến mất khỏi danh sách | Danh sách mặc định chỉ hiện đang xử lý; chọn “Đã hoàn tất” hoặc “Tất cả”. |
| Lưu tồn bị báo đã thay đổi | Có thao tác khác đã đổi tồn từ khi mở trang. Tải lại kho và đối chiếu rồi lưu lại; đây là cơ chế tránh ghi đè số lượng mới. |
| Xác nhận phiếu bị báo giá/định mức đổi | Quay lại tiếp nhận, bấm xem lại để đọc giá hiện tại và xác nhận lại với khách. |
| Hai tab nhập hai phiếu nháp | Một session giữ một nháp mới nhất. Trang xác nhận cũ sẽ bị từ chối; dùng session riêng hoặc làm lần lượt. |
| QR không tải được | Ảnh cần Internet; số tài khoản, số tiền, nội dung vẫn hiện bằng chữ. |
| Tiếng Việt lỗi / JSP không compile trong IDE | Dùng UTF-8, Jakarta Servlet 6/JSTL 3, Tomcat 10.1; không dùng Tomcat 9/`javax.servlet`. |

## 7. Chạy qua IDE/Tomcat thủ công

Cần **JDK 17 trở lên**, Maven, **Tomcat 10.1**, MySQL 8. Nạp file `backend2/src/main/resources/database/init.sql` bằng MySQL client/IDE với UTF-8. Sau đó cấu hình môi trường của tiến trình Tomcat:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=13307
DB_NAME=hihihaha_simple_db
DB_USER=root
DB_PASSWORD=mat-khau-cua-mysql-demo
DEMO_MODE=true
```

Đây là các biến môi trường của tiến trình, không phải file Java tự đọc. Trong IntelliJ/NetBeans, đặt chúng trong Run Configuration/Server environment của Tomcat; trong terminal Bash có thể dùng `export DB_HOST=...`, CMD dùng `set DB_HOST=...`, PowerShell dùng `$env:DB_HOST="..."`.

Build:

```sh
mvn -f backend2/pom.xml clean package
```

WAR tạo tại `backend2/target/backend2.war`. Deploy vào `webapps` của Tomcat:

- Tên `backend2.war`: mở `http://localhost:8080/backend2/`.
- Tên `ROOT.war`: mở `http://localhost:8080/`.

Port 8080 là ví dụ cho Tomcat thủ công, khác port 8089 của Docker. Các form/link/CSS dùng context path của ứng dụng. `DBContext` đặt session MySQL UTC+7; báo cáo lấy ngày Việt Nam để không lệch ngày khi server chạy UTC. Build dùng `--release 17`; Docker thực thi bằng JDK 21.

## 8. Email thật và thanh toán

Để gửi OTP thật: sửa `DEMO_MODE=false`, điền `GMAIL_USER` và `GMAIL_APP_PASSWORD` rồi recreate Tomcat bằng script chạy. Dùng App Password Gmail, không dùng mật khẩu tài khoản thường. Hồ sơ khách phải có email thật; seed `example.com` chỉ dùng demo. SMTP có kiểm tra hostname TLS và không nhận email chứa ký tự xuống dòng. Lần audit này không gửi thư thật vì chưa có tài khoản Gmail để xác minh.

VietQR giữ tài khoản MB `0797526990` từ repo nguồn. QR chỉ hỗ trợ nhập thông tin chuyển khoản; ứng dụng không kết nối ngân hàng để xác minh tiền. Quản lý đối soát thủ công. Chưa tích hợp VNPay, tiền mặt hoặc hoàn tiền.

## 9. Kiểm thử trên stack riêng

Unit test không cần DB:

```sh
mvn -f backend2/pom.xml test
```

Để tránh thêm dữ liệu test vào bài demo, tạo `.env.audit.local` theo mẫu nhưng dùng:

```dotenv
MYSQL_ROOT_PASSWORD='mat-khau-test-rieng'
MYSQL_HOST_PORT=13317
BACKEND_HOST_PORT=18089
COMPOSE_PROJECT_NAME=ltweb-audit
DEMO_MODE=true
```

Khởi động và nạp schema riêng:

```sh
docker compose --env-file .env.audit.local up -d --wait mysql_db
```

Bash:

```sh
docker compose --env-file .env.audit.local exec -T mysql_db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 -uroot' < backend2/src/main/resources/database/init.sql
```

CMD (đường dẫn Windows):

```bat
docker compose --env-file .env.audit.local exec -T mysql_db sh -c "MYSQL_PWD=$MYSQL_ROOT_PASSWORD mysql --default-character-set=utf8mb4 -uroot" < backend2\src\main\resources\database\init.sql
```

PowerShell có thể dùng `cmd /c` để thực thi đúng dòng CMD có chuyển hướng `<`. Sau đó:

```sh
docker compose --env-file .env.audit.local up -d --build --wait backend2_servlet
```

Chạy test HTTP với Python 3. Ví dụ Bash:

```sh
GARA_WEB_BASE=http://127.0.0.1:18089 python3 backend2/tests/verify_jsp_flow.py
GARA_WEB_BASE=http://127.0.0.1:18089 python3 backend2/tests/verify_audit_edges.py
GARA_API_BASE=http://127.0.0.1:18089/api/v1 python3 backend2/tests/verify_servlet_flow.py
```

CMD dùng `set GARA_WEB_BASE=http://127.0.0.1:18089`, `set GARA_API_BASE=http://127.0.0.1:18089/api/v1` rồi chạy từng file Python. PowerShell dùng `$env:GARA_WEB_BASE="http://127.0.0.1:18089"`, tương tự GARA_API_BASE.

`verify_seed_data.py` chỉ dùng trước khi thay đổi phiếu mẫu. Test JSP/API/audit tạo fixture riêng và giữ lại; không chạy trên DB cần giữ nguyên danh mục. Test TTL ngắn `verify_otp_rules.py` cần cấu hình OTP_TTL_MS=1200 cho cả container audit và shell chạy test, recreate Tomcat trước khi chạy; không đổi TTL của bản demo chính. Xem kết quả và phạm vi đã kiểm tra ở `docs/KIEM_THU_JSP.md` và `docs/RA_SOAT_CUOI.md`.
