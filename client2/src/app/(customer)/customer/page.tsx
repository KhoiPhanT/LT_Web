"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Car, Award, Calendar, FileText, ChevronRight, ShieldCheck, Clock, ArrowRight, Loader2, CheckCircle2, CreditCard } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { api, getCurrentUser } from "@/lib/api";

export default function CustomerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    async function loadCustomerVehicle() {
      try {
        setLoading(true);
        // Tự động nạp Lệnh sửa chữa thật của chính khách hàng này từ MongoDB
        const resList = await api.getMyWorkOrders();
        if (resList.success && Array.isArray(resList.data) && resList.data.length > 0) {
          setOrder(resList.data[0]);
        }
      } catch (err: any) {
        console.warn("Chưa tải được profile xe:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadCustomerVehicle();
  }, []);

  const plateNumber = order?.license_plate || user?.license_plate || "HỒ SƠ XE";
  const vehicleModel = order?.vehicle_model || (plateNumber !== "HỒ SƠ XE" ? `Xe Ô Tô (${plateNumber})` : "Xe Của Quý Khách");
  const customerName = order?.customer_name || user?.full_name || "Quý Khách";
  const totalAmount = order?.estimate?.total_amount || 0;
  const orderCode = order?.order_code || "";
  const isPaid = order?.payment_status === "PAID" || order?.current_status === "PAID";

  return (
    <div className="space-y-8 font-sans pb-16">
      
      {/* Header Profile Xe & Hạng VIP */}
      <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-5">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-bold shrink-0">
            <Car className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                {vehicleModel}
              </h1>
              <span className="px-2.5 py-0.5 sm:py-1 text-xs font-mono font-bold rounded-lg bg-slate-100 text-slate-800 border border-slate-300 shrink-0">
                {plateNumber}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>Chủ sở hữu: <strong className="text-slate-800">{customerName}</strong></span>
              <span>•</span>
              <span>SĐT: <strong className="font-mono text-slate-800">{order?.customer_phone || "0912 345 678"}</strong></span>
              <span>•</span>
              <span>Số khung VIN: <span className="font-mono">VN123456789</span></span>
              <span>•</span>
              <span>Trạng thái xe: <strong className="text-emerald-600">{isPaid ? "Đã Quyết Toán Xong" : "Đang Bảo Dưỡng"}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-amber-50 border border-amber-200 self-start md:self-auto shrink-0">
          <Award className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600 shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-700">Hạng Thành Viên</div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900">VIP GOLD (Ưu đãi 5% Công)</div>
          </div>
        </div>
      </div>

      {/* Banner Trạng Thái Lệnh Sửa Chữa Hiện Tại */}
      {isPaid ? (
        <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-emerald-50/80 border-2 border-emerald-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-emerald-600 text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> ĐÃ THANH TOÁN THÀNH CÔNG
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                Mã: {orderCode}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Lệnh #{orderCode} Đã Quyết Toán & Sẵn Sàng Bàn Giao Xe
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Quý khách đã thanh toán toàn bộ chi phí {formatCurrencyVND(totalAmount)} qua VietQR MB Bank. Xe đã hoàn tất kiểm định an toàn và chuyển vào lịch sử bảo dưỡng.
            </p>
          </div>

          <Link href={`/customer/orders/${orderCode}`}>
            <button className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2">
              Xem Chi Tiết Biên Lai
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </Link>
        </div>
      ) : order?.current_status === "COMPLETED" || order?.current_status === "PAYMENT_PENDING" ? (
        <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-2 border-emerald-500/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-emerald-600 text-white flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> HOÀN TẤT THI CÔNG • SẴN SÀNG THANH TOÁN
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                Mã: {orderCode}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Kỹ Thuật Viên Đã Nghiệm Thu KCS Đạt Chuẩn 100%
            </h2>
            <p className="text-xs text-slate-600">
              Tất cả các hạng mục bảo dưỡng và thay thế phụ tùng đã hoàn thành. Quý khách vui lòng tiến hành thanh toán quyết toán để nhận xe. Tổng chi phí: <strong className="text-emerald-700 font-mono text-sm">{formatCurrencyVND(totalAmount)}</strong>.
            </p>
          </div>

          <Link href={`/customer/payment/${orderCode}`}>
            <button className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition shadow-md shadow-emerald-600/30 active:scale-95 flex items-center gap-2 animate-pulse">
              <CreditCard className="w-4 h-4 text-white" />
              Thanh Toán Ngay
              <ArrowRight className="w-4 h-4 ml-1 text-white" />
            </button>
          </Link>
        </div>
      ) : order?.current_status === "IN_PROGRESS" || order?.current_status === "QUALITY_CHECK" ? (
        <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-transparent border-2 border-cyan-500/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-cyan-600 text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                ĐANG THI CÔNG SỬA CHỮA ({order?.progress_percent || 60}%)
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                Mã: {orderCode}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Đội Ngũ Kỹ Thuật Viên Đang Thi Công Tại Khoang Nâng
            </h2>
            <p className="text-xs text-slate-600">
              Xe đang được thực hiện bảo dưỡng theo các hạng mục quý khách đã phê duyệt. Theo quy chuẩn 4S, nút thanh toán sẽ mở sau khi kỹ thuật viên hoàn tất 100% và kiểm định an toàn KCS.
            </p>
          </div>

          <Link href={`/customer/orders/${orderCode}`}>
            <button className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-cyan-400 font-black text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2">
              Xem Tiến Độ Khoang Nâng
              <ArrowRight className="w-4 h-4 ml-1 text-cyan-400" />
            </button>
          </Link>
        </div>
      ) : (
        <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-500/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-amber-500 text-slate-950">
                {order?.current_status === "WAITING_PARTS" ? "ĐÃ DUYỆT • CHỜ VẬT TƯ & THI CÔNG" : "CẦN DUYỆT BÁO GIÁ ONLINE"}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                Mã: {orderCode}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Báo Giá Dịch Vụ Bảo Dưỡng Định Kỳ & Sửa Chữa
            </h2>
            <p className="text-xs text-slate-600">
              {order?.current_status === "WAITING_PARTS"
                ? "Quý khách đã ký duyệt báo giá. Kho vật tư đang cấp phát và điều phối xe vào khoang nâng thi công."
                : `Cố vấn dịch vụ đã gửi báo giá chi tiết. Tổng chi phí dự toán: `}
              <strong className="text-amber-600 font-mono text-sm">{formatCurrencyVND(totalAmount)}</strong>.
            </p>
          </div>

          <Link href={`/customer/orders/${orderCode}`}>
            <button className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-md shadow-amber-500/20 active:scale-95 flex items-center gap-2">
              {order?.current_status === "WAITING_PARTS" ? "Xem Chi Tiết Lệnh" : "Xem & Ký Duyệt Báo Giá"}
              <ArrowRight className="w-4 h-4 ml-1 text-slate-950" />
            </button>
          </Link>
        </div>
      )}

      {/* Sổ Bảo Dưỡng Điện Tử (Electronic Maintenance Ledger) */}
      <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Sổ Bảo Dưỡng Trọn Đời (Lịch Sử Sửa Chữa Theo Xe)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Lịch sử các lần làm dịch vụ tại trung tâm, tự động ghi sổ và lưu trữ vĩnh viễn trên hệ thống.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-600 flex items-center gap-1 font-bold">
            <ShieldCheck className="w-4 h-4" /> Đã Xác Thực Chuẩn 4S
          </span>
        </div>

        <div className="space-y-3">
          {/* Lệnh vừa thanh toán được tự động đẩy lên đầu danh sách lịch sử */}
          {isPaid && (
            <Link
              href={`/customer/orders/${orderCode}`}
              className="p-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 flex items-center justify-between transition group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-extrabold text-slate-900">{orderCode}</span>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> VỪA QUYẾT TOÁN
                  </span>
                </div>
                <div className="text-xs text-slate-700 font-medium">
                  Bảo dưỡng 40.000km & Thay má phanh Akebono Ceramic (Đã xuất hóa đơn điện tử)
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-black text-sm text-emerald-700">{formatCurrencyVND(totalAmount)}</div>
                <div className="text-[11px] text-slate-500 font-medium">Hôm nay • Đã thanh toán</div>
              </div>
            </Link>
          )}

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-800">WO-20260415-0042</span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">HOÀN TẤT</span>
              </div>
              <div className="text-xs text-slate-600">
                Bảo dưỡng Cấp 30.000km: Thay dầu 0W-20, lọc dầu, vệ sinh hệ thống phanh.
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-sm text-slate-800">{formatCurrencyVND(1650000)}</div>
              <div className="text-[11px] text-slate-500">15/04/2026</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">WO-20251010-0019</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">HOÀN TẤT</span>
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                Bảo dưỡng Cấp 20.000km: Cân mâm bấm chì 4 bánh, thay lọc gió điều hòa than hoạt tính.
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-sm text-zinc-800 dark:text-zinc-200">{formatCurrencyVND(1120000)}</div>
              <div className="text-[11px] text-zinc-400">10/10/2025</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
