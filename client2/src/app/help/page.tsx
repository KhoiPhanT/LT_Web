"use client";

import React from "react";
import Link from "next/link";
import {
  Wrench,
  Car,
  PlayCircle,
  CheckCircle2,
  Camera,
  History,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Smartphone,
  Phone,
  CheckSquare,
} from "lucide-react";

export default function TechHelpPage() {
  const steps = [
    {
      num: "01",
      icon: Car,
      title: "Chọn Thợ & Nhận Xe Vào Khoang",
      badge: "Bàn Làm Việc",
      color: "border-blue-500/30 bg-blue-500/10 text-blue-400",
      details: [
        "Chọn đúng tên tài khoản của bạn tại ô 'Đổi Kỹ Thuật Viên' để tải danh sách xe của riêng bạn.",
        "Sử dụng thanh chip xe trên đầu màn hình để chuyển nhanh giữa các xe đang phụ trách.",
        "Tại tab 'Hàng Đợi Xe Trong Xưởng', bấm [⚡ Nhận Vào Khoang Của Tôi] để kéo xe vào bàn làm việc.",
      ],
    },
    {
      num: "02",
      icon: PlayCircle,
      title: "Kích Hoạt Bắt Đầu Thi Công",
      badge: "Lệnh Sửa Chữa",
      color: "border-amber-500/30 bg-amber-500/10 text-amber-400",
      details: [
        "Bấm nút [⚡ Bắt Đầu Sửa Chữa] để chuyển trạng thái lệnh sang 'ĐANG THI CÔNG'.",
        "Kiểm tra danh mục phụ tùng đã xuất từ kho theo đúng bảng báo giá khách hàng đã ký duyệt.",
        "Nếu phát sinh hỏng hóc ngoài báo giá, báo ngay cho Cố vấn Dịch vụ để lập phụ lục báo giá bổ sung.",
      ],
    },
    {
      num: "03",
      icon: CheckSquare,
      title: "Tích Checklist & Cập Nhật Tiến Độ",
      badge: "Thao Tác Tại Khoang",
      color: "border-purple-500/30 bg-purple-500/10 text-purple-400",
      details: [
        "Tích chọn từng hạng mục công việc đã hoàn thành để hệ thống tự động nhảy phần trăm tiến độ.",
        "Kéo thanh trượt % tiến độ để cập nhật trực tiếp cho Cố vấn dịch vụ và Khách hàng theo dõi.",
        "Chụp ảnh hoặc tải ảnh nghiệm thu (siết lực bu-lông, phụ tùng mới gắn, gầm xe sạch sẽ).",
      ],
    },
    {
      num: "04",
      icon: History,
      title: "Hoàn Thành & Tự Động Lưu Lịch Sử",
      badge: "Nghiệm Thu KCS",
      color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
      details: [
        "Khi đạt 100% tiến độ, bấm [Hoàn Thành Sửa Chữa / KCS] để kết thúc ca làm chiếc xe đó.",
        "Lệnh tự động được lưu vào Tab 'Lịch Sử Đã Hoàn Thành Của Riêng Tôi' kèm thời gian hoàn tất.",
        "Khoang làm việc của bạn tự động được giải phóng tải để sẵn sàng nhận xe tiếp theo.",
      ],
    },
  ];

  const rules = [
    {
      icon: ShieldAlert,
      title: "Giới Hạn Tối Đa 3 Xe / Thợ",
      color: "text-amber-400",
      desc: "Mỗi kỹ thuật viên nhận tối đa 3 xe cùng một lúc nhằm đảm bảo sự tập trung cao độ, an toàn siết lực và không để khách hàng chờ đợi quá lâu.",
    },
    {
      icon: PlayCircle,
      title: "Chỉ Nhận Khi Đã Ký Báo Giá",
      color: "text-blue-400",
      desc: "Xe phải được Khách hàng ký duyệt điện tử và chuyển trạng thái 'Chờ vật tư' trở đi thì mới được phép nhận thi công để tránh khiếu nại chi phí.",
    },
    {
      icon: Phone,
      title: "SĐT Khách Hàng Luôn Hiển Thị",
      color: "text-emerald-400",
      desc: "Thông tin liên hệ của chủ xe luôn có sẵn trên mỗi thẻ xe. Thợ có thể bấm gọi ngay hoặc phối hợp với Cố vấn khi cần xác nhận thêm chi tiết kỹ thuật.",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-8 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            HƯỚNG DẪN THAO TÁC TABLET KỸ THUẬT VIÊN
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Quy Trình Chuẩn 4 Bước Tại Khoang Nâng
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Hệ thống hỗ trợ Kỹ thuật viên quản lý khoang làm việc, theo dõi tiến độ, tích checklist và tự động lưu lịch sử từng xe đã hoàn thành.
          </p>

          <div className="pt-2">
            <Link
              href="/technician"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20"
            >
              <Smartphone className="w-4 h-4" />
              <span>Mở Màn Hình Tablet Làm Việc Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Bước thao tác chính */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-400" />
          <span>4 Bước Thao Tác Trọng Tâm</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 hover:border-slate-700 transition relative overflow-hidden"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl border flex items-center justify-center font-black ${st.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono font-bold text-slate-400 tracking-wider">
                        BƯỚC {st.num}
                      </span>
                      <h3 className="text-base font-bold text-white">
                        {st.title}
                      </h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-300 border border-slate-700">
                    {st.badge}
                  </span>
                </div>

                <ul className="space-y-2.5 pt-2 text-xs text-slate-300 leading-relaxed">
                  {st.details.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quy tắc vàng 4S */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 sm:p-8 space-y-5">
        <h2 className="text-base font-black text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span>Quy Tắc An Toàn & Vận Hành Bắt Buộc</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rules.map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-5 h-5 ${rule.color}`} />
                  <h3 className="text-sm font-bold text-white">{rule.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {rule.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">
            Sẵn sàng bắt đầu ca làm việc?
          </h3>
          <p className="text-xs text-slate-400">
            Truy cập giao diện Tablet tại khoang để nhận và quản lý các xe được giao.
          </p>
        </div>
        <Link
          href="/technician"
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md whitespace-nowrap flex items-center gap-2"
        >
          <Wrench className="w-4 h-4" />
          <span>Vào Bàn Làm Việc Tablet</span>
        </Link>
      </div>
    </div>
  );
}
