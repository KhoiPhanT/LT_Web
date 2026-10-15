// Phụ trách phần mới: Tân. Khung trang quản lý.
import { SimpleNav } from "@/components/layout/simple-nav";
export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <SimpleNav role="MANAGER" />
      <main className="max-w-6xl mx-auto p-4 sm:p-8">{children}</main>
    </div>
  );
}
