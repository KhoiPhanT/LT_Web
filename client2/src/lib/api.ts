export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Trên client browser (cả domain thật và localhost):
    // Dùng đường dẫn tương đối /api/v1 để Next.js proxy trực tiếp sang backend port 5000.
    // Cách này giải quyết triệt để lỗi SSL đa cấp Cloudflare và 100% không bị CORS!
    return "/api/v1";
  }
  return process.env.INTERNAL_API_URL || "http://localhost:5000/api/v1";
}

export interface UserSession {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  role: "CUSTOMER" | "SERVICE_ADVISOR" | "WORKSHOP_MANAGER" | "TECHNICIAN" | "OWNER" | string;
  license_plate?: string;
  vip_rank?: string;
}

export interface FetchOptions extends RequestInit {
  token?: string;
  roleFallback?: string;
}

// Lưu session người dùng sau khi đăng nhập thành công
export function saveSession(token: string, user: UserSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("hihihaha_token", token);
  localStorage.setItem("hihihaha_user", JSON.stringify(user));
}

// Lấy thông tin user hiện tại từ session
export function getCurrentUser(): UserSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("hihihaha_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

// Lấy token đã lưu trong phiên làm việc
export function getSavedToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("hihihaha_token") || "";
}

// Xóa phiên làm việc khi đăng xuất
export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("hihihaha_token");
  localStorage.removeItem("hihihaha_user");
}

// Lấy token hợp lệ (ưu tiên token đã đăng nhập nếu đúng nhóm vai trò)
export async function getValidToken(roleFallback: string = "SERVICE_ADVISOR"): Promise<string> {
  if (typeof window === "undefined") return "";

  const saved = getSavedToken();
  const currentUser = getCurrentUser();

  // Chỉ dùng saved token nếu vai trò khớp nhau:
  // - Nếu cần CUSTOMER: token lưu trữ phải là CUSTOMER
  // - Nếu cần nhân viên (TECHNICIAN, WORKSHOP_MANAGER, SERVICE_ADVISOR, OWNER): token lưu trữ không được là CUSTOMER
  if (saved && currentUser) {
    if (roleFallback === "CUSTOMER" && currentUser.role === "CUSTOMER") {
      return saved;
    }
    if (roleFallback !== "CUSTOMER" && currentUser.role !== "CUSTOMER") {
      return saved;
    }
  }

  // Cấp token theo role fallback để tránh đứt kết nối
  try {
    const phoneMap: Record<string, string> = {
      CUSTOMER: "0797526990",
      SERVICE_ADVISOR: "0988888801",
      WORKSHOP_MANAGER: "0988888802",
      TECHNICIAN: "0988888803",
      OWNER: "0988888800",
    };

    const res = await fetch(`${getApiBaseUrl()}/auth/dev-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: roleFallback,
        phone_number: phoneMap[roleFallback] || "0988888803",
      }),
    });

    const data = await res.json();
    if (data?.data?.accessToken) {
      return data.data.accessToken;
    }
  } catch (err) {
    console.warn("Lỗi xác thực:", err);
  }

  return "";
}

export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, roleFallback = "SERVICE_ADVISOR", headers, ...rest } = options;

  let activeToken = token;
  if (!activeToken && typeof window !== "undefined") {
    activeToken = await getValidToken(roleFallback);
  }

  const reqHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (activeToken) {
    reqHeaders["Authorization"] = `Bearer ${activeToken}`;
  }

  const url = `${getApiBaseUrl()}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    headers: reqHeaders,
    ...rest,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Lỗi API: ${response.status}`);
  }

  return data;
}

// Các hàm nghiệp vụ gọi Backend API thật
export const api = {
  // 1. Đăng nhập nhân viên nội bộ thật (SĐT + Mật khẩu)
  staffLogin: async (phone_number: string, password: string) => {
    const res = await fetch(`${getApiBaseUrl()}/auth/staff-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Đăng nhập nhân viên không thành công");
    }
    if (data.data?.accessToken && data.data?.user) {
      saveSession(data.data.accessToken, data.data.user);
    }
    return data;
  },

  // 1.1. Tra cứu nhanh hồ sơ khách hàng & kiểm tra email liên kết
  lookupCustomer: async (license_plate?: string, phone_number?: string) => {
    try {
      const params = new URLSearchParams();
      if (license_plate) params.append("license_plate", license_plate);
      if (phone_number) params.append("phone_number", phone_number);
      const res = await fetch(`${getApiBaseUrl()}/auth/lookup-customer?${params.toString()}`);
      return await res.json();
    } catch (e) {
      return { success: false, data: { found: false } };
    }
  },

  // 2. Yêu cầu mã OTP cho khách hàng (hỗ trợ nhập email trực tiếp)
  requestOtp: async (phone_number: string, license_plate: string, email?: string) => {
    const res = await fetch(`${getApiBaseUrl()}/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number, license_plate, email }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Không thể gửi OTP");
    }
    return data;
  },

  // 3. Xác thực OTP và đăng nhập khách hàng thật
  verifyOtp: async (phone_number: string, license_plate: string, otp_code: string) => {
    const res = await fetch(`${getApiBaseUrl()}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number, license_plate, otp_code }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Mã OTP không hợp lệ");
    }
    if (data.data?.accessToken && data.data?.user) {
      saveSession(data.data.accessToken, data.data.user);
    }
    return data;
  },

  // 4. Lấy thông tin Lệnh sửa chữa thật (mặc định cho phép nhân viên xem toàn quyền)
  getWorkOrder: (orderCode: string, roleFallback: "CUSTOMER" | "WORKSHOP_MANAGER" | "TECHNICIAN" = "WORKSHOP_MANAGER") =>
    fetchApi<{ success: boolean; data: any }>(`/work-orders/${orderCode}`, {
      roleFallback,
    }),

  // 5. Lấy danh sách Lệnh của tôi (hỗ trợ lọc theo thợ / xe)
  getMyWorkOrders: (params?: { technician_id?: string; license_plate?: string; all?: boolean }) => {
    let url = `/work-orders/my-orders`;
    const q = new URLSearchParams();
    if (params?.technician_id) q.set("technician_id", params.technician_id);
    if (params?.license_plate) q.set("license_plate", params.license_plate);
    if (params?.all) q.set("all", "true");
    const qs = q.toString();
    if (qs) url += `?${qs}`;
    return fetchApi<{ success: boolean; data: any[] }>(url, {
      roleFallback: "SERVICE_ADVISOR",
    });
  },

  // 5.0. Quản đốc & Chủ gara theo dõi tải công việc kỹ thuật viên
  getTechniciansWorkload: () =>
    fetchApi<{ success: boolean; data: any[] }>(`/work-orders/technicians-workload`, {
      roleFallback: "WORKSHOP_MANAGER",
    }),

  // 5.0.1. Dashboard Kỹ thuật viên (Xe đang làm, Lịch sử đã hoàn thành, Hàng đợi xe chờ)
  getTechnicianDashboard: (techId: string) =>
    fetchApi<{
      success: boolean;
      data: {
        active_orders: any[];
        completed_orders: any[];
        waiting_queue: any[];
        stats: {
          active_count: number;
          max_allowed: number;
          total_completed: number;
          today_completed: number;
        };
      };
    }>(`/work-orders/technicians/${techId}/dashboard`, {
      roleFallback: "TECHNICIAN",
    }),

  // 5.1. Khởi tạo Lệnh sửa chữa mới lên MongoDB
  createWorkOrder: (payload: {
    license_plate: string;
    customer_phone: string;
    customer_name?: string;
    customer_email?: string;
    vehicle_model?: string;
    items?: any[];
  }) =>
    fetchApi<{ success: boolean; data: any }>(`/work-orders`, {
      method: "POST",
      roleFallback: "SERVICE_ADVISOR",
      body: JSON.stringify(payload),
    }),

  // 5.2. Cập nhật bảng báo giá dịch vụ của Lệnh sửa chữa
  updateEstimate: (orderCode: string, items: any[]) =>
    fetchApi<{ success: boolean; data: any }>(`/work-orders/${orderCode}/estimate`, {
      method: "PUT",
      roleFallback: "SERVICE_ADVISOR",
      body: JSON.stringify({ items }),
    }),

  // 5.3. Quản đốc phân công Kỹ thuật viên & Khoang nâng trên Kanban
  assignWorkOrder: (orderCode: string, payload: {
    technician_name: string;
    technician_id?: string;
    bay?: string;
    priority?: "normal" | "urgent";
    estimated_time?: string;
  }) =>
    fetchApi<{ success: boolean; data: any }>(`/work-orders/${orderCode}/assign`, {
      method: "PATCH",
      roleFallback: "WORKSHOP_MANAGER",
      body: JSON.stringify(payload),
    }),

  // 6. Lấy kho phụ tùng OEM có hỗ trợ phân trang & tìm kiếm
  getInventory: (limit = 15, page = 1, category?: string, search?: string) => {
    let url = `/inventory?limit=${limit}&page=${page}`;
    if (category && category !== "all") url += `&category=${encodeURIComponent(category)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return fetchApi<{ success: boolean; data: any }>(url, {
      roleFallback: "WORKSHOP_MANAGER",
    });
  },

  // 7. Tạo URL thanh toán VNPay Sandbox thật
  createPaymentUrl: (orderCode: string, bankCode?: string) =>
    fetchApi<{
      success: boolean;
      data: {
        payment_url: string;
        order_code: string;
        amount: number;
        transaction_id: string;
      };
    }>(`/payments/create-payment-url`, {
      method: "POST",
      roleFallback: "CUSTOMER",
      body: JSON.stringify({ order_code: orderCode, bank_code: bankCode }),
    }),

  // 7.1. Xác nhận thanh toán VietQR / Ngân hàng chính thức (Ghi sổ PG & Trừ kho Mongo)
  confirmPayment: (orderCode: string, paymentMethod = "VIETQR", bankCode = "MB") =>
    fetchApi<{ success: boolean; data: any }>(`/payments/confirm`, {
      method: "POST",
      roleFallback: "CUSTOMER",
      body: JSON.stringify({ order_code: orderCode, payment_method: paymentMethod, bank_code: bankCode }),
    }),

  // 8. Cập nhật tiến độ, ảnh nghiệm thu & checklist của thợ
  updateProgress: (
    orderCode: string,
    payload: { stage_name?: string; percent_complete?: number; note?: string; photo_urls?: any[]; tasks?: any[] }
  ) =>
    fetchApi<{ success: boolean; data: any }>(`/work-orders/${orderCode}/progress`, {
      method: "POST",
      roleFallback: "TECHNICIAN",
      body: JSON.stringify(payload),
    }),

  // 8.1. Chuyển trạng thái quy trình Lệnh sửa chữa (State Machine Guard)
  updateStatus: (orderCode: string, next_status: string, note?: string) =>
    fetchApi<{ success: boolean; data: any }>(`/work-orders/${orderCode}/status`, {
      method: "PATCH",
      roleFallback: "WORKSHOP_MANAGER",
      body: JSON.stringify({ next_status, note }),
    }),

  // 9. Chẩn đoán AI Graph-RAG Gemini
  diagnoseAI: (vehicleModel: string, symptoms: string) =>
    fetchApi<{ success: boolean; data: any }>(`/ai/diagnose`, {
      method: "POST",
      body: JSON.stringify({ vehicle_model: vehicleModel, symptoms }),
    }),

  // 10. Quản lý phiên làm việc
  getValidToken,
  getCurrentUser,
  clearSession,
};

export default api;
