import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { Lora } from "next/font/google";
import { BLOG_POSTS } from "../page";

const lora = Lora({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

interface Props {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogDetailPage({ params }: Props) {
  const targetSlug = params?.slug || "phanh-ceramic";
  const post = BLOG_POSTS.find((p) => p.slug === targetSlug) || BLOG_POSTS[0];

  return (
    <article className="min-h-screen py-10 sm:py-16 px-4 sm:px-6 bg-slate-50/40">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Nút Quay Lại Tối Giản */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-amber-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Chuyên mục kiến thức ô tô</span>
        </Link>

        {/* Tiêu Đề & Thông Tin Tác Giả */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
              {post.category}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> {post.readTime}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> {post.date}
            </span>
          </div>

          <h1 className={`${lora.className} text-2xl sm:text-4xl lg:text-[40px] font-bold text-slate-900 leading-[1.25] tracking-tight`}>
            {post.title}
          </h1>

          <div className="flex items-center justify-between pt-4 pb-2 border-b border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xs shadow-xs">
                K
              </div>
              <div>
                <span className="font-bold text-slate-900 block">{post.author}</span>
                <span className="text-[11px] text-slate-500">Trung Tâm Dịch Vụ Kỹ Thuật 4S • HiHiHaHa Auto</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Đã kiểm chứng kỹ thuật</span>
            </div>
          </div>
        </header>

        {/* Đoạn Mở Đầu / Tóm Tắt Khái Quát */}
        <div className={`${lora.className} text-base sm:text-lg text-slate-700 leading-relaxed pl-4 sm:pl-5 border-l-2 border-amber-500 italic bg-amber-50/40 py-3 rounded-r-xl`}>
          {post.excerpt}
        </div>

        {/* Nội Dung Bài Viết - Typography Thoáng, Dễ Đọc */}
        <div className="text-slate-700 text-sm sm:text-base leading-relaxed sm:leading-8 space-y-6">
          
          <h2 className={`${lora.className} text-xl sm:text-2xl font-bold text-slate-900 pt-4 tracking-tight`}>
            1. Nguyên lý cơ học và bối cảnh kỹ thuật thực tế
          </h2>
          <p>
            Trong quá trình vận hành xe hơi hàng ngày, đặc biệt là các dòng sedan cao cấp và SUV gia đình, các bộ phận như má phanh, dầu động cơ và hệ thống đánh lửa là những chi tiết chịu hao mòn ma sát và nhiệt lượng khắc nghiệt nhất.
          </p>
          <p>
            Việc sử dụng các linh kiện không đạt chuẩn hoặc chẩn đoán sai mã tương thích phụ tùng có thể dẫn đến việc phá hủy đĩa phanh, gây xước nòng xy-lanh hoặc làm sai lệch tỷ lệ hòa khí của hệ thống phun xăng điện tử.
          </p>

          <h2 className={`${lora.className} text-xl sm:text-2xl font-bold text-slate-900 pt-4 tracking-tight`}>
            2. Ứng dụng công nghệ chẩn đoán Graph-RAG tại xưởng HiHiHaHa Auto
          </h2>
          <p>
            Tại trung tâm dịch vụ kỹ thuật HiHiHaHa Auto, chúng tôi loại bỏ hoàn toàn phương pháp đoán bệnh bằng cảm quan thông qua việc đưa hệ thống <strong>Graph-RAG AI</strong> vào quy trình kiểm tra 30 hạng mục:
          </p>

          <div className="space-y-3 my-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-start gap-2.5 text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Đối soát cấu trúc khung gầm dùng chung (như nền tảng TNGA-K giữa Toyota Camry và Lexus ES250) để đưa ra phụ tùng tương thích cơ khí hoàn hảo.</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Tự động đặt giữ phụ tùng trong kho thời gian thực ngay khi khách hàng ký duyệt trực tuyến trên điện thoại.</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Chụp ảnh nghiệm thu cận cảnh trước và sau khi thay thế, lưu vết vĩnh viễn trên sổ bảo dưỡng điện tử.</span>
            </div>
          </div>

          <h2 className={`${lora.className} text-xl sm:text-2xl font-bold text-slate-900 pt-4 tracking-tight`}>
            3. Lời khuyên an toàn dành cho chủ xe
          </h2>
          <p>
            Định kỳ mỗi 10.000km hoặc 6 tháng, quý khách nên mang xe đến trung tâm để được quét lỗi bằng thiết bị chuyên hãng và kiểm tra độ dày má phanh. Mọi chi phí và báo giá tại HiHiHaHa Auto luôn được minh bạch từng đồng trước khi tiến hành sửa chữa.
          </p>

        </div>

        {/* Khung Kêu Gọi Hành Động (CTA) Tinh Gọn */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-5 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className={`${lora.className} text-base sm:text-lg font-bold text-slate-900`}>
              Cần kiểm tra xe bằng công nghệ Graph-RAG AI?
            </h3>
            <p className="text-xs text-slate-500">
              Đăng nhập cổng khách hàng để xem tiến độ sửa chữa và duyệt báo giá trực tuyến.
            </p>
          </div>
          <Link
            href="/login"
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-slate-950 text-amber-400 hover:bg-slate-900 transition flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95"
          >
            <span>Vào Cổng Khách Hàng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </article>
  );
}
