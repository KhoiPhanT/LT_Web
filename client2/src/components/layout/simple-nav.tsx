"use client";
// Phụ trách phần mới: Tân. Menu chỉ chứa các luồng còn trong đồ án.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, clearSession, Role, UserSession } from "@/lib/api";
// Tân: role do layout truyền vào để chọn nhóm link; Lợi: tên người dùng lấy lại từ session.
export function SimpleNav({ role }: { role: Role }) {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  // Lợi: mỗi lần mở layout, gọi /auth/me để kiểm tra session và lấy tên mới nhất từ MySQL.
  // localStorage không có quyền quyết định người dùng có được gọi API hay không.
  useEffect(() => {
    api
      .me()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);
  // Tân: chỉ hiện các trang còn dùng theo từng vai trò; đây là menu, không thay kiểm tra 403.
  const links =
    role === "MANAGER"
      ? [
          ["Tổng quan", "/manager"],
          ["Kho phụ tùng", "/manager/inventory"],
        ]
      : role === "TECHNICIAN"
        ? [
            ["Lệnh của tôi", "/technician"],
            ["Tiếp nhận xe", "/technician/create-order"],
          ]
        : [["Lệnh của tôi", "/customer"]];
  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto p-4 flex flex-wrap items-center gap-4">
        <Link
          href="/"
          className="font-black text-amber-600"
        >
          HIHIHAHA AUTO
        </Link>
        <nav className="flex gap-4 text-sm">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="hover:text-amber-600"
            >
              {label}
            </Link>
          ))}
        </nav>
        <span className="ml-auto text-sm text-slate-500">
          {user?.full_name || (role === "CUSTOMER" ? "Khách hàng" : "Nhân viên")}
        </span>
        <button
          className="text-sm text-red-600"
          onClick={() => {
            // Lợi: xóa cache giao diện, gọi Servlet hủy session rồi về đúng trang đăng nhập.
            clearSession();
            router.push(role === "CUSTOMER" ? "/login" : "/staff/login");
          }}
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
