import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Shield, CheckCircle2 } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white pt-14 pb-8 px-4 sm:px-8 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        
        {/* Cột 1: Thông tin thương hiệu */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 p-1 flex items-center justify-center shrink-0">
              <Image
                src="/logo.png"
                alt="HiHiHaHa Auto Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <span className="font-extrabold text-base text-slate-900">
              HIHIHAHA<span className="text-amber-500"> AUTO</span>
            </span>
          </div>
          <p className="leading-relaxed text-[12px] text-slate-600">
            Tổ hợp trung tâm dịch vụ chăm sóc, bảo dưỡng ô tô công nghệ cao chuẩn 4S. Báo giá minh bạch, kiểm tra 30 hạng mục an toàn, cam kết 100% linh kiện chính hãng OEM.
          </p>
          <div className="flex items-center gap-2 text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 w-fit">
            <Shield className="w-3.5 h-3.5" />
            Bảo hành điện tử toàn quốc 12 tháng
          </div>
        </div>

        {/* Cột 2: Dịch vụ mũi nhọn */}
        <div>
          <h4 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-amber-500 rounded-full" />
            Dịch Vụ Tiêu Biểu
          </h4>
          <ul className="space-y-2.5 text-[12px]">
            <li><Link href="/services" className="hover:text-amber-600 transition">Bảo dưỡng định kỳ Cấp lớn (40.000km)</Link></li>
            <li><Link href="/services" className="hover:text-amber-600 transition">Chẩn đoán lỗi động cơ bằng máy quét OBD-II & AI</Link></li>
            <li><Link href="/services" className="hover:text-amber-600 transition">Thay thế má phanh gốm & Láng đĩa phanh</Link></li>
            <li><Link href="/services" className="hover:text-amber-600 transition">Vệ sinh buồng đốt & Kim phun bằng sóng siêu âm</Link></li>
            <li><Link href="/services" className="hover:text-amber-600 transition">Cân chỉnh góc đặt bánh xe Laser 3D Hunter</Link></li>
          </ul>
        </div>

        {/* Cột 3: Kiến thức ô tô */}
        <div>
          <h4 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-amber-500 rounded-full" />
            Cẩm Nang Kỹ Thuật
          </h4>
          <ul className="space-y-2.5 text-[12px]">
            <li><Link href="/blog/phanh-ceramic" className="hover:text-amber-600 transition">So sánh Má phanh Ceramic vs Bán kim loại</Link></li>
            <li><Link href="/blog/dau-nhot-0w20" className="hover:text-amber-600 transition">Tại sao xe đời mới bắt buộc dùng dầu 0W-20?</Link></li>
            <li><Link href="/blog/ai-chan-doan-loi" className="hover:text-amber-600 transition">Ứng dụng AI chẩn đoán chuẩn xác tiếng ồn động cơ</Link></li>
            <li><Link href="/blog" className="hover:text-amber-600 transition">Dấu hiệu nhận biết bugi đánh lửa bị mòn cần thay</Link></li>
          </ul>
        </div>

        {/* Cột 4: Liên hệ & Giờ mở cửa */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-amber-500 rounded-full" />
            Trụ Sở Xưởng Dịch Vụ
          </h4>
          <div className="flex items-start gap-2 text-[12px]">
            <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span className="text-slate-700">Số 1 Võ Văn Ngân, TP. Thủ Đức, TP. Hồ Chí Minh</span>
          </div>
          <div className="flex items-center gap-2 text-[12px]">
            <Phone className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-mono font-bold text-slate-900">Hotline: 0797 526 990</span>
          </div>
          <div className="flex items-center gap-2 text-[12px]">
            <Mail className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-slate-700">tailoi1606@gmail.com</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] space-y-1">
            <div className="font-bold text-slate-900">Giờ Vận Hành Xưởng:</div>
            <div className="text-slate-700">Thứ 2 - Thứ 7: 07:30 - 18:00 (Cứu hộ 24/7)</div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
        <p>© 2026 HIHIHAHA AUTO. Giữ toàn quyền bảo lưu.</p>
        <div className="flex items-center gap-3 font-semibold text-slate-600">
          <span>Trung Tâm Dịch Vụ Ô Tô Chuẩn 4S</span>
          <span>•</span>
          <span>Minh Bạch Báo Giá</span>
          <span>•</span>
          <span>Bảo Hành Toàn Quốc</span>
        </div>
      </div>
    </footer>
  );
}
