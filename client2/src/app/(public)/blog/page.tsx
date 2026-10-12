import React from "react";
import Link from "next/link";
import { BookOpen, Calendar, Clock, ArrowRight, Sparkles, Shield, Cpu } from "lucide-react";

export const metadata = {
  title: "Cẩm Nang Kỹ Thuật Ô Tô & Công Nghệ Gara 4S | HiHiHaHa Auto",
  description: "Các bài viết chuyên sâu về hệ thống phanh Ceramic, dầu nhớt 0W-20, công nghệ Graph-RAG AI và kinh nghiệm bảo dưỡng xe sang.",
};

export const BLOG_POSTS = [
  {
    slug: "phanh-ceramic",
    title: "Phanh Ceramic vs Phanh Kim Loại: Sự Khác Biệt Sống Còn Về Hiệu Năng & Độ Bền",
    excerpt: "Tại sao các dòng xe sang Lexus, BMW và xe thể thao lại chuyển hoàn toàn sang má phanh gốm Ceramic? Phân tích hệ số ma sát µ (mu), nhiệt độ chịu tải và triệt tiêu tiếng rít khó chịu.",
    category: "Hệ Thống Phanh",
    readTime: "6 phút đọc",
    date: "05/10/2026",
    author: "Kỹ Sư Trưởng Lê Quang Tùng",
    featured: true,
  },
  {
    slug: "dau-nhot-0w20",
    title: "Giải Mã Dầu Nhớt 0W-20: Tại Sao Động Cơ Đời Mới Bắt Buộc Phải Dùng Độ Nhớt Siêu Loãng?",
    excerpt: "Nhiều chủ xe lo ngại dầu nhớt 0W-20 quá loãng sẽ gây xước xy-lanh. Bài viết giải thích khe hở nhiệt tế vi của động cơ TNGA Toyota và tiêu chuẩn bôi trơn GF-6A hiện đại.",
    category: "Động Cơ & Bôi Trơn",
    readTime: "8 phút đọc",
    date: "03/10/2026",
    author: "ThS. Nguyễn Văn Hải - Chuyên Gia Hóa Dầu",
    featured: false,
  },
  {
    slug: "ai-chan-doan-loi",
    title: "Graph-RAG: Trí Tuệ Nhân Tạo Đồ Thị Đã Xóa Bỏ Căn Bệnh 'Vẽ Bệnh' Tại Gara Như Thế Nào?",
    excerpt: "Không như Chatbot thông thường hay tự bịa mã phụ tùng, Graph-RAG kết hợp Gemini AI và Neo4j Graph Database truy vết chính xác 100% phụ tùng tương thích khung gầm và đối soát trực tiếp kho.",
    category: "Công Nghệ & AI",
    readTime: "10 phút đọc",
    date: "01/10/2026",
    author: "Đội Ngũ Kỹ Thuật Phần Mềm HiHiHaHa Auto",
    featured: false,
  }
];

export default function BlogListPage() {
  return (
    <div className="relative min-h-screen py-16 px-6 font-sans">
      
      {/* Background Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <BookOpen className="w-4 h-4" />
            <span>Chuyên Mục Khoa Học Kỹ Thuật Ô Tô</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Kiến Thức & Công Nghệ Bảo Trì Xe Hơi
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
            Chia sẻ các bài phân tích kỹ thuật chuyên sâu từ đội ngũ kỹ sư dịch vụ 4S. Cung cấp góc nhìn minh bạch, khoa học giúp chủ xe hiểu rõ chiếc xế cưng của mình.
          </p>
        </div>

        {/* Featured Post Card */}
        {BLOG_POSTS.filter(p => p.featured).map(post => (
          <div
            key={post.slug}
            className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-brand-cardDark border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-amber-500/40 transition-all grid grid-cols-1 lg:grid-cols-3 gap-8 items-center"
          >
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3 text-xs">
                <span className="px-3 py-1 font-bold rounded-full bg-amber-500 text-zinc-950">
                  Bài Nổi Bật
                </span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                  {post.category}
                </span>
                <span className="text-zinc-400">•</span>
                <span className="text-zinc-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {post.readTime}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 hover:text-amber-500 transition cursor-pointer">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>

              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                {post.excerpt}
              </p>

              <div className="pt-4 flex items-center justify-between text-xs text-zinc-500">
                <span>Tác giả: <strong className="text-zinc-800 dark:text-zinc-200">{post.author}</strong></span>
                <span>Ngày xuất bản: {post.date}</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <p className="text-xs text-zinc-500">
                Tìm hiểu công nghệ phanh Ceramic và cách hệ thống AI gợi ý đúng mã OEM tương thích xe của bạn.
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="w-full py-3 text-xs font-bold rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-amber-500 hover:text-zinc-950 dark:hover:bg-amber-400 dark:hover:text-zinc-950 transition flex items-center justify-center gap-1.5"
              >
                Đọc Bài Viết Chi Tiết <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}

        {/* Regular Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {BLOG_POSTS.filter(p => !p.featured).map(post => (
            <div
              key={post.slug}
              className="p-8 rounded-3xl bg-white dark:bg-brand-cardDark border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-amber-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {post.category}
                  </span>
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {post.readTime}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 hover:text-amber-500 transition">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-500">{post.date}</span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  Đọc tiếp <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
