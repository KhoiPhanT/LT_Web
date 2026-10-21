# Phân công bốn người — bản Java Servlet + JSP

Mỗi người phụ trách một nhóm nghiệp vụ từ giao diện, xử lý Servlet, truy vấn CSDL đến kiểm tra kết quả. Đây là phân công rà soát, hoàn thiện và trình bày cho bản JSP; không phải xác nhận tác giả lịch sử của các file trong repo.

## Tổng quan

| Thành viên | Luồng phụ trách | Vai trò sử dụng |
| --- | --- | --- |
| **Khởi** | Tiếp nhận xe → xem lại chi phí → tạo phiếu → quản lý phân công | Kỹ thuật viên kiêm tư vấn, quản lý |
| **Lợi** | Đăng nhập/OTP → khách tra cứu phiếu → xem hóa đơn/VietQR → báo chuyển khoản → quản lý đối soát | Nhân viên, khách hàng, quản lý |
| **Tân** | Quản lý phụ tùng → cập nhật tồn → tạo/sửa dịch vụ và định mức → cung cấp danh mục cho tiếp nhận | Quản lý; thợ tra dịch vụ khi tiếp nhận |
| **Kiệt** | Nhận việc → bắt đầu sửa → lưu tiến độ từng việc → hoàn thành/trừ kho → xem hiệu suất thợ | Kỹ thuật viên được giao, quản lý |

## 1. Khởi — Tiếp nhận và phân công

**Luồng demo:** đăng nhập thợ → tiếp nhận khách/xe → chọn nhiều dịch vụ và số lượng → xem lại thông tin/tổng dự kiến → sửa lại hoặc xác nhận → quản lý tìm phiếu → phân công người sửa.

- **FE:** `intake.jsp`, `review.jsp`, `orders.jsp`; phần thông tin khách/xe và form phân công trong `detail.jsp`.
- **BE:** `PageServlet` xử lý `/orders`, `/orders/new`, `/orders/review`, dữ liệu chung của `/orders/detail`; `WorkOrderServlet`, `AssignmentServlet`; `OrderDAO`, `StaffDAO.technicians()`.
- **CSDL:** tạo/cập nhật khách, tìm/tạo xe, tạo phiếu và các hạng mục; tạo hóa đơn chưa thanh toán cùng transaction; lưu người được giao và thời điểm phân công. Các bảng chính: `customers`, `vehicles`, `work_orders`, `work_order_items`; phối hợp Lợi tại `invoices`.
- **Cần giải thích:** nháp trong session chưa ghi DB; giá lấy từ danh mục phía server; snapshot giá trên phiếu; quyền xem phiếu; chỉ phân công/đổi người khi phiếu còn `RECEIVED`.
- **Kiểm tra:** thiếu thông tin không tạo phiếu; quay lại sửa giữ bản nháp; xác nhận lặp không tạo hai phiếu; xe thuộc khách khác bị từ chối; người không liên quan không xem được phiếu.

**Đầu ra bàn giao:** phiếu `RECEIVED`, đầy đủ hạng mục/giá và đã có người được phân công để Kiệt tiếp tục.

## 2. Lợi — Đăng nhập, tra cứu và thanh toán

**Luồng demo:** khách nhập biển số/điện thoại → nhận OTP → xác minh → mở phiếu của xe → xem tiền công/vật tư và VietQR → báo đã chuyển → quản lý đối chiếu giao dịch → xác nhận nhận tiền và hoàn tất phiếu. Đồng thời phụ trách đăng nhập/đăng xuất nhân viên.

- **FE:** `staff-login.jsp`, `customer-login.jsp`; phần khách xem hóa đơn, VietQR, báo chuyển khoản và form đối soát trong `detail.jsp`; trạng thái đăng nhập/đăng xuất ở `header.jspf`.
- **BE:** `AuthServlet`, `PaymentServlet`, `EmailService`; phần trang đăng nhập trong `PageServlet`; `SessionAuthFilter`, phần session/CSRF trong `WebSessionFilter`; phối hợp Khởi dùng `OrderDAO` để đọc phiếu khách đúng quyền.
- **CSDL:** đọc tài khoản nhân viên và hồ sơ khách/xe để xác thực; cập nhật trạng thái hóa đơn và hoàn tất phiếu. Bảng: `users`, `customers`, `vehicles`, `invoices`, `work_orders`.
- **Cần giải thích:** mật khẩu BCrypt, HttpSession, OTP có hạn và giới hạn thử; khách chỉ xem đúng xe đã xác minh; báo chuyển khoản khác với xác nhận đã nhận tiền; VietQR không tự xác nhận giao dịch.
- **Kiểm tra:** sai mật khẩu/OTP; không xem được xe khác; chưa sửa xong không báo thanh toán; khách/thợ không được đối soát; đăng xuất hủy phiên.

**Đầu ra bàn giao:** khách đăng nhập đúng phạm vi; hóa đơn đi từ `UNPAID` qua `PENDING_VERIFICATION` đến `PAID`, phiếu `COMPLETED` khi quản lý xác nhận.

## 3. Tân — Kho phụ tùng và danh mục dịch vụ

**Luồng demo:** quản lý mở kho → thêm phụ tùng → cập nhật tồn thực tế → tạo/sửa dịch vụ → chọn giá công, vật tư và định mức → thợ nhìn thấy danh mục đó ở bước tiếp nhận.

- **FE:** `inventory.jsp`, `services.jsp`; phối hợp Khởi phần hiển thị giá công/vật tư/tồn trong bảng chọn dịch vụ của `intake.jsp`.
- **BE:** `InventoryServlet`, `ServiceServlet`, `InventoryDAO`, `ServiceDAO`; nhánh `/inventory`, `/services` trong `PageServlet`.
- **CSDL:** CRUD đang có trong repo: thêm phụ tùng, cập nhật tồn; thêm/sửa dịch vụ, giá công, vật tư mặc định và định mức. Bảng chính: `parts`, `services`.
- **Cần giải thích:** tiền công tách khỏi giá vật tư; dịch vụ có thể chỉ có tiền công; một dịch vụ có tối đa một loại vật tư mặc định; thay giá niêm yết không sửa giá hóa đơn cũ.
- **Kiểm tra:** trùng mã; giá/tồn âm; định mức không hợp lệ; vật tư không tồn tại; thợ/khách không được ghi danh mục.

**Đầu ra bàn giao:** danh mục và tồn hợp lệ cho Khởi lập phiếu; hàm `InventoryDAO.deductForOrder(Connection, orderId)` để Kiệt gọi trong transaction hoàn thành sửa chữa. Tân quản lý cách kiểm tra/trừ tồn, Kiệt quản lý thời điểm gọi và commit/rollback của toàn nghiệp vụ.

## 4. Kiệt — Sửa chữa và hiệu suất

**Luồng demo:** thợ mở phiếu được giao → bắt đầu sửa → lưu tiến độ 0/50/100% từng công việc → hoàn thành khi mọi việc đã xong → kiểm tra/trừ vật tư → chuyển chờ thanh toán; quản lý xem hiệu suất theo khoảng ngày.

- **FE:** phần nhận việc, thanh tiến độ, form cập nhật từng việc và kết thúc sửa chữa trong `detail.jsp`; `reports.jsp`.
- **BE:** `ProgressServlet`, `ReportServlet`; phần `/reports` và `report()` trong `PageServlet`; `StaffDAO.report()`; gọi `InventoryDAO.deductForOrder()` do Tân phụ trách.
- **CSDL:** khóa/đọc trạng thái phiếu, cập nhật tiến độ hạng mục, trừ tồn trong cùng transaction, ghi thời điểm hoàn thành; truy vấn hiệu suất theo ngày phân công. Bảng: `work_orders`, `work_order_items`, `parts`, `users`.
- **Cần giải thích:** chỉ người được giao được cập nhật; tổng tiến độ lấy trung bình các dòng công việc; mọi việc 100% mới kết thúc; thiếu hàng rollback; không trừ kho hai lần; đã sửa xong khác với đã thanh toán.
- **Kiểm tra:** sai người/sai trạng thái/sai hạng mục; mức tiến độ ngoài 0/50/100; chưa đủ checklist; thiếu vật tư; bấm hoàn thành lặp; báo cáo không có phiếu và khoảng ngày sai.

**Đầu ra bàn giao:** phiếu `WAITING_PAYMENT`, kho đã trừ đúng một lần để Lợi tiếp tục thanh toán; báo cáo hiệu suất cho quản lý.

## Quy ước với file dùng chung

Không chia nguyên `detail.jsp` cho một người vì trang này chứa nhiều bước của bốn luồng. Chia theo khối:

| File/phần dùng chung | Người chịu trách nhiệm chính |
| --- | --- |
| `detail.jsp`: thông tin phiếu, khách/xe, phân công | Khởi |
| `detail.jsp`: nhận việc, checklist, kết thúc sửa chữa | Kiệt |
| `detail.jsp`: hóa đơn, VietQR, báo chuyển khoản, đối soát | Lợi; dữ liệu giá/hạng mục phối hợp Khởi |
| `intake.jsp`: form và nháp | Khởi; Tân cung cấp dữ liệu danh mục/vật tư |
| `PageServlet`: danh sách, chi tiết, tiếp nhận, xem lại | Khởi |
| `PageServlet`: đăng nhập | Lợi |
| `PageServlet`: kho/dịch vụ | Tân |
| `PageServlet`: báo cáo | Kiệt |
| `WebFlow`, `ServletSupport` | Lợi phụ trách chuyển form/redirect/session; chủ từng luồng rà soát dữ liệu và trang đích của luồng mình |
| `DBContext`, cấu hình Maven/WAR và script chạy | Khởi tích hợp; cả nhóm biết cách chạy |
| `header.jspf`, `footer.jspf`, `home.jsp`, `style.css`, `error.jsp` | Tân giữ giao diện thống nhất; Lợi phụ trách trạng thái đăng nhập/menu quyền |
| `init.sql` | Khởi tổng hợp; mỗi người phụ trách phần bảng/ràng buộc thuộc nghiệp vụ mình |
| Kiểm thử tích hợp | Mỗi người bổ sung/giải thích ca kiểm tra luồng mình; Kiệt tổng hợp kết quả chạy toàn luồng |

Các JSP ở `backend2/src/main/webapp/WEB-INF/views/`; CSS ở `backend2/src/main/webapp/assets/`. Java ở `backend2/src/main/java/com/hihihaha/gara/`. Frontend Next.js `client2/` đã được loại khỏi bản JSP; mã cũ vẫn còn trong lịch sử Git.

## Thứ tự ghép và demo

**Tân → Khởi → Kiệt → Lợi**: chuẩn bị danh mục → lập/phân công phiếu → thực hiện sửa chữa → khách thanh toán/quản lý đối soát. Bước đăng nhập do Lợi chuẩn bị dùng chung ngay từ đầu; báo cáo của Kiệt trình bày sau khi đã có dữ liệu công việc.

Mỗi người cần tự demo được: **form JSP → request → Servlet kiểm tra quyền/dữ liệu → DAO hoặc JDBC → dòng CSDL thay đổi → JSP hiện kết quả**. Khi trình bày, dùng một phiếu xuyên suốt để thấy bốn phần nối với nhau.

## Đường đi chi tiết từ FE xuống BE

Các đường dẫn dưới đây tính từ gốc project `LT_Web`. Đặt:

- **V** = `backend2/src/main/webapp/WEB-INF/views/` — các file JSP của FE.
- **J** = `backend2/src/main/java/com/hihihaha/gara/` — các file Java của BE.
- Schema/seed = `backend2/src/main/resources/database/init.sql`.

**FE bản này không có hàm JavaScript gọi API.** Người dùng bấm `<button>` để trình duyệt submit `<form method="post" action="...">`, hoặc bấm link/lọc để gửi GET. Các tên hàm ở bảng dưới là hàm Java thực sự nhận và xử lý request.

### Đường dùng chung cho mọi người

1. Request JSP đi qua `J/filter/WebSessionFilter.java → doFilter()`: chuẩn hóa đường bằng servlet mapping, đọc session, chặn sai vai trò và kiểm tra `csrf` cho form ghi dữ liệu. Quyền không lấy từ input/localStorage.
2. GET trang và POST xem lại phiếu đi vào `J/servlet/PageServlet.java`. GET gọi `doGet()`, nạp dữ liệu vào request rồi `RequestDispatcher.forward()` tới JSP trong V.
3. POST `/actions/...` đi vào `J/servlet/ServletSupport.java → service() → dispatch()`. Nếu form có `_method=PATCH`, gọi `doPatch()` của Servlet con; nếu không, gọi `doPost()`. HTTP trên mạng vẫn là POST.
4. Controller dùng `allow()` kiểm tra quyền; `body()` gọi `J/servlet/WebFlow.java → formBody()` để đọc form hoặc lấy nháp trong session. `str()/num()` đọc dữ liệu; `J/util/Validation.java` kiểm tra các giới hạn chung.
5. Các thao tác ghi gọi DAO hoặc JDBC trực tiếp như bảng mô tả. `J/config/DBContext.java → getConnection()` tạo kết nối MySQL và đặt session giờ Việt Nam.
6. Ghi thành công gọi `ok()/created() → WebFlow.success()`: đặt thông báo, trả **303 redirect**. Trình duyệt GET trang đích; `PageServlet.doGet()` đọc lại DB rồi render JSP. Lỗi gọi `err() → WebFlow.error()`, hiển thị thông báo và đường quay lại.

API `/api/v1/...` là đường tương thích dùng chung các controller. Nó đi qua `J/filter/SessionAuthFilter.java → doFilter()`, yêu cầu `application/json` cho thao tác ghi, đọc JSON trong `ServletSupport.body()` và trả JSON bằng `J/util/ResponseUtil.java`. FE JSP chính dùng `/actions/...`, không gọi vòng qua HTTP API.

### Khởi — từng thao tác và hàm xử lý

| Thao tác / file FE | Request | File, hàm BE và cách xử lý |
| --- | --- | --- |
| Mở form tiếp nhận — `V/intake.jsp` | `GET /orders/new` | `PageServlet.doGet()` gọi `ServiceDAO.all()` từ `J/dao/ServiceDAO.java`; danh mục có giá công, vật tư, định mức, giá vật tư và tồn. Gán `services`, forward `intake.jsp`. |
| Bấm “Xem lại phiếu” — form trong `intake.jsp` | `POST /orders/review` với tên/điện thoại/email, biển số, dòng xe, tình trạng; `choose_{serviceId}`, `quantity_{serviceId}` | `PageServlet.doPost() → review()`; khóa session để tránh đụng xác nhận song song; gọi `Validation.intake()`, đọc lại `ServiceDAO.all()`, tính tổng dự kiến bằng BigDecimal. Lưu `orderDraft`, `draftLines`, `draftForm`, `draftTotal`, `draftToken` trong session; chưa INSERT DB. Redirect sang GET trang xem lại. |
| Xem lại / quay lại sửa — `V/review.jsp` | `GET /orders/review`; link `GET /orders/new` | `PageServlet.doGet()` kiểm tra nháp còn tồn tại; JSP hiển thị session. Quay lại form đọc dữ liệu nháp để sửa. Bản nháp mới thay bản cũ, token cũ không thể xác nhận. |
| Bấm “Xác nhận tiếp nhận xe” — form trong `review.jsp` | `POST /actions/orders` với `csrf`, `draftToken` | `WorkOrderServlet.doPost()` tại `J/servlet/WorkOrderServlet.java`; `allow(TECHNICIAN)`; `body() → WebFlow.formBody()` kiểm tra token và lấy nháp. `Validation.intake()` kiểm tra lại. Trong một transaction: `customer()` tìm/ghi khách; `vehicle()` kiểm tra chủ xe, ghi xe mới hoặc cập nhật dòng xe cũ; INSERT `work_orders`; `ServiceDAO.byId()` và `WebFlow.quoteMatches()` đối chiếu giá/định mức với bản đã xem; `insertItem()` ghi từng dòng LABOR/PART; UPDATE tổng; INSERT `invoices` UNPAID; commit. Giá/định mức thay đổi thì rollback, trả 409, yêu cầu xem lại. |
| Danh sách/tìm/lọc — `V/orders.jsp` | `GET /orders?q=...&queue=...` | `PageServlet.doGet()` gọi `OrderDAO.list()` ở `J/dao/OrderDAO.java`; `scope()/bindScope()` lọc quyền, `orderRow()` ánh xạ dữ liệu; `PageServlet.matches()` lọc nhóm trạng thái, lọc từ khóa rồi forward JSP. |
| Mở một phiếu — link trong `orders.jsp`, hiển thị `V/detail.jsp` | `GET /orders/detail?code=...` | `PageServlet.doGet()` gọi `OrderDAO.detail()` kiểm tra phạm vi rồi đọc hạng mục. Với quản lý, gọi `StaffDAO.technicians()` ở `J/dao/StaffDAO.java` lấy danh sách thợ và số phiếu đang nhận. |
| Bấm “Lưu phân công” — khối quản lý trong `detail.jsp` | `POST /actions/assignments/{code}`, `_method=PATCH`, `technician_id` | `AssignmentServlet.doPatch()` ở `J/servlet/AssignmentServlet.java` kiểm tra MANAGER; JDBC kiểm tra users có role TECHNICIAN; UPDATE `work_orders.assigned_to/assigned_at` chỉ khi status RECEIVED. Không còn RECEIVED trả 409. Thành công redirect lại phiếu. |

**Điểm bàn giao cho Kiệt:** mã phiếu và `assigned_to`; trạng thái vẫn RECEIVED cho tới khi người được giao bấm bắt đầu. Khởi phụ trách tạo hóa đơn UNPAID ban đầu; Lợi phụ trách thay đổi trạng thái thanh toán về sau.

### Lợi — từng thao tác và hàm xử lý

| Thao tác / file FE | Request | File, hàm BE và cách xử lý |
| --- | --- | --- |
| Mở / gửi đăng nhập nhân viên — `V/staff-login.jsp` | `GET /login/staff`; `POST /actions/auth/staff-login` với `phone_number`, `password` | `PageServlet.doGet()` render form. `AuthServlet.doPost()` trong `J/servlet/AuthServlet.java` đọc `users` qua JDBC; `BCrypt.checkpw()` so mật khẩu chính xác, không cắt khoảng trắng. Đúng thì `newSession()` hủy session cũ, tạo session mới với `role`, `user_id`, `full_name`; redirect `/orders`. Sai trả 401 trên form. |
| Yêu cầu OTP — bước 1 của `V/customer-login.jsp` | `POST /actions/auth/request-otp` với `phone_number`, `license_plate` | `AuthServlet.doPost()` chuẩn hóa biển số bằng `plate()`, JOIN customers/vehicles để lấy email và customer id. Sinh mã bằng SecureRandom; `J/util/OtpStore.java → reserve()` giữ chỗ và kiểm tra cooldown nguyên tử. Nếu không demo, `J/util/EmailService.java → sendOtpEmail() → sendMailSsl()` gửi SMTP với kiểm tra hostname TLS; gửi lỗi thì `OtpStore.cancel()` nhả mã. `mask()` che email, redirect bước xác minh; demo mới trả mã thử. |
| Nhập OTP — bước 2 trong `customer-login.jsp` | `POST /actions/auth/verify-otp` với điện thoại, biển số, `otp_code` | `AuthServlet.doPost() → OtpStore.verify()` kiểm tra hạn, số lần sai và tiêu thụ mã trong cùng khóa; đồng thời nhiều request chỉ một request dùng mã thành công. `newSession()` lưu role CUSTOMER, customer id, biển số đã xác minh; redirect `/orders`. |
| Khách xem phiếu/hóa đơn — `V/orders.jsp`, khối hóa đơn `V/detail.jsp` | `GET /orders`; `GET /orders/detail?code=...` | Dùng chung `PageServlet.doGet() → OrderDAO.list()/detail()`. Với CUSTOMER, câu SQL bắt buộc khớp customer id **và biển số trong session**. JSP hiển thị các dòng đã chốt giá, tổng tiền, trạng thái và ảnh VietQR chứa đúng số tiền/mã phiếu. |
| Bấm báo chuyển khoản — khối thanh toán trong `detail.jsp` | `POST /actions/payments/report`, `order_code` | `PaymentServlet.doPost()` trong `J/servlet/PaymentServlet.java` kiểm tra CUSTOMER; JDBC transaction JOIN phiếu/hóa đơn/xe, `FOR UPDATE`, kiểm tra đúng khách/biển số, WAITING_PAYMENT + UNPAID. UPDATE `invoices.payment_status=PENDING_VERIFICATION`, `reported_at`; commit. Không tự đặt PAID. |
| Quản lý đối soát — khối quản lý trong `detail.jsp` | `POST /actions/payments/verify`, `order_code` | Cùng `PaymentServlet.doPost()`, nhánh verify kiểm tra MANAGER; khóa phiếu/hóa đơn, chỉ nhận WAITING_PAYMENT + PENDING_VERIFICATION. UPDATE hóa đơn PAID/paid_at và phiếu COMPLETED trong cùng transaction. Request đồng thời sau lần đầu nhận 409. |
| Đăng xuất — form trong `V/header.jspf` | `POST /actions/auth/logout` | `AuthServlet.doPost()` gọi `HttpSession.invalidate()`; `WebFlow.success()` chuyển về `/home`. Cookie cũ không còn cho phép đọc dữ liệu riêng. |

**Không có `AuthDAO` hay `PaymentDAO` trong bản gara này:** hai Servlet đang dùng PreparedStatement trực tiếp. Không nhầm với `PaymentDAO` của bài mẫu tham khảo. Lợi cần trình bày đúng SQL nằm trong Servlet.

### Tân — từng thao tác và hàm xử lý

| Thao tác / file FE | Request | File, hàm BE và cách xử lý |
| --- | --- | --- |
| Mở kho — `V/inventory.jsp` | `GET /inventory` | `PageServlet.doGet() → InventoryDAO.all()` tại `J/dao/InventoryDAO.java`; SELECT parts, gán `parts`, forward JSP. Trang dành cho MANAGER. |
| Thêm phụ tùng — form mở rộng trong `inventory.jsp` | `POST /actions/inventory`: mã, tên, đơn vị, giá, tồn | `InventoryServlet.doPost()` ở `J/servlet/InventoryServlet.java`; `allow(MANAGER)`, `Validation.text()/money()` và kiểm tra số nguyên không âm. `InventoryDAO.create()` INSERT parts; `byId()` đọc bản ghi vừa tạo. Trùng mã trả 409. |
| Lưu tồn thực tế — form từng dòng trong `inventory.jsp` | `POST /actions/inventory/{id}/stock`, `_method=PATCH`, `stock_quantity`, `expected_stock` | `InventoryServlet.doPatch()` đọc id/số lượng. `InventoryDAO.setStock(id, stock, expectedStock)` UPDATE chỉ khi tồn DB còn bằng `expected_stock` lúc mở trang. Nếu có sửa chữa/kiểm kê khác đã thay tồn, trả 409 thay vì ghi đè; nếu không có id, trả 404. Đọc lại `byId()` rồi redirect `/inventory`. API PATCH tương thích cũng phải gửi `expected_stock`. |
| Mở danh mục dịch vụ — `V/services.jsp` | `GET /services` | `PageServlet.doGet()` gọi `ServiceDAO.all()` và `InventoryDAO.all()` để có danh mục dịch vụ và dropdown vật tư. |
| Thêm dịch vụ — form đầu `services.jsp` | `POST /actions/services`: mã, tên, `labor_price`, `default_part_id`, `default_part_quantity` | `ServiceServlet.doPost()` ở `J/servlet/ServiceServlet.java`; `parse()` và `Validation` kiểm tra giá/tên/định mức; id vật tư trống thành null. `ServiceDAO.create()` tại `J/dao/ServiceDAO.java` INSERT services rồi `byId()` đọc dịch vụ cùng thông tin parts. |
| Sửa dịch vụ — form của từng dịch vụ trong `services.jsp` | `POST /actions/services/{id}`, `_method=PATCH` | `ServiceServlet.doPatch() → parse() → ServiceDAO.update() → byId()`. UPDATE tên/giá công/vật tư/định mức; không UPDATE hạng mục hóa đơn đã chốt của các phiếu cũ. |
| Cung cấp danh mục cho Khởi | Dữ liệu bảng dịch vụ trong `V/intake.jsp` | `ServiceDAO.all()/byId()` JOIN services với parts. Khởi dùng các hàm này để xem trước/chốt giá. Tân không tự tạo phiếu. |
| Trừ vật tư khi Kiệt kết thúc | Không có nút trừ kho riêng | `InventoryDAO.deductForOrder(Connection, orderId)` tổng hợp số lượng theo part_id, khóa theo id tăng dần, kiểm tra đủ tồn rồi trừ. Dùng chính Connection/transaction của Kiệt; thiếu tồn ném SQLException SQLState 45000 để caller rollback toàn bộ. |

### Kiệt — từng thao tác và hàm xử lý

| Thao tác / file FE | Request | File, hàm BE và cách xử lý |
| --- | --- | --- |
| Mở phiếu được giao — `V/orders.jsp` → `V/detail.jsp` | `GET /orders/detail?code=...` | `PageServlet.doGet() → OrderDAO.detail()` đọc status, assigned_to, các dòng và phần trăm chung. JSP chỉ hiện thao tác sửa cho thợ có user_id trùng assigned_to. BE tiếp tục kiểm tra lại khi ghi. |
| Bấm “Bắt đầu sửa xe” — khối nhận việc trong `detail.jsp` | `POST /actions/progress/{code}/start` | `ProgressServlet.doPost()` ở `J/servlet/ProgressServlet.java`; `allow(TECHNICIAN)`, khóa phiếu bằng SELECT FOR UPDATE có điều kiện assigned_to; chỉ RECEIVED được UPDATE IN_PROGRESS. Commit rồi redirect phiếu. |
| Chọn 0/50/100 và bấm “Lưu” — form từng dòng LABOR trong `detail.jsp` | `POST /actions/progress/{code}/items/{itemId}`, `_method=PATCH`, `progress_percent` | `ProgressServlet.doPatch()` xác thực mức hợp lệ, khóa phiếu đang IN_PROGRESS và đúng người; kiểm tra item thuộc phiếu và item_type LABOR; UPDATE progress_percent, commit. `OrderDAO` tính AVG các dòng LABOR khi GET lại; không tính tiến độ trên dòng PART. |
| Bấm “Hoàn thành sửa chữa” — khối kết thúc trong `detail.jsp` | `POST /actions/progress/{code}/finish` | `ProgressServlet.doPost()` nhánh finish khóa phiếu, kiểm tra IN_PROGRESS và stock_deducted_at chưa có; COUNT các dòng LABOR và số dòng chưa 100%. Gọi `InventoryDAO.deductForOrder()` của Tân trên cùng Connection; UPDATE WAITING_PAYMENT, finished_at, stock_deducted_at; commit một lần. Thiếu vật tư rollback mọi thay đổi. |
| Quản lý xem/lọc báo cáo — `V/reports.jsp` | `GET /reports?from=YYYY-MM-DD&to=YYYY-MM-DD` | `PageServlet.doGet() → report()` kiểm tra ngày qua `Validation.dates()`, gọi `StaffDAO.report(from,to)`. JDBC đếm phiếu theo assigned_at trong khoảng `[from, to+1 ngày)`, số đã sửa xong theo finished_at; tính tỷ lệ, gán `rows/from/to`, forward JSP. Ngày mặc định và phiên MySQL dùng giờ Việt Nam. |
| API báo cáo tương thích | `GET /api/v1/reports/technicians?from=...&to=...` | `ReportServlet.doGet()` ở `J/servlet/ReportServlet.java` kiểm tra MANAGER, dùng cùng `Validation.dates()` và `StaffDAO.report()`, trả JSON. |

**Không có `ProgressDAO` riêng:** SQL kiểm tra/cập nhật phiếu và checklist nằm trong `ProgressServlet`, còn kiểm tra/trừ vật tư được giao cho `InventoryDAO` trên cùng transaction. Kiệt cần giải thích được vì sao bấm lặp hoặc hai request đồng thời không trừ kho hai lần.
