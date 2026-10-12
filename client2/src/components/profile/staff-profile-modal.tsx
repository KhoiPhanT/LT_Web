"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  X, 
  Award, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Star,
  Edit2,
  Save,
  UserCheck
} from "lucide-react";
import { UserSession } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user?: UserSession | null;
}

// Dữ liệu mẫu chuẩn hóa cho từng chức danh cán bộ
const STAFF_PROFILES_DEFAULT: Record<string, {
  title: string;
  code: string;
  dept: string;
  yearsExp: string;
  bio: string;
  avatar: string;
  skills: string[];
  certs: string[];
  stats: { label: string; value: string }[];
}> = {
  WORKSHOP_MANAGER: {
    title: "Quản Đốc Xưởng Dịch Vụ 4S (Workshop Manager)",
    code: "QDX-01",
    dept: "Ban Quản Trị Kỹ Thuật & Điều Phối Xưởng Gara",
    yearsExp: "12 năm kinh nghiệm quản trị gara 4S",
    bio: "12 năm kinh nghiệm thực chiến quản trị điều phối xưởng dịch vụ ô tô 4S, từng giữ cương vị Quản đốc dịch vụ tại Toyota và Mercedes-Benz. Chuyên gia tối ưu hóa quy trình bảo dưỡng tinh gọn Lean-Kanban và giám sát tiêu chuẩn an toàn KCS 30 hạng mục nghiêm ngặt.",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
    skills: [
      "Quản trị điều phối Kanban 6 cột",
      "Giám định an toàn KCS chuẩn ISO 9001",
      "Chẩn đoán điện tử mạng CAN-Bus & ECU",
      "Tối ưu năng suất khoang nâng & cầu 4 trụ",
      "Quản lý kho phụ tùng Redlock phân tán"
    ],
    certs: [
      "Kỹ sư Công nghệ Kỹ thuật Ô tô - ĐH Sư Phạm Kỹ Thuật TP.HCM (HCMUTE)",
      "Chứng chỉ ASE Master Automobile Technician (Viện Tiêu chuẩn Dịch vụ Ô tô Hoa Kỳ)",
      "Chứng nhận Quản đốc Dịch vụ Cấp 4 (Toyota Motor / Bosch Mobility Solutions)",
      "Chứng chỉ An toàn Lao động & Phòng cháy Chữa cháy Cục PCCC"
    ],
    stats: [
      { label: "Lượt xe giám sát", value: "3.250+ xe" },
      { label: "KCS đạt chuẩn lần đầu", value: "99.2%" },
      { label: "Đánh giá hài lòng", value: "4.95 / 5.0" }
    ]
  },
  SERVICE_ADVISOR: {
    title: "Cố Vấn Dịch Vụ Cấp Cao (Senior Service Advisor)",
    code: "CVDV-01",
    dept: "Phòng Tiếp Nhận Xe & Chăm Sóc Khách Hàng",
    yearsExp: "8 năm kinh nghiệm cố vấn & thẩm định 4S",
    bio: "8 năm kinh nghiệm tiếp nhận xe, chẩn đoán ban đầu, định giá phụ tùng thay thế và tư vấn bảo dưỡng kỹ thuật cho các dòng xe Nhật, Hàn và xe sang Châu Âu. Đạt chuẩn chứng nhận Cố vấn Dịch vụ Xuất sắc 2024.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    skills: [
      "Tư vấn kỹ thuật chuẩn gara 4S",
      "Lập dự toán & Báo giá nhúng VAT 8%",
      "Chẩn đoán nhanh qua máy quét OBD-II",
      "Chăm sóc khách hàng VIP & Xử lý bảo hành"
    ],
    certs: [
      "Cử nhân Kỹ thuật Ô tô - ĐH Bách Khoa TP.HCM",
      "Chứng chỉ Certified Service Advisor (CSA Quốc Tế)",
      "Chứng nhận Văn hóa Chăm sóc Khách hàng Omotenashi Nhật Bản"
    ],
    stats: [
      { label: "Báo giá đã lập", value: "1.850+ lệnh" },
      { label: "Tỷ lệ khách duyệt", value: "96.8%" },
      { label: "Điểm phản hồi", value: "4.92 / 5.0" }
    ]
  },
  TECHNICIAN: {
    title: "Kỹ Thuật Viên Trưởng / Thợ Cả (Master Technician)",
    code: "KTV-01",
    dept: "Tổ Sửa Chữa Gầm - Máy - Điện Khoang Nâng",
    yearsExp: "10 năm kinh nghiệm đại tu & chẩn đoán",
    bio: "10 năm kinh nghiệm chuyên sâu đại tu động cơ thế hệ mới (TNGA, SkyActiv, EcoBoost), cân chỉnh góc đặt bánh xe 3D Laser Hunter và bảo dưỡng hệ thống phanh an toàn ABS/ESP cao cấp.",
    avatar: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&auto=format&fit=crop&q=80",
    skills: [
      "Đại tu máy gầm ô tô du lịch",
      "Cân chỉnh góc đặt bánh xe 3D Laser",
      "Bảo dưỡng & Thay má phanh Ceramic Brembo/Akebono",
      "Chẩn đoán mạch điện tử & Cảm biến ô tô"
    ],
    certs: [
      "Kỹ thuật viên Cơ khí Ô tô Bậc 5/7 - Tổng Cục Dạy Nghề",
      "Chứng chỉ Chuyên gia Máy Hunter Engineering (USA)",
      "Chứng nhận Kỹ thuật Bảo dưỡng Ô tô Điện & Hybrid"
    ],
    stats: [
      { label: "Ca sửa hoàn thành", value: "2.400+ ca" },
      { label: "Tỷ lệ đúng hạn", value: "99.8%" },
      { label: "Đánh giá tay nghề", value: "5.0 / 5.0" }
    ]
  },
  OWNER: {
    title: "Chủ Tịch & Tổng Giám Đốc Điều Hành (General Director)",
    code: "GDO-01",
    dept: "Ban Giám Đốc & Hội Đồng Quản Trị HiHiHaHa Auto",
    yearsExp: "15 năm kinh nghiệm quản trị chuỗi ô tô 4S",
    bio: "15 năm kinh nghiệm sáng lập, đầu tư và vận hành chuỗi trung tâm dịch vụ chăm sóc ô tô công nghệ cao chuẩn 4S tại TP.HCM. Tiên phong ứng dụng trí tuệ nhân tạo và công nghệ số hóa quản trị garage tiên tiến trong ngành dịch vụ ô tô.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    skills: [
      "Chiến lược quản trị gara 4S hiện đại",
      "Tối ưu hóa báo cáo tài chính P&L",
      "Chuyển đổi số & Tự động hóa vận hành",
      "Xây dựng tiêu chuẩn chất lượng dịch vụ cao cấp"
    ],
    certs: [
      "Thạc sĩ Quản trị Kinh doanh Quốc tế (MBA)",
      "Kỹ sư Cơ khí Động lực Ô tô (HCMUTE)",
      "Chứng chỉ Giám đốc Điều hành Toàn diện (CEO Master)"
    ],
    stats: [
      { label: "Năm tiên phong", value: "15 Năm" },
      { label: "Lượt phục vụ", value: "10.000+ khách" },
      { label: "Hài lòng trung tâm", value: "99.6%" }
    ]
  }
};

export function StaffProfileModal({ isOpen, onClose, user }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [customBio, setCustomBio] = useState("");
  const [customExp, setCustomExp] = useState("");

  const roleKey = user?.role || "WORKSHOP_MANAGER";
  const defaultData = STAFF_PROFILES_DEFAULT[roleKey] || STAFF_PROFILES_DEFAULT.WORKSHOP_MANAGER;

  // Khôi phục tùy chỉnh cá nhân từ localStorage
  useEffect(() => {
    if (user?.phone_number) {
      const saved = localStorage.getItem(`staff_custom_profile_${user.phone_number}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.bio) setCustomBio(parsed.bio);
          if (parsed.exp) setCustomExp(parsed.exp);
        } catch (e) {}
      } else {
        setCustomBio(defaultData.bio);
        setCustomExp(defaultData.yearsExp);
      }
    }
  }, [user, defaultData]);

  if (!isOpen || !user) return null;

  const handleSaveProfile = () => {
    if (user?.phone_number) {
      localStorage.setItem(
        `staff_custom_profile_${user.phone_number}`,
        JSON.stringify({ bio: customBio, exp: customExp })
      );
      setIsEditing(false);
      toast.success("Đã cập nhật hồ sơ năng lực cán bộ thành công!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ban Năng Lực & Nút Đóng */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 sm:p-8 text-white flex items-start justify-between">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar Cán Bộ Chuyên Nghiệp */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-3 border-amber-400/80 shadow-xl bg-slate-800 shrink-0">
              <img
                src={defaultData.avatar}
                alt={user.full_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/logo.png";
                }}
              />
              <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" title="Đang trong ca trực" />
            </div>

            {/* Thông Tin Chức Danh */}
            <div className="text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {defaultData.code}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-emerald-400" /> Đang trong ca trực (On-Duty)
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {user.full_name}
              </h2>

              <p className="text-xs sm:text-sm font-bold text-amber-400">
                {defaultData.title}
              </p>

              <p className="text-xs text-slate-300 font-medium">
                {defaultData.dept}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 shrink-0"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thân Nội Dung Hồ Sơ Năng Lực (Scrollable) */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 text-xs">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
            {defaultData.stats.map((s, i) => (
              <div key={i} className="text-center space-y-0.5">
                <div className="text-sm sm:text-base font-black font-mono text-slate-900">{s.value}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Kinh Nghiệm & Tiểu Sử Nghề Nghiệp */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-600" />
                Kinh Nghiệm Thực Chiến & Năng Lực Quản Trị
              </h3>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" /> Lưu hồ sơ
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={customExp}
                  onChange={(e) => setCustomExp(e.target.value)}
                  placeholder="Số năm kinh nghiệm..."
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                />
                <textarea
                  rows={4}
                  value={customBio}
                  onChange={(e) => setCustomBio(e.target.value)}
                  placeholder="Mô tả quá trình công tác và chuyên môn..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{customExp || defaultData.yearsExp}</span>
                </div>
                <p className="text-slate-600 font-medium">
                  {customBio || defaultData.bio}
                </p>
              </div>
            )}
          </div>

          {/* Chuyên Môn Kỹ Thuật Cốt Lõi */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-600" />
              Chuyên Môn & Kỹ Năng Kỹ Thuật
            </h3>
            <div className="flex flex-wrap gap-2">
              {defaultData.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 border border-slate-200 text-slate-800 font-semibold text-[11px] flex items-center gap-1.5 transition shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Bằng Cấp & Chứng Chỉ Quốc Tế */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-amber-600" />
              Bằng Cấp & Chứng Nhận Nghề Nghiệp Quốc Tế
            </h3>
            <div className="space-y-2">
              {defaultData.certs.map((cert, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white border border-slate-200 hover:border-amber-300 flex items-start gap-3 transition shadow-xs"
                >
                  <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-800 text-[11px] leading-snug">{cert}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Thông Tin Liên Hệ & Cơ Sở Làm Việc */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-mono font-bold">{user.phone_number}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{user.email || "covan@hihihaha.vn"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Số 1 Võ Văn Ngân, TP. Thủ Đức</span>
            </div>
          </div>

        </div>

        {/* Footer Đóng */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Hồ sơ cán bộ đã xác thực chuẩn hệ thống HiHiHaHa Auto 4S
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm active:scale-95"
          >
            Đóng Hồ Sơ
          </button>
        </div>

      </div>
    </div>
  );
}
