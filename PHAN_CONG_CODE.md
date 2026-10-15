# Phân công mã nguồn cho bốn luồng dọc

Nhãn **phụ trách** trong comment chỉ người cần rà soát, hoàn thiện và trình bày phần mã tương ứng. Nhóm cập nhật theo đóng góp thực tế trước khi nộp. Mỗi người có thể theo một request từ giao diện đến Servlet và dữ liệu MySQL.

| Người | Giao diện và hàm dùng chung | Servlet / lớp dữ liệu | Bảng, thao tác cần trình bày |
| --- | --- | --- | --- |
| **Lợi** | `client2/src/app/(auth)/login/page.tsx`, `client2/src/app/(auth)/staff/login/page.tsx`, `client2/src/app/(customer)/customer/page.tsx`, `client2/src/app/(customer)/customer/payment/[order_code]/page.tsx`; `api.ts`: `staffLogin`, `requestOtp`, `verifyOtp`, `me`, `reportPayment`, `verifyPayment` và helper phiên | `AuthServlet`, `PaymentServlet`, `SessionAuthFilter`, `EmailService`, `ServletSupport` (kiểm tra quyền và JSON), `ResponseUtil` (tích hợp) | `users`, `customers`, `invoices`; OTP 5 phút, quyền khách, báo chuyển khoản và quản lý đối soát |
| **Khởi** | `client2/src/app/(technician)/technician/create-order/page.tsx`: `addService`, `submit`; `client2/src/app/(manager)/manager/page.tsx`: `load`, `assign`; `api.ts`: `getOrders`, `getOrder`, `createOrder`, `assignOrder`, `report` | `WorkOrderServlet`, `AssignmentServlet`, `ReportServlet`, `DBContext`, `ServletSupport.orderRow` và `ORDER_SELECT` | `customers`, `vehicles`, `work_orders`, `work_order_items`; tạo lệnh nhiều dịch vụ, phân công, thống kê theo ngày |
| **Tân** | `client2/src/app/(manager)/manager/inventory/page.tsx`, `create-order/page.tsx`: hiển thị dịch vụ và vật tư đi kèm; `api.ts`: `inventory`, `addPart`, `setStock`, `services`, `addService`, `updateService`; menu/layout tinh gọn | `InventoryServlet`, `ServiceServlet`, `InventoryDAO`, `ServiceDAO` | `parts`, `services`; thêm/chỉnh tồn, tạo dịch vụ có hoặc không có vật tư, niêm yết giá công, kiểm tra và trừ tồn trong giao dịch của Kiệt |
| **Kiệt** | `client2/src/app/(technician)/technician/page.tsx`; `api.ts`: `startOrder`, `updateTaskProgress`, `finishOrder` | `ProgressServlet`, gọi `InventoryDAO.deductForOrder` của Tân | `work_orders`, `work_order_items.progress_percent`, `parts`; chỉ lệnh được giao, checklist 0/50/100%, hoàn thành và trừ kho đúng một lần |

Schema mới ở `backend2/src/main/resources/database/init.sql`: Khởi phụ trách cấu trúc nghiệp vụ chung, Tân phụ trách ràng buộc `parts` và số lượng hạng mục, Kiệt phụ trách tiến độ hạng mục, Lợi phụ trách hóa đơn và seed đăng nhập. WAR chỉ chứa mã Servlet hiện hành.

## Cách lần theo một luồng khi thuyết trình

1. Mở trang trong cột giao diện, chỉ ra nút/hàm gọi `api.ts`.
2. Chỉ endpoint Servlet tương ứng và cách kiểm tra phiên/vai trò.
3. Chỉ câu SQL hoặc DAO đọc/ghi bảng nào.
4. Demo trạng thái trả về trên giao diện và dòng dữ liệu thay đổi trong MySQL.

Kịch bản thao tác theo đúng thứ tự Tân → Khởi → Kiệt → Lợi ở `bao_cao/KICH_BAN_THUYET_TRINH_DAY_DU.md`.
