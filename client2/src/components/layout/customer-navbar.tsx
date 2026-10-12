"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Car, FileText, CreditCard, HelpCircle, Menu, X } from "lucide-react";
import { getCurrentUser, clearSession, UserSession, api } from "@/lib/api";
import { toast } from "sonner";

export function CustomerNavbar() {
  const rawPathname = usePathname();
  const pathname = rawPathname || "";
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [activeOrderCode, setActiveOrderCode] = useState<string>("WO-20261001-0089");
  const [plateNumber, setPlateNumber] = useState<string>("51K-888.88");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const curUser = getCurrentUser();
    setUser(curUser);
    if (curUser?.license_plate) {
      setPlateNumber(curUser.license_plate);
    }

    // Tự động lấy Lệnh sửa chữa mới nhất của chính chủ xe này
    api.getMyWorkOrders().then((res) => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const firstOrder = res.data[0];
        setActiveOrderCode(firstOrder.order_code);
        if (firstOrder.license_plate) {
          setPlateNumber(firstOrder.license_plate);
        }
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    clearSession();
    toast.success("Đã đăng xuất khỏi cổng khách hàng");
    router.push("/login");
  };

  const navLinks = [
    { label: "Hồ Sơ Xe", href: "/customer", icon: Car },
    { label: "Lệnh Đang Sửa", href: `/customer/orders/${activeOrderCode}`, icon: FileText },
    { label: "Thanh Toán QR", href: `/customer/payment/${activeOrderCode}`, icon: CreditCard },
  ];

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 shadow-xs font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* Brand & Customer Info */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Link href="/customer" className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 border border-amber-200/80 p-1 flex items-center justify-center shrink-0 shadow-xs">
              <Image
                src="/logo.png"
                alt="HiHiHaHa Auto Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 font-sans tracking-tight">
                  CỔNG CHỦ XE
                </span>
                <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-mono font-bold rounded-md bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                  {plateNumber || user?.license_plate || "HỒ SƠ XE"}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate hidden sm:block max-w-xs">
                {user?.full_name ? `Chủ xe: ${user.full_name}` : "Cổng Tra Cứu Khách Hàng"} • Thành Viên Gara
              </p>
            </div>
          </Link>
        </div>

        {/* Customer Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-xs font-bold">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/customer" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition whitespace-nowrap ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout & Mobile Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 transition shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng Xuất</span>
          </button>

          {/* Hamburger toggle on mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
            aria-label="Toggle customer menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-amber-600" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 pb-2 border-t border-slate-200 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <p className="font-bold text-slate-900">{user?.full_name || "Quý Khách Hàng"}</p>
            <p className="text-[10px] text-slate-500 font-mono">Biển số: {plateNumber}</p>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/customer" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100 bg-white border border-slate-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-amber-600"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-1.5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng Xuất</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
export default CustomerNavbar;
