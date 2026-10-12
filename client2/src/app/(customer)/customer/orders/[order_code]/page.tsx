"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  FileText, 
  CheckCircle2, 
  Circle, 
  Clock, 
  CreditCard, 
  Camera, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  Loader2,
  XCircle,
  X,
  PhoneCall
} from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { api, fetchApi } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  params: {
    order_code: string;
  };
}

interface EstimateItem {
  part_code?: string;
  name: string;
  type: "PART" | "LABOR";
  quantity: number;
  unit_price: number;
  total_price?: number;
  selected?: boolean;
}

interface TimelineItem {
  status: string;
  updated_by?: string;
  note?: string;
  updated_at?: string;
}

interface PhotoItem {
  url: string;
  caption?: string;
  uploaded_at?: string;
}

export default function WorkOrderDetailPage({ params }: Props) {
  const orderCode = params.order_code || "WO-20261001-0089";

  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [approved, setApproved] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectAction, setRejectAction] = useState<"REVISE" | "CANCEL">("REVISE");
  const [isRejecting, setIsRejecting] = useState(false);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  // Tải dữ liệu thật từ Backend API
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        let wo: any = null;
        try {
          const res = await api.getWorkOrder(orderCode);
          if (res.success && res.data) {
            wo = res.data;
          }
        } catch (fetchErr) {
          // Nếu không lấy được mã này (ví dụ link cũ hoặc xe khác), lấy lệnh của chính khách hàng
          const myOrders = await api.getMyWorkOrders();
          if (myOrders.success && Array.isArray(myOrders.data) && myOrders.data.length > 0) {
            wo = myOrders.data[0];
          }
        }

        if (wo) {
          setOrderData(wo);
          if (wo.estimate?.items && wo.estimate.items.length > 0) {
            setItems(
              wo.estimate.items.map((i: any) => ({
                ...i,
                selected: typeof i.selected === "boolean" ? i.selected : true,
              }))
            );
          }
          if (
            wo.estimate?.approval_status === "APPROVED" || 
            (wo.current_status !== "QUOTE_SENT" && wo.current_status !== "DRAFT" && wo.current_status !== "INSPECTION" && wo.current_status !== "CANCELLED")
          ) {
            setApproved(true);
          }
          if (wo.estimate?.approval_status === "REJECTED" || wo.current_status === "CANCELLED") {
            setRejected(true);
          }
          if (wo.workflow_timeline) {
            setTimeline(wo.workflow_timeline);
          }
          if (wo.inspection_photos) {
            setPhotos(wo.inspection_photos);
          }
        }
      } catch (err: any) {
        console.warn("Chưa tải được từ API:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [orderCode]);

  // Toggle chọn từng hạng mục báo giá
  const toggleItem = (idx: number) => {
    if (approved) return;
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, selected: !item.selected } : item))
    );
  };

  // Tính toán tài chính thời gian thực theo đúng công thức SRS
  const selectedItems = items.filter((i) => i.selected);
  const pretaxAmount = selectedItems.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  const vatAmount = Math.round(pretaxAmount * 0.08); // VAT 8%
  const totalAmount = pretaxAmount + vatAmount;

  // Xử lý ký duyệt điện tử và gửi API thật
  const handleApprove = async () => {
    try {
      const selectedCodes = items.filter((i) => i.selected).map((i) => i.part_code).filter(Boolean);
      const res = await fetchApi<{ success: boolean; data: any }>(`/work-orders/${orderCode}/approve-estimate`, {
        method: "POST",
        body: JSON.stringify({ selected_item_codes: selectedCodes }),
        roleFallback: "CUSTOMER",
      });
      if (res.success && res.data) {
        setOrderData(res.data);
        setApproved(true);
        setRejected(false);
        if (res.data.workflow_timeline) {
          setTimeline(res.data.workflow_timeline);
        }
        toast.success("🎉 Ký duyệt báo giá thành công! Lệnh đã được chuyển tới xưởng để bắt đầu thi công.");
      } else {
        setApproved(true);
        setRejected(false);
        toast.success("Ký duyệt báo giá thành công!");
      }
    } catch (err: any) {
      toast.error(err.message || "Không thể ký duyệt báo giá. Vui lòng thử lại!");
    }
  };

  // Xử lý từ chối báo giá và gửi API thật
  const handleReject = async (action: "REVISE" | "CANCEL", reasonText: string) => {
    try {
      setIsRejecting(true);
      const res = await fetchApi<{ success: boolean; data: any }>(`/work-orders/${orderCode}/reject-estimate`, {
        method: "POST",
        body: JSON.stringify({ 
          reason: reasonText,
          action 
        }),
        roleFallback: "CUSTOMER",
      });
      if (res.success && res.data) {
        setOrderData(res.data);
        setRejected(true);
        setApproved(false);
        setShowRejectModal(false);
        if (res.data.workflow_timeline) {
          setTimeline(res.data.workflow_timeline);
        }
        if (action === "CANCEL") {
          toast.success("Đã ghi nhận yêu cầu hủy lệnh sửa chữa của quý khách.");
        } else {
          toast.success("Đã gửi phản hồi từ chối báo giá! Cố vấn dịch vụ sẽ liên hệ lại với quý khách.");
        }
      } else {
        setRejected(true);
        setApproved(false);
        setShowRejectModal(false);
        toast.success("Đã gửi phản hồi từ chối báo giá!");
      }
    } catch (err: any) {
      toast.error(err.message || "Không thể gửi phản hồi. Vui lòng thử lại!");
    } finally {
      setIsRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs text-muted-foreground font-mono">Đang tải hồ sơ sửa chữa #{orderCode}...</p>
        </div>
      </div>
    );
  }

  const plateNumber = orderData?.license_plate || "51K-888.88";
  const vehicleModel = orderData?.vehicle_model || "Toyota Camry 2.5Q";
  const customerName = orderData?.customer_name || "Minh Thảo";
  const currentStatus = orderData?.current_status || (approved ? "WAITING_PARTS" : "QUOTE_SENT");
  const isPaid = orderData?.payment_status === "PAID" || currentStatus === "PAID" || currentStatus === "DELIVERED";
  const isCompleted = currentStatus === "COMPLETED" || currentStatus === "PAYMENT_PENDING";
  const isInProgress = currentStatus === "IN_PROGRESS" || currentStatus === "QUALITY_CHECK";
  const isWaitingParts = currentStatus === "WAITING_PARTS" || currentStatus === "QUOTE_APPROVED" || currentStatus === "APPROVED";

  return (
    <div className="space-y-8 font-sans pb-16">
      
      {/* Top Banner Lệnh Sửa Chữa */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 font-mono">
              {orderCode}
            </h1>
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
              orderData?.current_status === "CANCELLED"
                ? "bg-rose-100 text-rose-800 border border-rose-300 font-extrabold"
                : rejected && !approved
                ? "bg-rose-100 text-rose-800 border border-rose-300 font-extrabold"
                : isPaid
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : isCompleted
                ? "bg-emerald-50 text-emerald-700 border border-emerald-300 font-extrabold"
                : isInProgress
                ? "bg-cyan-100 text-cyan-800 border border-cyan-300"
                : isWaitingParts
                ? "bg-blue-100 text-blue-800 border border-blue-300"
                : "bg-amber-100 text-amber-800 border border-amber-300"
            }`}>
              {orderData?.current_status === "CANCELLED"
                ? "ĐÃ HỦY LỆNH SỬA CHỮA (CANCELLED)"
                : rejected && !approved
                ? "TỪ CHỐI BÁO GIÁ • CHỜ TƯ VẤN LẠI"
                : isPaid
                ? "ĐÃ THANH TOÁN (PAID)"
                : isCompleted
                ? "HOÀN TẤT THI CÔNG • CHỜ THANH TOÁN (COMPLETED)"
                : isInProgress
                ? `ĐANG THI CÔNG SỬA CHỮA (${orderData?.progress_percent || 60}%)`
                : isWaitingParts
                ? "ĐÃ DUYỆT • CHỜ VẬT TƯ & XẾP KHOANG"
                : "CHỜ PHÊ DUYỆT BÁO GIÁ (QUOTE_SENT)"}
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Phương tiện: <strong className="text-slate-900">{vehicleModel}</strong> • Biển số: <strong className="font-mono text-slate-900">{plateNumber}</strong> • Chủ xe: <strong className="text-slate-900">{customerName}</strong> {orderData?.customer_phone ? <>• SĐT: <strong className="font-mono text-slate-900">{orderData.customer_phone}</strong></> : null}
          </p>
        </div>

        {isPaid ? (
          <div className="px-5 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-extrabold text-xs flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>ĐÃ THANH TOÁN ({formatCurrencyVND(totalAmount)})</span>
          </div>
        ) : isCompleted ? (
          <Link href={`/customer/payment/${orderCode}`}>
            <button className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition shadow-md shadow-emerald-600/30 active:scale-95 flex items-center gap-2 animate-pulse">
              <CreditCard className="w-4 h-4 text-white" />
              Thanh Toán Quyết Toán Ngay ({formatCurrencyVND(totalAmount)})
            </button>
          </Link>
        ) : isInProgress ? (
          <div className="px-4 py-2.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-800 font-bold text-xs flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
            <span>KỸ THUẬT VIÊN ĐANG THI CÔNG ({orderData?.progress_percent || 60}%)</span>
          </div>
        ) : isWaitingParts ? (
          <div className="px-4 py-2.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 font-bold text-xs flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>ĐÃ DUYỆT BÁO GIÁ • CHỜ VẬT TƯ & THI CÔNG</span>
          </div>
        ) : null}
      </div>

      {/* Cảnh báo tiến độ / Giải thích quy trình chuẩn */}
      {!isPaid && !isCompleted && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <strong>Quy chuẩn dịch vụ gara 4S:</strong> Quý khách chỉ thanh toán sau khi đội ngũ kỹ thuật viên hoàn thành 100% các công đoạn sửa chữa và xe đạt nghiệm thu an toàn KCS. Nút thanh toán sẽ tự động kích hoạt ngay khi xe hoàn tất.
          </div>
        </div>
      )}
      {isCompleted && !isPaid && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong>Kỹ thuật viên đã hoàn tất sửa chữa 100% & Nghiệm thu KCS đạt chuẩn!</strong> Quý khách có thể tiến hành quyết toán thanh toán ngay bây giờ.
            </div>
          </div>
          <Link href={`/customer/payment/${orderCode}`}>
            <button className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition shrink-0">
              Thanh Toán Ngay
            </button>
          </Link>
        </div>
      )}

      {/* Bảng Báo Giá Động Từng Phần (Granular Approval) */}
      <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-white dark:bg-brand-cardDark border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Chi Tiết Báo Giá Động (Thuế VAT 8% Nghị định 44/2023)
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Khách hàng có toàn quyền bấm chọn hoặc bỏ chọn từng phụ tùng/dịch vụ trước khi ký duyệt
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl self-start sm:self-auto shrink-0">
            {selectedItems.length}/{items.length} Hạng Mục Chọn
          </span>
        </div>

        {/* Danh Sách Hạng Mục Tương Tác */}
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => toggleItem(idx)}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 ${
                item.selected 
                  ? "bg-amber-50/50 dark:bg-amber-500/5 border-amber-500/30 dark:border-amber-500/30" 
                  : "bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 opacity-60"
              }`}
            >
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <div className="text-amber-500 shrink-0 mt-0.5 sm:mt-0">
                  {item.selected ? (
                    <CheckCircle2 className="w-5 h-5 fill-amber-500 text-white dark:text-zinc-950" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                      {item.name}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                      {item.type === "PART" ? "Phụ Tùng" : "Tiền Công"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">
                    Mã: {item.part_code || "GENERIC"} • Số lượng: {item.quantity}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800/80 flex sm:flex-col justify-between items-baseline sm:items-end">
                <p className="font-bold text-sm font-mono text-zinc-900 dark:text-zinc-100">
                  {formatCurrencyVND(item.unit_price * item.quantity)}
                </p>
                <p className="text-[10px] text-zinc-400 font-mono">
                  {formatCurrencyVND(item.unit_price)}/đv
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bảng Tổng Hợp Tài Chính */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-end justify-between gap-6">
          <div className="space-y-1 text-xs text-zinc-500">
            <p className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Cam kết 100% phụ tùng chính hãng OEM đạt tiêu chuẩn kiểm định an toàn
            </p>
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Thời gian bảo hành dịch vụ & linh kiện: 12 tháng hoặc 20.000 KM
            </p>
          </div>

          <div className="w-full md:w-80 space-y-2 bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-sm">
            <div className="flex justify-between text-zinc-500">
              <span>Tổng tiền trước thuế:</span>
              <span className="font-mono">{formatCurrencyVND(pretaxAmount)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Thuế GTGT (VAT 8%):</span>
              <span className="font-mono">{formatCurrencyVND(vatAmount)}</span>
            </div>
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between font-bold text-base text-zinc-900 dark:text-zinc-100">
              <span>Tổng thanh toán:</span>
              <span className="font-mono text-amber-500 text-lg">
                {formatCurrencyVND(totalAmount)}
              </span>
            </div>

            {!approved && !rejected ? (
              <div className="space-y-2 mt-3">
                <button 
                  onClick={handleApprove}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition shadow-amber-glow active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Ký Duyệt Báo Giá Điện Tử (1-Click)
                </button>

                <button 
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  className="w-full py-2.5 rounded-xl border border-rose-200 hover:border-rose-400 hover:bg-rose-50 text-rose-600 font-bold text-xs uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4 text-rose-500" />
                  Từ Chối / Yêu Cầu Báo Giá Lại
                </button>
              </div>
            ) : rejected && !approved ? (
              <div className="mt-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-rose-700">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Quý khách đã từ chối báo giá</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Cố vấn dịch vụ đang tiếp nhận và sẽ liên hệ lại với quý khách để điều chỉnh phương án chi phí.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setRejected(false);
                    setShowRejectModal(false);
                  }}
                  className="w-full py-1.5 rounded-lg bg-white border border-rose-300 hover:bg-rose-100/50 text-rose-700 font-bold text-[11px] transition shadow-2xs"
                >
                  Xem lại & Ký duyệt nếu đổi ý
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Tiến Độ Thi Công & Ảnh Nghiệm Thu Thực Tế */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Timeline Trạng Thái Thi Công */}
        <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-white dark:bg-brand-cardDark border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Tiến Độ Thi Công Realtime (Socket.io)
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              Live Cầu Nâng #02
            </span>
          </div>

          <div className="space-y-4">
            {timeline.length > 0 ? (
              timeline.map((step, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-emerald-500 text-white font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {step.status} {step.updated_by ? `• ${step.updated_by}` : ""}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">{step.note || "Đã cập nhật tiến độ"}</p>
                    {step.updated_at && (
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        {new Date(step.updated_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400">Đang khởi tạo quy trình thi công...</p>
            )}
          </div>
        </div>

        {/* Ảnh Nghiệm Thu Từ Khoang Nâng (Evidence Photos) */}
        <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-white dark:bg-brand-cardDark border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-500" />
              Ảnh Chụp Nghiệm Thu Từ Kỹ Thuật Viên ({photos.length} ảnh)
            </h3>
            <span className="text-xs text-zinc-400">Minh bạch 100%</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {photos.length > 0 ? (
              photos.map((p, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800">
                    <img
                      src={p.url}
                      alt={p.caption || "Ảnh nghiệm thu"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/inspection-sample.jpg";
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
                    {p.caption || "Ảnh thi công"}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-xs text-zinc-400">
                Thợ đang chuẩn bị chụp ảnh nghiệm thu khoang nâng...
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal Từ Chối Báo Giá / Yêu Cầu Tư Vấn Lại */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-slate-900">Từ Chối / Phản Hồi Báo Giá</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Quý khách chưa hài lòng với báo giá hiện tại? Vui lòng chọn lý do để Cố vấn dịch vụ hỗ trợ giải pháp tiết kiệm và phù hợp nhất cho quý khách:
            </p>

            {/* Quick chips lý do */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Lý do chính:</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Chi phí vượt quá ngân sách dự kiến",
                  "Chưa cần thiết làm một số hạng mục lúc này",
                  "Muốn đổi loại phụ tùng / thương hiệu khác",
                  "Cần Cố vấn gọi điện giải thích thêm",
                  "Muốn giảm bớt các khoản tiền công",
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setRejectReason(reason)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition text-left border ${
                      rejectReason === reason
                        ? "bg-rose-50 border-rose-400 text-rose-700 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            {/* Input ghi chú thêm */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Chi tiết yêu cầu của quý khách:</label>
              <textarea
                rows={3}
                placeholder="Nhập ghi chú hoặc mong muốn của quý khách (VD: Chỉ thay dầu và lọc nhớt trước, các món khác để kỳ sau...)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            {/* Lựa chọn hành động */}
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Hành động mong muốn:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRejectAction("REVISE")}
                  className={`p-3 rounded-xl border text-left transition ${
                    rejectAction === "REVISE"
                      ? "border-amber-500 bg-amber-50/70 text-amber-950 font-bold"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5 text-amber-600" /> Tư vấn & Báo giá lại
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Giữ lệnh, Cố vấn sẽ gọi lại và sửa đổi báo giá</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRejectAction("CANCEL")}
                  className={`p-3 rounded-xl border text-left transition ${
                    rejectAction === "CANCEL"
                      ? "border-rose-500 bg-rose-50/70 text-rose-950 font-bold"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" /> Hủy lệnh sửa chữa
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Hủy toàn bộ đơn và lấy lại xe về</p>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={isRejecting}
                onClick={() => handleReject(rejectAction, rejectReason)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm active:scale-95 flex items-center gap-1.5"
              >
                {isRejecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Xác Nhận Gửi Phản Hồi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
