import React from "react";
import Link from "next/link";
import { Wrench, ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Sổ Tay Kỹ Thuật Viên | HiHiHaHa Auto",
  description: "Cẩm nang hướng dẫn thao tác chuẩn trên Tablet dành cho Kỹ thuật viên Gara 4S.",
};

export default function TechHelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Tech Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-wide text-white">
                  HIHIHAHA TECH MANUAL
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  NỘI BỘ THỢ
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Quy trình thao tác chuẩn trên màn hình Tablet Khoang Nâng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/technician"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về Tablet Kỹ Thuật Viên</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 text-center text-xs text-slate-400">
        <p>Hệ Thống Quản Trị Khoang Nâng Kỹ Thuật Số • Smart Garage 4S HiHiHaHa</p>
      </footer>
    </div>
  );
}
