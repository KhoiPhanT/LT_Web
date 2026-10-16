// Phụ trách phần mới: Tân. Thanh điều hướng công khai.
import Link from "next/link";
// Tân: navbar công khai đưa khách và nhân viên đến hai cách đăng nhập khác nhau.
export function PublicNavbar() {
  return (
    <header className="bg-white border-b">
      <nav className="max-w-6xl mx-auto p-4 flex flex-wrap items-center gap-3 sm:gap-5">
        <Link
          href="/"
          className="font-black text-amber-600"
        >
          HIHIHAHA AUTO
        </Link>
        <Link
          href="/staff/login"
          className="ml-auto text-sm hover:text-amber-600"
        >
          Nhân viên
        </Link>
        <Link
          href="/login"
          className="bg-amber-500 rounded-lg px-4 py-2 text-sm font-bold"
        >
          Khách hàng
        </Link>
      </nav>
    </header>
  );
}
