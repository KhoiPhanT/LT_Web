// Phụ trách phần mới: Kiệt. Khung trang kỹ thuật viên.
import { SimpleNav } from "@/components/layout/simple-nav";
export default function TechnicianLayout({children}:{children:React.ReactNode}) { return <div className="min-h-screen bg-slate-50"><SimpleNav role="TECHNICIAN"/><main className="max-w-6xl mx-auto p-4 sm:p-8">{children}</main></div>; }
