// Phụ trách phần mới: Lợi. Khung cổng khách hàng.
import { SimpleNav } from "@/components/layout/simple-nav";
// Lợi: mọi trang /customer dùng menu khách; nội dung trang con nằm trong children.
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <SimpleNav role="CUSTOMER" />
      <main className="max-w-6xl mx-auto p-4 sm:p-8">{children}</main>
    </div>
  );
}
