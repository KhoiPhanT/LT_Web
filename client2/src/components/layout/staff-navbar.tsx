"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  ClipboardList, 
  PlusCircle, 
  Kanban, 
  Boxes, 
  Smartphone, 
  BarChart3, 
  LogOut,
  User,
  Shield,
  Award,
  BookOpen,
  Menu,
  X
} from "lucide-react";
import { getCurrentUser, clearSession, UserSession } from "@/lib/api";
import { StaffProfileModal } from "@/components/profile/staff-profile-modal";
import { toast } from "sonner";

interface StaffNavbarProps {
  currentRoleTitle?: string;
  role?: "advisor" | "manager" | "technician" | "owner" | string;
}

export function StaffNavbar({ currentRoleTitle, role }: StaffNavbarProps) {
  const rawPathname = usePathname();
  const pathname = rawPathname || "";
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  // Đóng mobile menu khi chuyển trang
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Ưu tiên cao nhất: vai trò thực tế của người dùng đã đăng nhập trong session
  const effectiveRole = (
    user?.role === "WORKSHOP_MANAGER" ? "manager" :
    user?.role === "SERVICE_ADVISOR" ? "advisor" :
    user?.role === "TECHNICIAN" ? "technician" :
    user?.role === "OWNER" ? "owner" :
    role || (
      pathname.startsWith("/advisor") ? "advisor" :
      pathname.startsWith("/manager") ? "manager" :
      pathname.startsWith("/technician") ? "technician" :
      pathname.startsWith("/owner") ? "owner" : "advisor"
    )
  );

  // Phân chia menu chức năng RIÊNG BIỆT 100% cho từng vai trò
  const roleConfigs = {
    advisor: {
      brandSub: "ADVISOR",
      badgeTitle: "Cố Vấn Dịch Vụ",
      badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
      avatarDefault: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80",
      links: [
        { label: "Bảng Lệnh Sửa Chữa", href: "/advisor/work-orders", icon: ClipboardList },
        { label: "Tiếp Nhận & Báo Giá Mới", href: "/advisor/create-order", icon: PlusCircle },
      ],
    },
    manager: {
      brandSub: "MANAGER",
      badgeTitle: "Quản Đốc Xưởng",
      badgeClass: "bg-purple-100 text-purple-800 border-purple-300",
      avatarDefault: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&auto=format&fit=crop&q=80",
      links: [
        { label: "Điều Phối Kanban 6 Cột", href: "/manager/kanban", icon: Kanban },
        { label: "Lệnh Sửa Chữa Xưởng", href: "/manager/work-orders", icon: ClipboardList },
        { label: "Kho 500 Phụ Tùng OEM", href: "/manager/inventory", icon: Boxes },
      ],
    },
    technician: {
      brandSub: "TECH",
      badgeTitle: "Kỹ Thuật Viên Xưởng",
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
      avatarDefault: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=160&auto=format&fit=crop&q=80",
      links: [
        { label: "Màn Hình Tablet Khoang Nâng", href: "/technician", icon: Smartphone },
        { label: "Sổ Tay Kỹ Thuật", href: "/help", icon: BookOpen },
      ],
    },
    owner: {
      brandSub: "EXECUTIVE",
      badgeTitle: "Giám Đốc Gara",
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
      avatarDefault: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80",
      links: [
        { label: "Báo Cáo Doanh Thu & Năng Suất", href: "/owner/dashboard", icon: BarChart3 },
      ],
    },
  };

  const currentConfig = roleConfigs[effectiveRole as keyof typeof roleConfigs] || roleConfigs.advisor;

  const handleLogout = () => {
    clearSession();
    toast.success("Đã đăng xuất khỏi cổng nội bộ");
    router.push("/staff/login");
  };

  return (
    <>
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Brand & Khu Vực Chức Năng Riêng */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
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
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 font-sans tracking-tight truncate">
                  HIHIHAHA<span className="text-amber-500">.{currentConfig.brandSub}</span>
                </span>
                <span className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-mono font-bold rounded-md border shrink-0 ${currentConfig.badgeClass}`}>
                  {currentRoleTitle || currentConfig.badgeTitle}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden sm:block truncate max-w-xs">
                {user ? `Cán bộ: ${user.full_name} (${user.phone_number})` : "Khu Vực Phân Quyền Vận Hành"}
              </p>
            </div>
          </div>

          {/* Các Chức Năng DÀNH RIÊNG Cho Vai Trò Hiện Tại (Desktop Nav) */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 text-xs font-bold">
            {currentConfig.links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
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

          {/* Actions & Profile (Desktop & Mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Nút Mở Hồ Sơ & Kinh Nghiệm Cán Bộ */}
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/50 transition-all shadow-xs group"
              title="Xem hồ sơ năng lực & kinh nghiệm cán bộ"
            >
              <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-slate-300 group-hover:border-amber-500 shadow-xs shrink-0">
                <img
                  src={currentConfig.avatarDefault}
                  alt={user?.full_name || "Staff Avatar"}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white"></span>
              </div>
              <div className="text-left hidden md:block">
                <p className="text-[11px] font-bold text-slate-800 leading-tight group-hover:text-amber-700 truncate max-w-[120px]">
                  {user?.full_name || "Cán Bộ Gara"}
                </p>
                <p className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                  <Award className="w-2.5 h-2.5 text-amber-500 inline" /> Năng Lực
                </p>
              </div>
            </button>

            {/* Nút Đăng Xuất (Desktop) */}
            <button
              type="button"
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 transition shadow-xs"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng Xuất</span>
            </button>

            {/* Nút Hamburger Mở Mobile Menu (Mobile/Tablet) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
              aria-label="Toggle staff menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-amber-600" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile / Tablet Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 pb-2 border-t border-slate-200 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* User info bar on mobile */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={currentConfig.avatarDefault}
                  alt={user?.full_name || "Staff Avatar"}
                  className="w-7 h-7 rounded-full object-cover border border-slate-300 shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{user?.full_name || "Cán Bộ Gara"}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{currentConfig.badgeTitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsProfileOpen(true);
                }}
                className="text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition shrink-0"
              >
                Hồ Sơ
              </button>
            </div>

            {/* Role Links */}
            <div className="space-y-1">
              {currentConfig.links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
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

            {/* Logout on mobile */}
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
                <span>Đăng Xuất Khỏi Cổng Nội Bộ</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Modal Hồ Sơ Năng Lực & Kinh Nghiệm */}
      <StaffProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} />
    </>
  );
}
export default StaffNavbar;
