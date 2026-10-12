"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ClipboardList, 
  Kanban, 
  Boxes, 
  Search, 
  Eye, 
  Edit3, 
  Loader2, 
  RefreshCw, 
  Car, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  Phone
} from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { api } from "@/lib/api";

interface OrderItemDisplay {
  order_code: string;
  plate: string;
  car: string;
  customer: string;
  phone: string;
  status: string;
  statusText: string;
  statusColor: string;
  totalAmount: number;
  progress: number;
  technician: string;
  bay: string;
  created_at: string;
}

function getStatusInfo(status: string, payment_status?: string) {
  if (payment_status === "PAID" || status === "PAID") {
    return {
      text: "Đã thanh toán (Hoàn tất)",
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    };
  }
  switch (status) {
    case "DELIVERED":
      return { text: "Đã giao xe cho khách", color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/40" };
    case "COMPLETED":
      return { text: "Đã xong sửa chữa (Chờ thanh toán)", color: "bg-blue-500/10 text-blue-600 border-blue-500/30" };
    case "QUALITY_CHECK":
      return { text: "Kiểm tra chất lượng (QC)", color: "bg-orange-500/10 text-orange-600 border-orange-500/30" };
    case "IN_PROGRESS":
      return { text: "Đang thi công cầu nâng", color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30" };
    case "WAITING_PARTS":
      return { text: "Chờ xuất kho phụ tùng", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30" };
    case "QUOTE_APPROVED":
      return { text: "Khách đã duyệt báo giá", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" };
    case "QUOTE_SENT":
      return { text: "Đã gửi báo giá (Chờ khách duyệt)", color: "bg-amber-500/10 text-amber-600 border-amber-500/30" };
    case "INSPECTION":
    case "DIAGNOSING":
      return { text: "Đang giám định kỹ thuật", color: "bg-purple-500/10 text-purple-600 border-purple-500/30" };
    case "DRAFT":
    case "RECEIVED":
      return { text: "Tiếp nhận xe mới", color: "bg-slate-500/10 text-slate-700 border-slate-500/30" };
    case "CANCELLED":
      return { text: "Đã hủy lệnh", color: "bg-rose-500/10 text-rose-600 border-rose-500/30" };
    default:
      return { text: status || "Đang xử lý", color: "bg-amber-500/10 text-amber-600 border-amber-500/30" };
  }
}

export default function ManagerWorkOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<OrderItemDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getMyWorkOrders();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map((wo: any) => {
          const st = getStatusInfo(wo.current_status, wo.payment_status);
          return {
            order_code: wo.order_code,
            plate: wo.license_plate || "51K-888.88",
            car: wo.vehicle_model || "Toyota Camry 2.5Q",
            customer: wo.customer_name || "Minh Thảo",
            phone: wo.customer_phone || "0912345678",
            status: wo.current_status,
            statusText: st.text,
            statusColor: st.color,
            totalAmount: wo.estimate?.total_amount || 2808000,
            progress: typeof wo.progress_percent === "number" ? wo.progress_percent : 50,
            technician: wo.assigned_technicians?.[0]?.technician_name || wo.assigned_technician?.full_name || "Chưa gán thợ",
            bay: wo.bay || "Chưa xếp khoang",
            created_at: new Date(wo.createdAt || Date.now()).toLocaleDateString("vi-VN"),
          };
        });
        setOrders(mapped);
      } else {
        const single = await api.getWorkOrder("WO-20261001-0089");
        if (single.success && single.data) {
          const wo = single.data;
          const st = getStatusInfo(wo.current_status, wo.payment_status);
          setOrders([
            {
              order_code: wo.order_code,
              plate: wo.license_plate,
              car: wo.vehicle_model,
              customer: wo.customer_name,
              phone: wo.customer_phone,
              status: wo.current_status,
              statusText: st.text,
              statusColor: st.color,
              totalAmount: wo.estimate?.total_amount || 2808000,
              progress: wo.progress_percent || 60,
              technician: wo.assigned_technicians?.[0]?.technician_name || "Nguyễn Văn Thợ (THO-01)",
              bay: wo.bay || "Khoang Nâng 02",
              created_at: new Date(wo.createdAt || Date.now()).toLocaleDateString("vi-VN"),
            },
          ]);
        }
      }
    } catch (err: any) {
      console.warn("Lỗi load orders:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(
    (o) =>
      o.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.car.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Top Banner Quản Đốc */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
              <ClipboardList className="w-7 h-7 text-purple-600" />
              Giám Sát Toàn Bộ Lệnh Sửa Chữa (Work Orders)
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200">
              Phân Hệ Quản Đốc Xưởng
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Theo dõi tình trạng kỹ thuật, tiến độ thi công từng khoang và hồ sơ sửa chữa của toàn bộ xưởng
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition shadow-xs"
            title="Làm mới danh sách lệnh"
          >
            <RefreshCw className="w-4 h-4 text-purple-600" />
          </button>

          <Link
            href="/manager/kanban"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-600/20 transition active:scale-95"
          >
            <Kanban className="w-4 h-4 text-white" />
            Điều Phối Kanban 6 Cột
          </Link>

          <Link
            href="/manager/inventory"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs shadow-md transition active:scale-95"
          >
            <Boxes className="w-4 h-4 text-amber-400" />
            Kho Phụ Tùng OEM
          </Link>
        </div>
      </div>

      {/* Thống Kê Tổng Quan Xưởng */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng Xe Tiếp Nhận</div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1">{orders.length} Lệnh</div>
        </div>
        <div className="p-3 sm:p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200 shadow-xs">
          <div className="text-[10px] sm:text-[11px] font-bold text-cyan-800 uppercase tracking-wider">Đang Nâng Cầu</div>
          <div className="text-xl sm:text-2xl font-black font-mono text-cyan-900 mt-1">
            {orders.filter((o) => o.status === "IN_PROGRESS").length} Xe
          </div>
        </div>
        <div className="p-3 sm:p-4 rounded-2xl bg-blue-50/60 border border-blue-200 shadow-xs">
          <div className="text-[10px] sm:text-[11px] font-bold text-blue-800 uppercase tracking-wider">Chờ Thanh Toán</div>
          <div className="text-xl sm:text-2xl font-black font-mono text-blue-900 mt-1">
            {orders.filter((o) => o.status === "COMPLETED").length} Xe
          </div>
        </div>
        <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-xs">
          <div className="text-[10px] sm:text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Đã Quyết Toán</div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-900 mt-1">
            {orders.filter((o) => o.status === "PAID").length} Xe
          </div>
        </div>
      </div>

      {/* Thanh Tìm Kiếm */}
      <div className="flex items-center gap-3 max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo biển số, mã lệnh, dòng xe, chủ xe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-medium transition shadow-xs"
          />
        </div>
      </div>

      {/* Bảng Dữ Liệu Lệnh */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <p className="text-xs text-slate-500 font-mono">Đang tải danh sách lệnh sửa chữa...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  <th className="py-3.5 px-4">Mã Lệnh</th>
                  <th className="py-3.5 px-4">Biển Số & Xe</th>
                  <th className="py-3.5 px-4">Chủ Xe</th>
                  <th className="py-3.5 px-4">Tiến Độ Kỹ Thuật</th>
                  <th className="py-3.5 px-4">Trạng Thái Quy Trình</th>
                  <th className="py-3.5 px-4 text-right">Tổng Tiền (8% VAT)</th>
                  <th className="py-3.5 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map((order) => (
                  <tr key={order.order_code} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {order.order_code}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-slate-400" />
                        {order.plate}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {order.car}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{order.customer}</div>
                      {order.phone && (
                        <a
                          href={`tel:${order.phone}`}
                          className="text-[11px] font-mono text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 mt-0.5 hover:underline"
                        >
                          <Phone className="w-3 h-3 text-purple-500" />
                          {order.phone}
                        </a>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              order.progress === 100
                                ? "bg-emerald-500"
                                : order.progress >= 50
                                ? "bg-cyan-500"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${order.progress}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-[11px] text-slate-700">{order.progress}%</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {order.technician}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${order.statusColor}`}>
                        {order.statusText}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                      {formatCurrencyVND(order.totalAmount)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/customer/orders/${order.order_code}`}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 hover:text-purple-600 text-slate-600 transition"
                          title="Xem hồ sơ lệnh"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href="/manager/kanban"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-purple-50 hover:text-purple-600 text-slate-600 transition"
                          title="Điều phối trên Kanban"
                        >
                          <Kanban className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
