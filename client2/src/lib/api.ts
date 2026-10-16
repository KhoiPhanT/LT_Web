// Phụ trách phần mới: Lợi (phiên, OTP, thanh toán), Khởi (lệnh, phân công, báo cáo), Tân (kho), Kiệt (tiến độ).
// Cookie HttpSession do Tomcat cấp là nguồn quyền; localStorage chỉ lưu tên/role để hiển thị menu.
// Trang gọi hàm trong api bên dưới -> request() gửi /api/v1 -> Next.js chuyển tới Servlet -> MySQL.
export type Role = "MANAGER" | "TECHNICIAN" | "CUSTOMER";
// Lợi: thông tin hiển thị sau đăng nhập; đây không phải nguồn quyền của backend.
export type UserSession = {
  id: number;
  role: Role;
  full_name?: string;
  phone_number: string;
  license_plate?: string;
};
// Tân: một dòng kho phụ tùng gồm giá hiện tại và số lượng tồn hiện tại.
export type Part = {
  id: number;
  part_code: string;
  part_name: string;
  unit: string;
  price: number;
  stock_quantity: number;
};
// Tân: dịch vụ có giá công riêng, có thể không dùng vật tư hoặc dùng một phụ tùng mặc định.
export type Service = {
  id: number;
  service_code: string;
  service_name: string;
  labor_price: number;
  default_part_id: number | null;
  default_part_quantity: number;
  part_name: string | null;
  part_price: number | null;
  stock_quantity: number | null;
};
// Khởi: mỗi phần tử trong mảng services khi lập lệnh chỉ gửi ID dịch vụ và số lần làm.
// Giá không nằm trong kiểu này vì WorkOrderServlet sẽ đọc giá niêm yết từ MySQL.
export type ServiceSelection = { service_id: number; quantity: number };
// Kiệt/Khởi: dòng công hoặc vật tư thuộc một lệnh; tiến độ chỉ áp dụng cho dòng công.
export type OrderItem = {
  id?: number;
  part_id?: number | null;
  service_id?: number | null;
  item_type: "PART" | "LABOR";
  item_name?: string;
  quantity: number;
  unit_price?: number;
  total_price?: number;
  progress_percent?: number;
};
// Khởi: dữ liệu lệnh mà trang khách, thợ và quản lý cùng sử dụng.
// items chỉ có ở API chi tiết; API danh sách trả các trường tổng quan.
export type WorkOrder = {
  order_code: string;
  license_plate: string;
  vehicle_model: string;
  customer_name: string;
  current_status: "RECEIVED" | "IN_PROGRESS" | "WAITING_PAYMENT" | "COMPLETED";
  progress_percent: number;
  symptoms: string;
  assigned_to: number | null;
  technician_name: string | null;
  total_amount: number;
  payment_status: "UNPAID" | "PENDING_VERIFICATION" | "PAID";
  items?: OrderItem[];
};
// Khởi: một dòng báo cáo của kỹ thuật viên trong khoảng ngày quản lý đã chọn.
export type TechnicianReport = {
  id: number;
  full_name: string;
  assigned_count: number;
  finished_count: number;
  completion_rate: number;
};
// Khởi: nhãn tiến độ dùng thống nhất trên trang khách, kỹ thuật viên và quản lý.
export const orderStatusLabel: Record<WorkOrder["current_status"], string> = {
  RECEIVED: "Đã tiếp nhận",
  IN_PROGRESS: "Đang sửa chữa",
  WAITING_PAYMENT: "Chờ thanh toán",
  COMPLETED: "Hoàn tất",
};
// Lợi: nhãn đối soát giữ rõ sự khác nhau giữa khách đã báo và quản lý đã xác nhận.
export const paymentStatusLabel: Record<WorkOrder["payment_status"], string> = {
  UNPAID: "Chưa thanh toán",
  PENDING_VERIFICATION: "Chờ đối soát",
  PAID: "Đã thanh toán",
};
// Lợi: cùng domain với giao diện; next.config.mjs chuyển đường dẫn này sang Tomcat.
const BASE = "/api/v1";
// Lợi: đọc thông tin chỉ để hiển thị; Servlet vẫn xác thực bằng HttpSession.
export function getCurrentUser(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("gara_user") || "null");
  } catch {
    return null;
  }
}
// Lợi: lưu tên và vai trò để menu hiển thị ngay sau đăng nhập; cookie mới là phiên thật.
function saveUser(user: UserSession) {
  localStorage.setItem("gara_user", JSON.stringify(user));
}
// Lợi: xóa cache giao diện và báo AuthServlet hủy session trên server.
export function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("gara_user");
    void fetch(`${BASE}/auth/logout`, { method: "POST", credentials: "same-origin" });
  }
}
// Lợi: hàm HTTP chung ghép BASE + path, tự gửi session cookie và đọc JSON trả về.
// API thành công có dạng { data: ... }; API lỗi có message, chuyển thành Error cho trang hiển thị.
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...init.headers },
  });
  const result = await response
    .json()
    .catch(() => ({ message: "Máy chủ trả dữ liệu không hợp lệ" }));
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("gara_user");
      // Lợi: phiên hết hạn phải quay lại đúng trang đăng nhập, thay vì để trang vai trò rỗng.
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/staff/login") {
        window.location.replace(path.startsWith("/customer") ? "/login" : "/staff/login");
      }
    }
    throw new Error(result.message || `HTTP ${response.status}`);
  }
  return result.data as T;
}
// Lợi: hai helper đóng gói dữ liệu thành JSON cho các thao tác tạo (POST) và sửa (PATCH).
const post = <T>(path: string, data: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(data) });
const patch = <T>(path: string, data: unknown) =>
  request<T>(path, { method: "PATCH", body: JSON.stringify(data) });
export const api = {
  // Lợi: StaffLogin -> AuthServlet /staff-login; session tạo trên Tomcat, user trả về để điều hướng.
  staffLogin: async (phone_number: string, password: string) => {
    const data = await post<{ user: UserSession }>("/auth/staff-login", { phone_number, password });
    saveUser(data.user);
    return data.user;
  },
  // Lợi: CustomerLogin bước 1 -> AuthServlet /request-otp; trả email che bớt và mã xem trước nếu demo.
  requestOtp: (phone_number: string, license_plate: string) =>
    post<{ masked_email: string; otp_preview?: string }>("/auth/request-otp", {
      phone_number,
      license_plate,
    }),
  // Lợi: CustomerLogin bước 2 -> AuthServlet /verify-otp; mã đúng thì Tomcat tạo session CUSTOMER.
  verifyOtp: async (phone_number: string, license_plate: string, otp_code: string) => {
    const data = await post<{ user: UserSession }>("/auth/verify-otp", {
      phone_number,
      license_plate,
      otp_code,
    });
    saveUser(data.user);
    return data.user;
  },
  // Lợi: SimpleNav -> AuthServlet /me để đọc người đang đăng nhập từ session thật.
  me: async () => {
    const user = await request<UserSession>("/auth/me");
    saveUser(user);
    return user;
  },
  // Lợi: PaymentPage -> PaymentServlet /report; hóa đơn sang PENDING_VERIFICATION, chưa phải PAID.
  reportPayment: (order_code: string) =>
    post<{ payment_status: string }>("/payments/report", { order_code }),
  // Lợi: ManagerPage -> PaymentServlet /verify; chỉ MANAGER được chuyển hóa đơn thành PAID.
  verifyPayment: (order_code: string) =>
    post<{ payment_status: string }>("/payments/verify", { order_code }),
  // Khởi: trang khách/thợ/quản lý -> WorkOrderServlet; session quyết định các lệnh được trả về.
  getOrders: () => request<WorkOrder[]>("/work-orders/my-orders"),
  // Khởi: trang thanh toán/checklist -> WorkOrderServlet; code là order_code lấy từ URL hoặc danh sách.
  // Servlet kiểm tra quyền rồi trả thêm items của đúng lệnh đó.
  getOrder: (code: string) => request<WorkOrder>(`/work-orders/${encodeURIComponent(code)}`),
  // Khởi: form tiếp nhận -> WorkOrderServlet; gửi một xe + nhiều service_id/quantity.
  // Backend lưu khách, xe, lệnh, hạng mục và hóa đơn; trả mã lệnh mới và tổng tiền.
  createOrder: (data: {
    license_plate: string;
    customer_phone: string;
    customer_name: string;
    customer_email: string;
    vehicle_model: string;
    symptoms: string;
    services: ServiceSelection[];
  }) => post<{ order_code: string; total_amount: number }>("/work-orders", data),
  // Khởi: trang quản lý -> AssignmentServlet; PATCH mã lệnh và ID thợ được chọn.
  assignOrder: (code: string, technician_id: number) =>
    patch<{ order_code: string }>(`/assignments/${encodeURIComponent(code)}`, { technician_id }),
  // Khởi: trang quản lý -> ReportServlet; trả số lệnh giao/xong của từng thợ theo from/to.
  report: (from: string, to: string) =>
    request<TechnicianReport[]>(
      `/reports/technicians?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    ),
  // Tân: trang kho -> InventoryServlet; trả toàn bộ phụ tùng và tồn hiện tại.
  inventory: () => request<Part[]>("/inventory"),
  // Tân: form kho -> InventoryServlet; MANAGER tạo phụ tùng mới.
  addPart: (data: {
    part_code: string;
    part_name: string;
    unit: string;
    price: number;
    stock_quantity: number;
  }) => post<Part>("/inventory", data),
  // Tân: nút chỉnh tồn -> InventoryServlet; ID chỉ đúng phụ tùng, stock_quantity là tồn mới.
  setStock: (id: number, stock_quantity: number) =>
    patch<Part>(`/inventory/${id}/stock`, { stock_quantity }),
  // Tân: trang kho và form lập lệnh -> ServiceServlet; trả dịch vụ, giá công và vật tư đi kèm.
  services: () => request<Service[]>("/services"),
  // Tân: quản lý tạo dịch vụ niêm yết; default_part_id có thể null nếu chỉ tính tiền công.
  addService: (data: {
    service_code: string;
    service_name: string;
    labor_price: number;
    default_part_id: number | null;
    default_part_quantity: number;
  }) => post<Service>("/services", data),
  // Tân: quản lý sửa tên/giá công và định mức vật tư của dịch vụ đang có.
  updateService: (
    id: number,
    data: {
      service_name: string;
      labor_price: number;
      default_part_id: number | null;
      default_part_quantity: number;
    },
  ) => patch<Service>(`/services/${id}`, data),
  // Kiệt: nút Bắt đầu -> ProgressServlet; chỉ thợ được giao chuyển RECEIVED sang IN_PROGRESS.
  startOrder: (code: string) =>
    post<{ current_status: string }>(`/progress/${encodeURIComponent(code)}/start`, {}),
  // Kiệt: một nút checklist -> ProgressServlet; gửi itemId và mức 0/50/100 cho dòng công.
  updateTaskProgress: (code: string, itemId: number, progress_percent: 0 | 50 | 100) =>
    patch<{ progress_percent: number }>(`/progress/${encodeURIComponent(code)}/items/${itemId}`, {
      progress_percent,
    }),
  // Kiệt: nút Hoàn thành -> ProgressServlet; kiểm tra checklist và trừ kho một lần trong giao dịch.
  finishOrder: (code: string) =>
    post<{ current_status: string }>(`/progress/${encodeURIComponent(code)}/finish`, {}),
};
