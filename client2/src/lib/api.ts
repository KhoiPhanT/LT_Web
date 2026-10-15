// Phụ trách phần mới: Lợi (phiên, OTP, thanh toán), Khởi (lệnh, phân công, báo cáo), Tân (kho), Kiệt (tiến độ).
// Cookie HttpSession do Tomcat cấp là nguồn quyền; localStorage chỉ lưu tên/role để hiển thị menu.
export type Role = "MANAGER" | "TECHNICIAN" | "CUSTOMER";
export type UserSession = {
  id: number;
  role: Role;
  full_name?: string;
  phone_number: string;
  license_plate?: string;
};
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
export type ServiceSelection = { service_id: number; quantity: number };
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
// Lợi: lưu tên và vai trò cho menu sau khi Servlet tạo phiên.
function saveUser(user: UserSession) {
  localStorage.setItem("gara_user", JSON.stringify(user));
}
// Lợi: đăng xuất trên cả trình duyệt và Servlet.
export function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("gara_user");
    void fetch(`${BASE}/auth/logout`, { method: "POST", credentials: "same-origin" });
  }
}
// Lợi: mọi request dùng cùng cookie phiên; lỗi 401 xóa thông tin hiển thị cũ.
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
// Lợi: helper HTTP dùng chung cho các luồng tạo và cập nhật dữ liệu.
const post = <T>(path: string, data: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(data) });
const patch = <T>(path: string, data: unknown) =>
  request<T>(path, { method: "PATCH", body: JSON.stringify(data) });
export const api = {
  // Lợi: nhân viên đăng nhập bằng mật khẩu.
  staffLogin: async (phone_number: string, password: string) => {
    const data = await post<{ user: UserSession }>("/auth/staff-login", { phone_number, password });
    saveUser(data.user);
    return data.user;
  },
  // Lợi: khách yêu cầu mã OTP qua email đã khai khi tạo lệnh.
  requestOtp: (phone_number: string, license_plate: string) =>
    post<{ masked_email: string; otp_preview?: string }>("/auth/request-otp", {
      phone_number,
      license_plate,
    }),
  // Lợi: xác thực OTP và nhận phiên khách hàng.
  verifyOtp: async (phone_number: string, license_plate: string, otp_code: string) => {
    const data = await post<{ user: UserSession }>("/auth/verify-otp", {
      phone_number,
      license_plate,
      otp_code,
    });
    saveUser(data.user);
    return data.user;
  },
  // Lợi: đồng bộ lại tên/role từ phiên Servlet sau khi sửa dữ liệu mẫu hoặc tải lại trang.
  me: async () => {
    const user = await request<UserSession>("/auth/me");
    saveUser(user);
    return user;
  },
  // Lợi: khách báo chuyển khoản, chưa tự đánh dấu đã thanh toán.
  reportPayment: (order_code: string) =>
    post<{ payment_status: string }>("/payments/report", { order_code }),
  // Lợi: quản lý đối soát và xác nhận tiền đã đến.
  verifyPayment: (order_code: string) =>
    post<{ payment_status: string }>("/payments/verify", { order_code }),
  // Khởi: lấy danh sách lệnh theo quyền hiện tại.
  getOrders: () => request<WorkOrder[]>("/work-orders/my-orders"),
  // Khởi: lấy chi tiết lệnh được phép xem.
  getOrder: (code: string) => request<WorkOrder>(`/work-orders/${encodeURIComponent(code)}`),
  // Khởi: lập một lệnh gồm nhiều dịch vụ; mọi đơn giá được tra lại tại Servlet.
  createOrder: (data: {
    license_plate: string;
    customer_phone: string;
    customer_name: string;
    customer_email: string;
    vehicle_model: string;
    symptoms: string;
    services: ServiceSelection[];
  }) => post<{ order_code: string; total_amount: number }>("/work-orders", data),
  // Khởi: quản lý phân công kỹ thuật viên.
  assignOrder: (code: string, technician_id: number) =>
    patch<{ order_code: string }>(`/assignments/${encodeURIComponent(code)}`, { technician_id }),
  // Khởi: thống kê hiệu suất và danh sách kỹ thuật viên cho form phân công.
  report: (from: string, to: string) =>
    request<TechnicianReport[]>(
      `/reports/technicians?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    ),
  // Tân: đọc danh mục và số lượng tồn.
  inventory: () => request<Part[]>("/inventory"),
  // Tân: quản lý thêm phụ tùng.
  addPart: (data: {
    part_code: string;
    part_name: string;
    unit: string;
    price: number;
    stock_quantity: number;
  }) => post<Part>("/inventory", data),
  // Tân: quản lý chỉnh số lượng tồn.
  setStock: (id: number, stock_quantity: number) =>
    patch<Part>(`/inventory/${id}/stock`, { stock_quantity }),
  // Tân: danh mục dịch vụ độc lập để một xe chọn được nhiều công việc.
  services: () => request<Service[]>("/services"),
  addService: (data: {
    service_code: string;
    service_name: string;
    labor_price: number;
    default_part_id: number | null;
    default_part_quantity: number;
  }) => post<Service>("/services", data),
  updateService: (
    id: number,
    data: {
      service_name: string;
      labor_price: number;
      default_part_id: number | null;
      default_part_quantity: number;
    },
  ) => patch<Service>(`/services/${id}`, data),
  // Kiệt: bắt đầu sửa lệnh đã được giao.
  startOrder: (code: string) =>
    post<{ current_status: string }>(`/progress/${encodeURIComponent(code)}/start`, {}),
  // Kiệt: checklist từng công việc, chỉ người được phân công mới được cập nhật.
  updateTaskProgress: (code: string, itemId: number, progress_percent: 0 | 50 | 100) =>
    patch<{ progress_percent: number }>(`/progress/${encodeURIComponent(code)}/items/${itemId}`, {
      progress_percent,
    }),
  // Kiệt: hoàn thành sửa chữa và yêu cầu trừ kho trong giao dịch.
  finishOrder: (code: string) =>
    post<{ current_status: string }>(`/progress/${encodeURIComponent(code)}/finish`, {}),
};
