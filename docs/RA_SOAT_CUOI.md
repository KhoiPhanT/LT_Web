# Rà soát cuối bản Servlet + JSP — 21/10/2026

Phạm vi: mã nguồn, form JSP, quyền ở BE, trạng thái nghiệp vụ, dữ liệu lỗi, thao tác đồng thời, build WAR/Docker, context path và tài liệu chạy. Kiểm thử ghi trên project Docker **ltweb-audit**, web 18089/MySQL 13317. Bản demo chính ltweb-gara, web 8089 được giữ riêng.

## Các lỗi tìm được và đã sửa

| Vấn đề | Bản sửa | Bằng chứng |
| --- | --- | --- |
| Bỏ qua quyền mở trang bằng URL `;...` hoặc ký tự mã hóa | Filter dùng `getServletPath() + getPathInfo()` mà Tomcat đã chuẩn hóa thay vì so sánh raw request URI. | Đã tái hiện trước sửa: thợ mở `/inventory` trả 403 nhưng `/inventory;review`, `/%69nventory`, `/reports;review` trả 200. Sau sửa các ca này trả 403, cả dưới context `/gara`. |
| OTP có thể dùng hai lần hoặc mất số lần sai khi request đồng thời | `OtpStore.reserve()/verify()/cancel()` đồng bộ hóa thao tác. Kiểm tra/tiêu thụ mã và tăng số lần thử diễn ra nguyên tử; giữ giới hạn sau lần sai thứ năm. Email gửi lỗi nhả reservation. | Unit test và HTTP: nhiều xác minh đúng chỉ một thành công; chỉ năm lần sai được xử lý trước khi khóa; nhiều yêu cầu gửi mã chỉ một được nhận. |
| Form/API cũ có thể nhận request ghi với kiểu nội dung không phù hợp | API ghi yêu cầu application/json; form kiểm tra CSRF trên các phương thức ghi và chỉ phục vụ GET/HEAD/POST. | HTTP text/plain → 415; form POST/PATCH thiếu CSRF bị từ chối. |
| Lưu tồn từ trang cũ ghi đè số lượng đã bị thao tác khác thay đổi | Form/API gửi expected_stock; DAO UPDATE với điều kiện tồn cũ còn khớp. Sai phiên bản trả 409, không ghi đè. | Hai phiên quản lý: một phiên sửa 4 → 3, phiên cũ lưu 10 bị từ chối; DB vẫn là 3. |
| Giá/định mức thay đổi sau khi đã xem lại phiếu có thể làm tổng xác nhận khác số vừa xem | Đối chiếu các trường quote trong session với danh mục đọc trong transaction. Khác thì rollback và yêu cầu xem lại. | Đổi giá ở phiên quản lý sau khi thợ xem lại; xác nhận cũ trả 409 và không tạo phiếu. |
| Nháp mới và xác nhận nháp cũ có thể đụng nhau trong cùng session | Cả review và confirm cùng dùng khóa session; draftToken phân biệt bản nháp. | Hai lần xác nhận song song chỉ một tạo phiếu; bản đã tiêu thụ bị từ chối. |
| Giá/số tiền, độ dài dữ liệu hoặc email không hợp lệ gây lỗi SQL/SMTP | `Validation` dùng chung cho form/API, khớp độ dài cột, DECIMAL(12,2), tổng tiền và kiểu dữ liệu. Email không nhận ký tự điều khiển/CRLF. | Giá vượt cột, lẻ quá hai số, tổng nhân số lượng vượt cột, tên/mã quá dài, email chèn lệnh đều bị chặn và rollback. Giá JSON lớn có phần lẻ vẫn được đọc đúng bằng BigDecimal. |
| Nhập lại xe cũ với dòng xe đã sửa nhưng DB giữ model cũ | `WorkOrderServlet.vehicle()` cập nhật model sau khi kiểm tra đúng chủ xe, trong cùng transaction. | Tạo lại phiếu cùng xe với model mới; GET đọc ra model mới. |
| Cắt khoảng trắng mật khẩu làm sai ngữ nghĩa đăng nhập | Không trim password ở formBody và AuthServlet. | Mật khẩu có thêm khoảng trắng không được coi như mật khẩu mẫu. |
| Báo cáo lệch ngày khi MySQL/JVM chạy UTC, hoặc ngày cực đại gây tràn | Ngày mặc định dùng Asia/Ho_Chi_Minh; JDBC session +07:00 và connection timezone tương ứng. `Validation.dates()` giới hạn ngày phù hợp MySQL và to+1. | Fixture 17:30 UTC ngày 01/01/2020 được tính vào ngày 02/01 tại Việt Nam; ngày cực đại trả 400. |
| SMTP socket chưa bật kiểm tra hostname TLS | Cấu hình SSLParameters endpoint identification trước khi kết nối Gmail. | Rà soát code; chưa gửi Gmail thật vì chưa có tài khoản để xác minh. |
| Script shell thực thi `.env` và script Windows không đọc file env theo cùng cách | Cả hai dùng Docker Compose --env-file; script in cổng web từ compose port. | Script Bash đã chạy thành công với DB demo hiện có; CMD được rà cú pháp nhưng chưa thực thi trên Windows. |
| Frontend Next.js cũ còn dependency có cảnh báo high/critical, dễ chạy nhầm sau chuyển JSP | Loại `client2/` khỏi bản bàn giao; không còn Node dependency trong ứng dụng hiện hành. Mã cũ vẫn có trong commit nguồn của Git. | npm audit khi kiểm tra bản cũ báo 12 vấn đề; bản deploy hiện tại chỉ build Maven WAR, không đóng gói hay chạy Next.js. |

## Các bất biến đã kiểm tra lại

- Người chưa đăng nhập không đọc được dữ liệu riêng. Vai trò từ session; khách chỉ thấy đúng customer id + biển số OTP; thợ chỉ cập nhật phiếu được giao.
- Phiếu lưu giá phía server và giữ giá lịch sử khi đổi danh mục.
- Mọi công việc phải 100% mới kết thúc; không cập nhật dòng PART như một công việc.
- Nhiều request kết thúc cùng phiếu chỉ một lần trừ kho. Hai phiếu tranh vật tư cuối: một thành công, một thiếu kho và rollback.
- Báo chuyển khoản không tự xác nhận PAID. Nhiều request đối soát chỉ một thành công; invoice/phiếu cùng commit.
- UTF-8, escape nội dung nhập, CSRF, redirect 303, logout, form và CSS dưới context path riêng.
- SQL bootstrap chạy lại không làm mất phiếu demo WO-77FEC55C hoặc số tồn demo đã dùng.

## Kết quả và cách tái kiểm tra

| Kiểm tra | Kết quả / tệp |
| --- | --- |
| Maven clean package, compile release 17 | PASS; 6 unit test, 0 failure/error |
| Docker Maven/JDK 21 → Tomcat 10.1/MySQL 8 | Build và health PASS |
| Form JSP ba vai trò | `jsp-test-result.json` PASS |
| Nghiệp vụ API gốc | `api-test-result.json` PASS |
| Audit dữ liệu lỗi/quyền/đồng thời | `audit-test-result.json` PASS |
| OTP hết hạn với OTP_TTL_MS=1200, giới hạn thử | `otp-test-result.json` PASS |
| Context /gara | `context-test-result.json` PASS |
| Biên ngày UTC/VN | `timezone-test-result.json` PASS |
| Script Bash, diff whitespace | `bash -n`, `git diff --check` PASS |

Chạy test theo mục 9 của `HUONG_DAN_CHAY_THUC_TE.md`. Test ghi mặc định trỏ cổng audit 18089. Các fixture dịch vụ của test JSP độc lập với các dịch vụ cực đại do test audit tạo để không phụ thuộc thứ tự chạy. `verify_vietnam_date.py` dùng kết quả audit mới nhất để tìm đúng fixture AUDIT, đặt thời điểm lịch sử, đối chiếu báo cáo rồi khôi phục thời điểm gốc; không chạy trên DB demo chính. Dữ liệu audit được giữ để đối chiếu, không trộn vào demo chính.

## Giới hạn cần hiểu đúng

Không thể suy ra phần mềm không còn mọi lỗi chỉ từ bộ test. Lần rà này chưa xác minh Gmail thật, giao dịch ngân hàng thật, hệ điều hành Windows, thiết bị di động hoặc tải nhiều người dùng thực tế. OTP/session vẫn thuộc một tiến trình Tomcat, restart yêu cầu đăng nhập/xin mã lại. Chưa có phân trang cho dữ liệu lớn; chưa có hủy phiếu, thanh toán tiền mặt, hoàn tiền, từ chối báo chuyển khoản hay trạng thái bàn giao riêng vì các chức năng đó không thuộc repo gốc.

Hướng dẫn nhóm: `PHAN_CONG_CODE.md` là phân công mới; các comment tên người trong code nguồn cũ không phải bằng chứng đóng góp lịch sử của bản sửa. Nhóm cần rà soát và trình bày theo công việc thực tế.
