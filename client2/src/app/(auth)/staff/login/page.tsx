"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Shield, 
  Phone, 
  ArrowLeft, 
  Lock,
  LogIn
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function StaffLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Xử lý đăng nhập nhân viên chính thức qua Backend API
  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      toast.error("Vui lòng điền đầy đủ số điện thoại và mật khẩu!");
      return;
    }

    setLoading(true);
    try {
      const res = await api.staffLogin(phone, password);
      if (res.success && res.data) {
        const user = res.data.user;
        const role = user?.role;
        
        let targetUrl = "/advisor/work-orders";
        if (role === "WORKSHOP_MANAGER") targetUrl = "/manager/kanban";
        else if (role === "TECHNICIAN") targetUrl = "/technician";
        else if (role === "OWNER") targetUrl = "/owner/dashboard";
        else if (role === "SERVICE_ADVISOR") targetUrl = "/advisor/work-orders";

        toast.success(`Đăng nhập thành công: ${user?.full_name || "Cán bộ"} (${role})`);
        setTimeout(() => {
          router.push(targetUrl);
        }, 500);
      } else {
        toast.error(res.error || "Số điện thoại hoặc mật khẩu không chính xác.");
      }
    } catch (err: any) {
      toast.error(err.message || "Không thể kết nối đến máy chủ xác thực.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 font-sans py-8 pb-16">
      
      {/* Back to Customer Link */}
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-amber-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Bạn là khách hàng chủ xe? Trở về Cổng Chủ Xe
      </Link>

      {/* Header Form */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 p-2 mb-2 shadow-xs">
          <Image
            src="/logo.png"
            alt="HiHiHaHa Auto Logo"
            width={56}
            height={56}
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Cổng Nội Bộ Nhân Sự Gara
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto font-medium">
          Dành riêng cho Cố Vấn Dịch Vụ, Quản Đốc Xưởng, Kỹ Thuật Viên và Ban Giám Đốc HiHiHaHa Auto
        </p>
      </div>

      {/* Form Đăng Nhập Tiêu Chuẩn */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <form onSubmit={handleStaffLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Số Điện Thoại / Mã Đăng Nhập
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="VD: 0988888801"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm font-mono font-semibold rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition shadow-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Mật Khẩu Bảo Mật
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm font-mono rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Đang xác thực cán bộ..." : "Đăng Nhập Cổng Nội Bộ"}
          </button>
        </form>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <p className="text-[11px] text-slate-500">
            Hệ thống tự động phân quyền và điều hướng đến màn hình làm việc tương ứng với chức danh đã được phê duyệt trong hệ thống.
          </p>
        </div>
      </div>

    </div>
  );
}
