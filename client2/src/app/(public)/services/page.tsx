import React from "react";
import Link from "next/link";
import { Wrench, ShieldCheck, Cpu, ArrowRight, Gauge, CheckCircle2, Award, Zap } from "lucide-react";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";

export const metadata = {
  title: "Dịch Vụ & Bảng Giá Tiêu Chuẩn 4S | HiHiHaHa Auto",
  description: "Bảng giá dịch vụ bảo dưỡng định kỳ và sửa chữa ô tô minh bạch với phụ tùng OEM chính hãng, VAT 8% và chính sách bảo hành 12 tháng.",
};

const SERVICES = [
  {
    id: "bao-duong-dinh-ky",
    title: "Bảo Dưỡng Định Kỳ Cấp Lớn (40.000km - 80.000km)",
    category: "Bảo Dưỡng Tiêu Chuẩn",
    priceRange: "2.500.000 đ - 5.800.000 đ",
    estimatedTime: "180 phút",
    badge: "Phổ Biến Nhất",
    description: "Gói bảo dưỡng toàn diện 30 hạng mục: Thay dầu động cơ tổng hợp, lọc dầu, lọc gió động cơ & điều hòa, vệ sinh họng nạp, kiểm tra hệ thống phanh 4 bánh, siết gầm.",
    features: [
      "Quét lỗi chuyên sâu bằng máy chẩn đoán hãng",
      "Thay dầu nhớt 0W-20 / 5W-30 cao cấp",
      "Vệ sinh bướm ga và cảm biến MAF",
      "Báo cáo điện tử gửi qua Zalo & Portal"
    ]
  },
  {
    id: "he-thong-phanh",
    title: "Chăm Sóc & Thay Thế Hệ Thống Phanh Ceramic",
    category: "Hệ Thống An Toàn",
    priceRange: "1.250.000 đ - 3.200.000 đ",
    estimatedTime: "90 phút",
    badge: "An Toàn 5 Sao",
    description: "Thay má phanh gốm ceramic thế hệ mới (Akebono / Brembo), láng đĩa phanh triệt tiêu tiếng rít và rung giật, thay dầu phanh DOT4 bằng máy áp lực âm.",
    features: [
      "Bảo đảm 100% không bụi đen, không rít phanh",
      "Láng đĩa phanh laser độ chính xác 0.01mm",
      "Kiểm tra cùm phanh và tra mỡ chịu nhiệt piston",
      "Cân bằng lực phanh 4 bánh trên đường thử"
    ]
  },
  {
    id: "he-thong-gam-treo",
    title: "Phục Hồi Hệ Thống Gầm, Treo & Giảm Xóc",
    category: "Khung Gầm & Vận Hành",
    priceRange: "1.800.000 đ - 7.500.000 đ",
    estimatedTime: "120 - 240 phút",
    badge: "Công Nghệ Cao",
    description: "Khắc phục triệt để tiếng kêu lục cục, rung lắc khi qua gờ giảm tốc. Thay thế phuộc nhún, cao su càng A, rô-tuyn cân bằng chính hãng.",
    features: [
      "Kiểm tra độ chụm và thước lái Hunter 3D",
      "Phụ tùng chuẩn OEM tương thích khung gầm",
      "Triệt tiêu độ rơ vô lăng ở tốc độ cao",
      "Bảo hành 1 đổi 1 trong 12 tháng"
    ]
  },
  {
    id: "chan-doan-ai",
    title: "Chẩn Đoán Lỗi Chuyên Sâu Bằng Graph-RAG AI",
    category: "Trí Tuệ Nhân Tạo",
    priceRange: "300.000 đ (Miễn phí khi làm dịch vụ)",
    estimatedTime: "30 phút",
    badge: "Độc Quyền 2026",
    description: "Ứng dụng mô hình Đồ thị Tri thức Neo4j kết hợp Gemini AI quét hơn 50.000 mã lỗi OBD-II, phát hiện nguyên nhân gốc rễ (Root-cause) chỉ trong 30 giây.",
    features: [
      "Truy vết chính xác mã phụ tùng tương thích chéo",
      "Không phán mò, không 'vẽ bệnh' phát sinh",
      "Xuất báo cáo kỹ thuật minh bạch cho khách",
      "Lập tức tạo báo giá động 8% VAT trên điện thoại"
    ]
  }
];

export default function ServicesPage() {
  return (
    <div className="relative min-h-screen py-16 px-6 font-sans">
      
      {/* Background Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Tiêu Chuẩn Xưởng 4S • Minh Bạch 100% Sổ Sách</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Danh Mục Dịch Vụ & Bảng Giá Minh Bạch
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
            Cam kết phụ tùng chính hãng OEM, kỹ thuật viên được đào tạo chuyên sâu và áp dụng công nghệ máy chẩn đoán thông minh. Khách hàng ký duyệt từng hạng mục trước khi thi công.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SERVICES.map((service) => (
            <div
              key={service.id}
              className="p-8 rounded-3xl bg-white dark:bg-brand-cardDark border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-amber-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
                    {service.category}
                  </span>
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    {service.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {service.title}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {service.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Quyền lợi gói dịch vụ:</div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    {service.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-zinc-500">Mức giá tham khảo:</div>
                  <div className="text-lg font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                    {service.priceRange}
                  </div>
                </div>

                <Link href="/login">
                  <LiquidGlassButton size="sm">
                    Đặt Hẹn Ngay
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-950" />
                  </LiquidGlassButton>
                </Link>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
