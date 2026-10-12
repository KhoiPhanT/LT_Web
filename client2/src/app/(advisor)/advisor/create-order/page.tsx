"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Car,
  User,
  Phone,
  Gauge,
  ClipboardList,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Fuel,
  Wrench,
  Package,
  Mail,
  Search,
  Zap,
  Tag,
} from "lucide-react";
import { formatVND } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { GraphRagAiModal } from "@/components/technician/graph-rag-ai-modal";

interface OrderItem {
  id: string;
  name: string;
  code: string;
  type: "part" | "labor";
  quantity: number;
  unitPrice: number;
}

interface CatalogItem {
  code: string;
  name: string;
  type: "part" | "labor";
  price: number;
  category: string;
  stock?: number;
  unit?: string;
}

const AUTOMOTIVE_CATALOG: CatalogItem[] = [
  // HỆ THỐNG PHANH
  { code: "BRK-PAD-AKE", name: "Bộ má phanh trước gốm Ceramic Akebono", type: "part", price: 1250000, category: "Phanh", stock: 25, unit: "Bộ" },
  { code: "BRK-PAD-OEM", name: "Bộ má phanh sau bán kim loại OEM", type: "part", price: 850000, category: "Phanh", stock: 18, unit: "Bộ" },
  { code: "BRK-DISC-BREM", name: "Đĩa phanh xẻ rãnh khoan lỗ tản nhiệt Brembo", type: "part", price: 1650000, category: "Phanh", stock: 12, unit: "Cái" },
  { code: "BRK-DISC-OEM", name: "Đĩa phanh thông gió trước OEM", type: "part", price: 1100000, category: "Phanh", stock: 15, unit: "Cái" },
  { code: "BRK-FLUID-DOT4", name: "Dầu phanh tổng hợp Brembo DOT 4 (1L)", type: "part", price: 280000, category: "Phanh", stock: 30, unit: "Chai" },

  // DẦU NHỚT & PHỤ GIA
  { code: "ENG-OIL-MOTUL", name: "Dầu nhớt tổng hợp toàn phần Motul 300V 0W-20 (4L)", type: "part", price: 1050000, category: "Dầu nhớt", stock: 40, unit: "Can" },
  { code: "ENG-OIL-CAS", name: "Dầu nhớt động cơ Castrol Edge Titanium 5W-30 (4L)", type: "part", price: 950000, category: "Dầu nhớt", stock: 35, unit: "Can" },
  { code: "ENG-OIL-MOBIL", name: "Dầu nhớt Mobil 1 Advanced Fuel Economy 0W-20 (4L)", type: "part", price: 1150000, category: "Dầu nhớt", stock: 28, unit: "Can" },
  { code: "ATF-OIL-WS", name: "Dầu hộp số tự động Toyota ATF WS (4L)", type: "part", price: 1200000, category: "Dầu nhớt", stock: 20, unit: "Can" },

  // LỌC CÁC LOẠI
  { code: "ENG-FLT-TNGA", name: "Lọc dầu nhớt động cơ chính hãng Toyota TNGA", type: "part", price: 240000, category: "Bộ lọc", stock: 80, unit: "Cái" },
  { code: "ENG-FLT-KN", name: "Lọc gió động cơ lưu lượng cao K&N", type: "part", price: 1100000, category: "Bộ lọc", stock: 16, unit: "Cái" },
  { code: "ENG-FLT-OEM", name: "Lọc gió động cơ tiêu chuẩn OEM", type: "part", price: 280000, category: "Bộ lọc", stock: 45, unit: "Cái" },
  { code: "CAB-FLT-PM25", name: "Lọc gió điều hòa than hoạt tính khử mùi PM2.5", type: "part", price: 350000, category: "Bộ lọc", stock: 38, unit: "Cái" },
  { code: "FUEL-FLT-OEM", name: "Lọc nhiên liệu xăng tinh dầu gầm xe OEM", type: "part", price: 420000, category: "Bộ lọc", stock: 22, unit: "Cái" },

  // ĐÁNH LỬA & ĐỘNG CƠ
  { code: "IGN-PLUG-NGK", name: "Bộ 4 bugi Laser Iridium NGK chân dài", type: "part", price: 1400000, category: "Đánh lửa", stock: 30, unit: "Bộ" },
  { code: "IGN-COIL-DENSO", name: "Bô-bin đánh lửa Denso chính hãng Nhật Bản", type: "part", price: 850000, category: "Đánh lửa", stock: 14, unit: "Cái" },
  { code: "BELT-GATES-6PK", name: "Dây curoa tổng động cơ Gates Micro-V 6PK", type: "part", price: 550000, category: "Động cơ", stock: 20, unit: "Sợi" },
  { code: "COOL-RAD-LLC", name: "Nước làm mát két nước Long Life Coolant (4L)", type: "part", price: 450000, category: "Làm mát", stock: 32, unit: "Can" },

  // GẦM & TREO
  { code: "SUS-ARM-LOW", name: "Càng chữ A dưới bánh trước hợp kim OEM", type: "part", price: 1850000, category: "Gầm máy", stock: 8, unit: "Cái" },
  { code: "SUS-BALL-JNT", name: "Rotuyn trụ đứng càng A (Ball Joint)", type: "part", price: 450000, category: "Gầm máy", stock: 24, unit: "Cái" },
  { code: "SUS-STAB-LINK", name: "Rotuyn thanh cân bằng trước (Stabilizer Link)", type: "part", price: 380000, category: "Gầm máy", stock: 30, unit: "Cái" },
  { code: "SUS-TIE-ROD", name: "Rotuyn lái trong & ngoài trợ lực lái", type: "part", price: 520000, category: "Gầm máy", stock: 18, unit: "Cái" },
  { code: "SHK-KYB-FR", name: "Giảm xóc dầu khí nén bánh trước KYB Excel-G", type: "part", price: 1750000, category: "Gầm máy", stock: 10, unit: "Cái" },

  // ĐIỆN & PHỤ KIỆN
  { code: "BAT-VARTA-70", name: "Bình ắc quy khô Varta AGM 12V 70Ah", type: "part", price: 3200000, category: "Điện ô tô", stock: 15, unit: "Bình" },
  { code: "WIP-BOSCH-AERO", name: "Bộ đôi gạt mưa silicon không xương Bosch Aerotwin", type: "part", price: 650000, category: "Phụ kiện", stock: 40, unit: "Bộ" },

  // CÔNG THỢ TIÊU CHUẨN (LABOR)
  { code: "LAB-INSPECT-30", name: "Công kiểm tra tổng quát 30 hạng mục gầm & động cơ", type: "labor", price: 300000, category: "Tiền công" },
  { code: "LAB-MAINT-PERIOD", name: "Công bảo dưỡng định kỳ & kiểm tra phanh 4 bánh", type: "labor", price: 650000, category: "Tiền công" },
  { code: "LAB-OIL-CHANGE", name: "Công thay dầu động cơ & lọc nhớt", type: "labor", price: 150000, category: "Tiền công" },
  { code: "LAB-BRAKE-MAINT", name: "Công bảo dưỡng hệ thống phanh 4 bánh & bôi trơn ắc gá", type: "labor", price: 350000, category: "Tiền công" },
  { code: "LAB-DISC-SKIM", name: "Công láng đĩa phanh bằng máy tiện tự động (2 đĩa)", type: "labor", price: 450000, category: "Tiền công" },
  { code: "LAB-ALIGN-3D", name: "Công cân mâm bấm chì & chỉnh góc đặt bánh xe Laser 3D", type: "labor", price: 450000, category: "Tiền công" },
  { code: "LAB-AC-SERVICE", name: "Công bảo dưỡng nạp gas điều hòa & khử mùi ozon cabin", type: "labor", price: 550000, category: "Tiền công" },
  { code: "LAB-INJECT-CLEAN", name: "Công súc rửa kim phun xăng điện tử & họng hút siêu âm", type: "labor", price: 450000, category: "Tiền công" },
  { code: "LAB-SCAN-ECU", name: "Công đọc lỗi ECU chuyên sâu & xóa mã lỗi hệ thống", type: "labor", price: 250000, category: "Tiền công" },
];

export default function CreateOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form states - Khởi tạo rỗng để Cố vấn nhập mới từ đầu
  const [plateNumber, setPlateNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [carModel, setCarModel] = useState("");
  const [odo, setOdo] = useState("");
  const [fuelLevel, setFuelLevel] = useState("50");
  const [customerRequests, setCustomerRequests] = useState("");

  // Nhận diện và chuẩn hóa biển số viết hoa
  const handlePlateChange = (plate: string) => {
    setPlateNumber(plate.toUpperCase());
  };

  // Initial estimate items - Bắt đầu sạch không có dữ liệu mẫu
  const [items, setItems] = useState<OrderItem[]>([]);

  // Chế độ thêm: "labor" (Tiền công / Dịch vụ theo yêu cầu) hoặc "part" (Phụ tùng kho)
  const [addMode, setAddMode] = useState<"labor" | "part">("labor");

  const [newItemName, setNewItemName] = useState("");
  const [newItemCode, setNewItemCode] = useState("");
  const [newItemType, setNewItemType] = useState<"part" | "labor">("labor");
  const [newItemPrice, setNewItemPrice] = useState<number>(300000);

  // Autocomplete suggestion states
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<CatalogItem[]>(AUTOMOTIVE_CATALOG.slice(0, 8));
  const suggestionBoxRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter suggestions by name or code
  useEffect(() => {
    const q = newItemName.trim().toLowerCase();
    if (!q) {
      setFilteredSuggestions(AUTOMOTIVE_CATALOG.slice(0, 8));
      return;
    }

    const matched = AUTOMOTIVE_CATALOG.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        it.code.toLowerCase().includes(q) ||
        it.category.toLowerCase().includes(q)
    );

    const timer = setTimeout(async () => {
      try {
        const res = await api.getInventory(10, 1, undefined, q);
        if (res.success && res.data?.items) {
          const liveItems: CatalogItem[] = res.data.items.map((db: any) => ({
            code: db.part_code,
            name: db.part_name,
            type: "part" as const,
            price: db.retail_price || Math.round(db.cost_price * 1.35),
            category: db.category || "Kho phụ tùng",
            stock: db.stock_quantity,
            unit: db.unit || "Cái",
          }));
          const combined = [...matched];
          liveItems.forEach((lv) => {
            if (!combined.some((c) => c.code === lv.code)) {
              combined.push(lv);
            }
          });
          setFilteredSuggestions(combined.slice(0, 12));
        } else {
          setFilteredSuggestions(matched.slice(0, 10));
        }
      } catch {
        setFilteredSuggestions(matched.slice(0, 10));
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [newItemName]);

  const handleSelectSuggestion = (item: CatalogItem) => {
    setNewItemName(item.name);
    setNewItemCode(item.code);
    setNewItemType(item.type);
    setNewItemPrice(item.price);
    setIsSuggestionsOpen(false);
    toast.success(`Đã chọn [${item.code}]: ${item.name}`);
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const vat = Math.round(subtotal * 0.08); // VAT 8%
  const grandTotal = subtotal + vat;

  const handleSwitchMode = (mode: "labor" | "part") => {
    setAddMode(mode);
    setNewItemType(mode);
    setNewItemName("");
    setNewItemCode("");
    setNewItemPrice(mode === "labor" ? 300000 : 350000);
    setIsSuggestionsOpen(false);
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      toast.error(addMode === "labor" ? "Vui lòng nhập nội dung tiền công / yêu cầu sửa chữa!" : "Vui lòng nhập tên phụ tùng!");
      return;
    }
    const finalType = addMode;
    const newItem: OrderItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      code: newItemCode || (finalType === "labor" ? `LAB-REQ-${Date.now().toString().slice(-4)}` : `PART-${Date.now().toString().slice(-4)}`),
      type: finalType,
      quantity: 1,
      unitPrice: Number(newItemPrice) || 0,
    };
    setItems((prev) => [...prev, newItem]);
    setNewItemName("");
    setNewItemCode("");
    setNewItemPrice(addMode === "labor" ? 300000 : 350000);
    setIsSuggestionsOpen(false);
    toast.success(`Đã thêm ${finalType === "labor" ? "tiền công" : "phụ tùng"}: "${newItem.name}" (${formatVND(newItem.unitPrice)})`);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateQty = (id: string, delta: number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const next = Math.max(1, item.quantity + delta);
          return { ...item, quantity: next };
        }
        return item;
      })
    );
  };

  // Áp dụng toàn bộ chẩn đoán AI vào bảng báo giá
  const handleApplyAiDiagnosis = (
    parts: any[],
    laborCost: number,
    explanation: string,
    suggestedAction: string
  ) => {
    const newItems: OrderItem[] = [];

    // 1. Phụ tùng đề xuất
    parts.forEach((p, idx) => {
      const exists = items.some((it) => it.code === p.part_code);
      if (!exists) {
        newItems.push({
          id: `ai-part-${Date.now()}-${idx}`,
          name: p.part_name,
          code: p.part_code,
          type: "part",
          quantity: 1,
          unitPrice: Number(p.unit_price) || 0,
        });
      }
    });

    // 2. Tiền công thợ
    if (laborCost > 0) {
      newItems.push({
        id: `ai-labor-${Date.now()}`,
        name: suggestedAction ? `Công: ${suggestedAction}` : "Công bảo dưỡng & thay thế linh kiện theo AI",
        code: `LAB-AI-${Date.now().toString().slice(-4)}`,
        type: "labor",
        quantity: 1,
        unitPrice: laborCost,
      });
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
      toast.success(`Đã tự động nạp ${newItems.length} hạng mục (phụ tùng + tiền công) vào Báo giá!`);
    } else {
      toast.info("Các hạng mục này đã có sẵn trong bảng báo giá.");
    }
  };

  // Áp dụng 1 phụ tùng đơn lẻ
  const handleApplySinglePart = (part: any, laborCost: number) => {
    const exists = items.some((it) => it.code === part.part_code);
    if (exists) {
      toast.info(`Phụ tùng [${part.part_code}] đã có trong bảng báo giá.`);
      return;
    }
    const newItem: OrderItem = {
      id: `ai-part-${Date.now()}`,
      name: part.part_name,
      code: part.part_code,
      type: "part",
      quantity: 1,
      unitPrice: Number(part.unit_price) || 0,
    };
    setItems((prev) => [...prev, newItem]);
    toast.success(`Đã thêm phụ tùng ${part.part_name} vào báo giá!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber || !customerName || !phone) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    setLoading(true);
    try {
      const res = await api.createWorkOrder({
        license_plate: plateNumber,
        customer_phone: phone,
        customer_name: customerName,
        customer_email: customerEmail,
        vehicle_model: carModel,
        items: items.map((it) => ({
          name: it.name,
          part_code: it.code,
          type: it.type === "labor" ? "LABOR" : "PART",
          quantity: it.quantity,
          unit_price: it.unitPrice,
        })),
      });

      if (res.success && res.data) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("hihihaha_kanban_cards");
        }
        toast.success(`Khởi tạo thành công Lệnh #${res.data.order_code}! Xe đã vào Cột 1 (Tiếp nhận xe) trên bảng Kanban.`);
        setTimeout(() => {
          router.push("/advisor/work-orders");
        }, 800);
      } else {
        toast.error("Không thể lưu Lệnh sửa chữa lên hệ thống.");
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi lưu dữ liệu Lệnh sửa chữa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/advisor/work-orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-amber-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách Lệnh Sửa Chữa
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tiếp Nhận Xe Mới & Lập Báo Giá</h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Lập phiếu tiếp nhận xe dịch vụ 4S, ghi nhận tình trạng ngoại quan và báo giá sơ bộ ban đầu
          </p>
        </div>

        <div className="flex items-center gap-3">
          <GraphRagAiModal
            vehicleModel={carModel}
            initialSymptoms={customerRequests}
            onApplyAll={handleApplyAiDiagnosis}
            onApplyPart={handleApplySinglePart}
            triggerLabel="⚡ AI Chẩn Đoán & Tự Động Lập Báo Giá"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Thông tin xe & Khách hàng */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Thông tin xe & khách */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Car className="w-4 h-4 text-amber-500" />
              Thông Tin Chủ Xe & Phương Tiện
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                  Biển Số Xe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Car className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={plateNumber}
                    onChange={(e) => handlePlateChange(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-mono font-bold tracking-wider placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-xs transition"
                    placeholder="VD: 51K-888.88"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                  Tên Khách Hàng <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-xs transition"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                  Số Điện Thoại <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-mono font-semibold placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-xs transition"
                    placeholder="0908888888"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5 flex items-center justify-between">
                  <span>Email Khách Hàng (Gmail) <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-amber-600 font-semibold lowercase">Tự động kích hoạt tài khoản</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-xs transition"
                    placeholder="khachhang@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                  Dòng Xe & Đời Xe
                </label>
                <input
                  type="text"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-xs transition"
                  placeholder="Toyota Camry 2.5Q"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                  Số Km Hiện Tại (ODO)
                </label>
                <div className="relative">
                  <Gauge className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="number"
                    value={odo}
                    onChange={(e) => setOdo(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-mono font-medium placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-xs transition"
                    placeholder="42500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                  Nhiên Liệu Còn Lại (%)
                </label>
                <div className="relative">
                  <Fuel className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={fuelLevel}
                    onChange={(e) => setFuelLevel(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-mono font-medium placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-xs transition"
                    placeholder="65"
                  />
                </div>
              </div>
            </div>

            {/* Banner Thông báo tự động kích hoạt tài khoản */}
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-amber-900">
                  Tự động kích hoạt tài khoản Cổng Khách Hàng
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Khi Cố vấn lưu Lệnh, hệ thống sẽ tự động tạo hồ sơ khách hàng và gửi email xác nhận tiếp nhận xe qua Gmail. Khách hàng về nhà chỉ cần mở trang đăng nhập bằng <strong>Biển số xe</strong> và <strong>Số điện thoại</strong> là có thể theo dõi xe ngay.
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                Yêu Cầu & Triệu Chứng Của Khách Hàng
              </label>
              <textarea
                rows={3}
                value={customerRequests}
                onChange={(e) => setCustomerRequests(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-xs transition"
                placeholder="Ghi nhận phản hồi về tiếng ồn, rung lắc, nhu cầu bảo dưỡng định kỳ..."
              />
            </div>
          </div>

          {/* Card 2: Hạng mục báo giá sơ bộ */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-amber-500" />
                Danh Mục Báo Giá Dự Kiến ({items.length} hạng mục)
              </h2>
              <GraphRagAiModal
                vehicleModel={carModel}
                initialSymptoms={customerRequests}
                onApplyAll={handleApplyAiDiagnosis}
                onApplyPart={handleApplySinglePart}
                triggerLabel="✨ Gợi Ý Phụ Tùng Bằng AI"
              />
            </div>

            {/* List */}
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {items.length === 0 ? (
                <div className="py-10 px-4 text-center space-y-3 bg-slate-50/60">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100/90 border border-amber-300 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">Chưa có hạng mục báo giá nào</p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      Bấm nút <strong className="text-amber-700 font-extrabold">&quot;✨ Gợi Ý Phụ Tùng Bằng AI&quot;</strong> ở trên để bốc tự động vật tư thực tế trong kho, hoặc gõ tìm kiếm phụ tùng & tiền công ở khung bên dưới.
                    </p>
                  </div>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50 transition"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 mt-0.5 ${
                          item.type === "part"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {item.type === "part" ? "Phụ tùng" : "Nhân công"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 leading-snug break-words">{item.name}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{item.code}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, -1)}
                          className="px-2.5 py-1 text-xs hover:bg-slate-100 font-bold text-slate-700 active:bg-slate-200"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-mono font-bold text-slate-900">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, 1)}
                          className="px-2.5 py-1 text-xs hover:bg-slate-100 font-bold text-slate-700 active:bg-slate-200"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right min-w-[90px] sm:w-32">
                        <p className="text-sm font-extrabold font-mono text-amber-600">
                          {formatVND(item.unitPrice * item.quantity)}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {formatVND(item.unitPrice)}/đv
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition shrink-0"
                        title="Xóa hạng mục"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick add item form với 2 Chế Độ: Tiền Công Theo Yêu Cầu & Phụ Tùng Kho */}
            <div className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/70 space-y-4 shadow-xs" ref={suggestionBoxRef}>
              {/* Tab Selector: Tiền công vs Phụ tùng */}
              <div className="flex items-center justify-between flex-wrap gap-2.5 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("labor")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      addMode === "labor"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Tiền Công & Yêu Cầu Sửa Chữa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("part")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      addMode === "part"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    Phụ Tùng & Vật Tư Kho
                  </button>
                </div>

                <span className="text-[11px] text-slate-500 font-medium">
                  {addMode === "labor" 
                    ? "Tự do nhập nội dung tiền công và đơn giá thỏa thuận với khách hàng" 
                    : "Tra cứu theo mã hoặc tên phụ tùng có sẵn trong kho vật tư"}
                </span>
              </div>

              {/* Form Inputs theo Chế Độ */}
              {addMode === "labor" ? (
                /* CHẾ ĐỘ TIỀN CÔNG / DỊCH VỤ THEO YÊU CẦU */
                <div className="space-y-3">
                  {/* Gợi ý lấy từ yêu cầu khách hàng đã nhập ở trên */}
                  {customerRequests.trim() && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Từ yêu cầu khách:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setNewItemName(`Công xử lý: ${customerRequests.trim()}`);
                          setNewItemCode(`LAB-CUST-REQ`);
                        }}
                        className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg transition flex items-center gap-1 shadow-2xs"
                      >
                        <Zap className="w-3 h-3 text-emerald-600" />
                        Điền nhanh: &quot;{customerRequests.trim().slice(0, 50)}{customerRequests.trim().length > 50 ? "..." : ""}&quot;
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end">
                    {/* Tên tiền công / yêu cầu sửa chữa */}
                    <div className="md:col-span-7 space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-emerald-600" /> Tên tiền công / Nội dung sửa chữa
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Công hạ số kiểm tra tiếng gầm, Công súc béc phun xăng, Công gò hàn..."
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
                      />
                    </div>

                    {/* Đơn giá tiền công */}
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">
                        Đơn giá tiền công (VNĐ)
                      </label>
                      <input
                        type="number"
                        step={10000}
                        placeholder="VD: 300000"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono font-bold placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
                      />
                    </div>

                    {/* Nút Thêm Tiền Công */}
                    <div className="md:col-span-2">
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Plus className="w-4 h-4" /> Thêm Công
                      </button>
                    </div>
                  </div>

                  {/* Nhanh mức giá tiền công */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Đơn giá nhanh:</span>
                    {[150000, 250000, 350000, 450000, 650000, 1000000].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewItemPrice(p)}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-[10px] font-mono font-bold text-slate-700 transition"
                      >
                        {formatVND(p)}
                      </button>
                    ))}
                  </div>

                  {/* Gợi ý các hạng mục tiền công chuẩn */}
                  <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Công chuẩn gara:</span>
                    {AUTOMOTIVE_CATALOG.filter((it) => it.type === "labor").map((lab) => (
                      <button
                        key={lab.code}
                        type="button"
                        onClick={() => {
                          setNewItemName(lab.name);
                          setNewItemCode(lab.code);
                          setNewItemPrice(lab.price);
                        }}
                        className="px-2 py-1 rounded-lg bg-white border border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50/70 text-[11px] font-medium text-emerald-900 transition shadow-2xs flex items-center gap-1"
                      >
                        <span>+ {lab.name}</span>
                        <span className="font-mono font-bold text-emerald-600 text-[10px]">({formatVND(lab.price)})</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* CHẾ ĐỘ PHỤ TÙNG KHO VỚI AUTOCOMPLETE */
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end">
                    {/* Input Tên Phụ Tùng kèm Dropdown Gợi Ý */}
                    <div className="md:col-span-7 space-y-1 relative">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Package className="w-3 h-3 text-blue-600" /> Tra cứu phụ tùng kho (mã / tên)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Gõ mã hoặc tên phụ tùng (VD: Má phanh, Lọc nhớt, Dầu Motul...)"
                          value={newItemName}
                          onFocus={() => setIsSuggestionsOpen(true)}
                          onChange={(e) => {
                            setNewItemName(e.target.value);
                            setIsSuggestionsOpen(true);
                          }}
                          className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-xs"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                      </div>

                      {/* Dropdown Gợi Ý Phụ Tùng */}
                      {isSuggestionsOpen && filteredSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden divide-y divide-slate-100 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                          <div className="px-3 py-1.5 bg-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-100">
                            <span className="flex items-center gap-1">
                              <Package className="w-3 h-3 text-blue-500" />
                              Kho phụ tùng & vật tư ({filteredSuggestions.length})
                            </span>
                            <span className="text-blue-600 font-semibold lowercase">click để điền</span>
                          </div>

                          {filteredSuggestions.map((it) => (
                            <div
                              key={it.code}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectSuggestion(it);
                              }}
                              className="p-2.5 hover:bg-blue-50/70 transition-colors cursor-pointer flex items-center justify-between gap-2.5 group text-left"
                            >
                              <div className="flex-1 min-w-0 space-y-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                                    {it.type === "part" ? "Phụ tùng" : "Công"}
                                  </span>
                                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                    {it.code}
                                  </span>
                                  <span className="text-[10px] text-slate-500">{it.category}</span>
                                </div>
                                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate">
                                  {it.name}
                                </p>
                              </div>

                              <div className="text-right shrink-0">
                                <p className="text-xs font-black font-mono text-blue-600">
                                  {formatVND(it.price)}
                                </p>
                                {it.stock !== undefined && (
                                  <p className="text-[10px] text-emerald-700 font-semibold">
                                    Tồn: {it.stock} {it.unit || "cái"}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Đơn giá phụ tùng */}
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">
                        Đơn giá phụ tùng (VNĐ)
                      </label>
                      <input
                        type="number"
                        placeholder="Đơn giá (VNĐ)"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono font-bold placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs"
                      />
                    </div>

                    {/* Nút Thêm Phụ Tùng */}
                    <div className="md:col-span-2">
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Plus className="w-4 h-4" /> Thêm Vật Tư
                      </button>
                    </div>
                  </div>

                  {/* Chip chọn nhanh các phụ tùng phổ biến */}
                  <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phổ biến trong kho:</span>
                    {AUTOMOTIVE_CATALOG.filter((it) => it.type === "part").slice(0, 6).map((chip) => (
                      <button
                        key={chip.code}
                        type="button"
                        onClick={() => handleSelectSuggestion(chip)}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-[10px] font-semibold text-slate-700 transition shadow-2xs"
                      >
                        + {chip.name.split(" ").slice(0, 4).join(" ")}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Tóm tắt chi phí & Nút xác nhận */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6 sticky top-24">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">Tóm Tắt Báo Giá Sơ Bộ</h2>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span className="font-medium">Tổng phụ tùng ({items.filter((i) => i.type === "part").length}):</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatVND(
                    items
                      .filter((i) => i.type === "part")
                      .reduce((s, i) => s + i.unitPrice * i.quantity, 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-medium">Tổng tiền công ({items.filter((i) => i.type === "labor").length}):</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatVND(
                    items
                      .filter((i) => i.type === "labor")
                      .reduce((s, i) => s + i.unitPrice * i.quantity, 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-medium">Tạm tính (chưa VAT):</span>
                <span className="font-mono font-bold text-slate-900">{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-medium">Thuế VAT (8%):</span>
                <span className="font-mono font-bold text-slate-900">{formatVND(vat)}</span>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline font-bold">
                <span className="text-base text-slate-900">Tổng cộng:</span>
                <span className="text-2xl font-black font-mono text-amber-600">{formatVND(grandTotal)}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1 text-amber-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Quy trình tiếp nhận 4S:
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Sau khi tạo lệnh, thông báo sẽ lập tức chuyển đến Quản Đốc Xưởng trên bảng Kanban để phân công khoang và thợ.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? "Đang Khởi Tạo..." : "Tạo Lệnh Sửa Chữa (Work Order)"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
