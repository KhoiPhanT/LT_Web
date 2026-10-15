"use client";
// Phụ trách phần mới: Tân. Menu chỉ chứa các luồng còn trong đồ án.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, clearSession, Role, UserSession } from "@/lib/api";
export function SimpleNav({ role }: { role: Role }) {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  // Lợi: xác minh phiên và thay tên cũ trong localStorage bằng dữ liệu MySQL hiện tại.
  useEffect(() => {
    api
      .me()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);
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
