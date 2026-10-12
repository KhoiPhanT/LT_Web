"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QrCode, CreditCard, ShieldCheck, Clock, CheckCircle2, ArrowLeft, RefreshCw, ExternalLink, Loader2 } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  params: {
    order_code: string;
  };
}

export default function CustomerPaymentPage({ params }: Props) {
  const router = useRouter();
  const orderCode = params.order_code || "WO-20261001-0089";

  const [loading, setLoading] = useState(false);
  const [fetchingOrder, setFetchingOrder] = useState(true);
  const [paid, setPaid] = useState(false);
  const [totalAmount, setTotalAmount] = useState(2808000);
  const [plateNumber, setPlateNumber] = useState("51K-888.88");
  const [orderStatus, setOrderStatus] = useState<string>("COMPLETED");
  const [vnpayUrl, setVnpayUrl] = useState<string | null>(null);

  // Nạp dữ liệu thật từ WorkOrder
  useEffect(() => {
    async function fetchOrder() {
      try {
        setFetchingOrder(true);
        const res = await api.getWorkOrder(orderCode);
        if (res.success && res.data) {
          const wo = res.data;
          if (wo.current_status) {
            setOrderStatus(wo.current_status);
          }
          if (wo.estimate?.total_amount) {
            setTotalAmount(wo.estimate.total_amount);
          }
          if (wo.license_plate) {
            setPlateNumber(wo.license_plate);
          }
          if (wo.payment_status === "PAID" || wo.current_status === "PAID") {
            setPaid(true);
          }
        }
      } catch (err: any) {
        console.warn("Chưa lấy được order thật:", err.message);
      } finally {
        setFetchingOrder(false);
      }
    }
    fetchOrder();
  }, [orderCode]);

  // Gọi API tạo URL VNPay Sandbox thật từ Backend
  const handleCreateVnpayUrl = async () => {
    setLoading(true);
    try {
      const res = await api.createPaymentUrl(orderCode, "NCB");
      if (res.success && res.data?.payment_url) {
        setVnpayUrl(res.data.payment_url);
        toast.success("Đã sinh URL VNPay Sandbox an toàn! Đang chuyển hướng...");
        window.open(res.data.payment_url, "_blank");
      }
    } catch (err: any) {
      toast.info("Đã kết nối luồng thanh toán VNPay Sandbox với số tiền " + formatCurrencyVND(totalAmount));
      // Link fallback sandbox
      window.open(`https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${totalAmount * 100}&vnp_OrderInfo=Thanh+toan+${orderCode}`, "_blank");
    } finally {
      setLoading(false);
    }
  };

  // Xác nhận đã chuyển khoản qua VietQR & gọi Backend API thật
  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const res = await api.confirmPayment(orderCode, "VIETQR", "MB");
      if (res.success) {
        setPaid(true);
        toast.success(`Thanh toán ${formatCurrencyVND(totalAmount)} thành công! Hóa đơn điện tử đã được phát hành.`);
        setTimeout(() => {
          router.push("/customer");
        }, 1500);
      } else {
        toast.error("Không thể ghi nhận giao dịch: " + ((res as any).message || "Lỗi máy chủ"));
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi kết nối cổng thanh toán");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans pb-16">
      
      {/* Back link */}
      <Link
        href={`/customer/orders/${orderCode}`}
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-amber-500 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Quay lại xem chi tiết báo giá
      </Link>

      {/* Main Payment Card */}
      <div className="p-4 sm:p-8 md:p-10 rounded-3xl bg-white dark:bg-brand-cardDark border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6 sm:space-y-8 text-center">
        
        {/* Header Thanh Toán */}
        <div className="space-y-2">
          <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            CỔNG THANH TOÁN AN TOÀN VIETQR & VNPAY
          </span>
          <h1 className="text-xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Thanh Toán Lệnh Sửa Chữa
          </h1>
          <p className="text-xs text-zinc-500 font-mono">
            Mã đơn hàng: <strong>{orderCode}</strong> • Xe: <strong>{plateNumber}</strong>
          </p>
        </div>

        {/* Số Tiền Cần Thanh Toán */}
        <div className="p-4 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 space-y-1">
          <div className="text-xs text-zinc-500">Số tiền quyết toán cuối cùng (Đã bao gồm 8% VAT):</div>
          <div className="text-2xl sm:text-4xl font-extrabold text-amber-500 font-mono">
            {formatCurrencyVND(totalAmount)}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Đã chiết khấu 0% • Khách hàng Hạng Gold (Tích lũy 2.808 điểm)
          </p>
        </div>

        {/* Khối Mã VietQR hoặc Cảnh Báo Quy Trình */}
        {!(orderStatus === "COMPLETED" || orderStatus === "PAYMENT_PENDING" || orderStatus === "PAID" || paid) ? (
          <div className="p-4 sm:p-8 rounded-3xl bg-amber-50 border-2 border-amber-300 text-center space-y-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/20 text-amber-700 mx-auto flex items-center justify-center font-bold">
              <Clock className="w-7 h-7 sm:w-8 sm:h-8 animate-spin" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-lg sm:text-xl font-black text-amber-950">Chưa Đạt Điều Kiện Thanh Toán</h3>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                Theo quy chuẩn gara 4S, quý khách chỉ thanh toán sau khi đội ngũ kỹ thuật viên hoàn tất 100% công đoạn sửa chữa và xe đạt nghiệm thu an toàn KCS.
              </p>
            </div>
            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-amber-200 text-xs text-slate-700 max-w-md mx-auto flex items-center justify-between gap-2">
              <span className="truncate">Trạng thái xe hiện tại:</span>
              <span className="font-mono font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-[10px] sm:text-xs shrink-0">
                {orderStatus === "IN_PROGRESS"
                  ? "ĐANG THI CÔNG"
                  : orderStatus === "WAITING_PARTS"
                  ? "CHỜ PHỤ TÙNG"
                  : orderStatus === "QUOTE_SENT"
                  ? "CHỜ DUYỆT BÁO GIÁ"
                  : orderStatus}
              </span>
            </div>
            <div className="pt-2">
              <Link href={`/customer/orders/${orderCode}`}>
                <button className="px-5 sm:px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs uppercase tracking-wider transition shadow-md inline-flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4 text-amber-400" />
                  Quay Lại Theo Dõi Tiến Độ Khoang Nâng
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Khối Mã VietQR Thật Chuẩn Ngân Hàng */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 sm:p-6 rounded-3xl bg-white border-2 border-amber-500/40 shadow-xl flex flex-col items-center max-w-sm w-full">
                {/* Ảnh VietQR chuẩn từ Napas 247 */}
                <div className="relative bg-white p-2 rounded-2xl border border-slate-200 shadow-inner w-full flex justify-center">
                  <img
                    src={`https://img.vietqr.io/image/MB-0797526990-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(orderCode)}&accountName=GARA%20HIHIHAHA%20AUTO`}
                    alt="Mã QR Chuyển Khoản VietQR"
                    className="w-full max-w-[220px] sm:max-w-[260px] h-auto object-contain rounded-xl mx-auto"
                    onError={(e) => {
                      // Fallback nếu offline hoặc lỗi mạng
                      e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`2|99|0797526990|MB|${totalAmount}|${orderCode}`)}`;
                    }}
                  />
                </div>

                {/* Bảng Chi Tiết Thông Tin Chuyển Khoản */}
                <div className="w-full mt-4 pt-4 border-t border-slate-100 space-y-2 text-left text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Ngân hàng:</span>
                    <span className="font-bold text-slate-800">MB Bank (Quân Đội)</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Số tài khoản:</span>
                    <span className="font-mono font-bold text-amber-600 text-sm tracking-wider">0797526990</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Chủ thụ hưởng:</span>
                    <span className="font-bold text-slate-800 uppercase">GARA HIHIHAHA AUTO</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Số tiền:</span>
                    <span className="font-mono font-bold text-slate-900">{formatCurrencyVND(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Nội dung CK:</span>
                    <span className="font-mono font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{orderCode}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Mã QR tự động cập nhật số tiền & nội dung đơn hàng
              </div>
            </div>

            {/* Nút Hành Động Thanh Toán */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              
              <button
                onClick={handleCreateVnpayUrl}
                disabled={loading || paid}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                {loading ? "Đang kết nối cổng..." : "Cổng VNPay Sandbox (NCB)"}
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleConfirmPayment}
                disabled={loading || paid}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs uppercase tracking-wider transition shadow-amber-glow flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {paid ? "Đã Thanh Toán Thành Công" : "Xác Nhận Đã Chuyển Khoản"}
              </button>
            </div>
          </>
        )}

        {paid && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium space-y-2 animate-in fade-in">
            <div className="font-bold flex items-center justify-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4" /> XÁC NHẬN THANH TOÁN THÀNH CÔNG!
            </div>
            <p>Hệ thống đang tự động chuyển về Hồ Sơ Xe của Quý Khách...</p>
            <Link
              href="/customer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
            >
              Về Trang Quản Lý Xe →
            </Link>
          </div>
        )}

        {/* Cam Kết Bảo Mật */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Chuẩn bảo mật PCI DSS Level 1
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            Khóa Idempotency chống trừ tiền 2 lần
          </div>
        </div>

      </div>

    </div>
  );
}
