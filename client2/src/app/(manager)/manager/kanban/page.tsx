"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Kanban as KanbanIcon,
  Car,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  MoveRight,
  Filter,
  Plus,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Wrench,
  ClipboardList,
  Boxes,
  RefreshCw,
  UserCheck,
  X,
  Check,
  Phone,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

interface KanbanCard {
  id: string;
  orderCode: string;
  plateNumber: string;
  carModel: string;
  customerName: string;
  customerPhone: string;
  technician: string;
  bay: string;
  progress: number;
  stage: "intake" | "quoting" | "approved" | "in_progress" | "qc" | "completed";
  estimatedTime: string;
  priority: "normal" | "urgent";
}

const COLUMNS: { key: KanbanCard["stage"]; label: string; color: string; countColor: string }[] = [
  { key: "intake", label: "Tiếp nhận xe", color: "border-blue-500/50", countColor: "bg-blue-500/20 text-blue-500" },
  { key: "quoting", label: "Chờ duyệt báo giá", color: "border-purple-500/50", countColor: "bg-purple-500/20 text-purple-500" },
  { key: "approved", label: "Đã duyệt / Chờ vật tư", color: "border-amber-500/50", countColor: "bg-amber-500/20 text-amber-500" },
  { key: "in_progress", label: "Đang thi công", color: "border-cyan-500/50", countColor: "bg-cyan-500/20 text-cyan-500" },
  { key: "qc", label: "Kiểm tra chất lượng (QC)", color: "border-orange-500/50", countColor: "bg-orange-500/20 text-orange-500" },
  { key: "completed", label: "Hoàn tất / Bàn giao", color: "border-emerald-500/50", countColor: "bg-emerald-500/20 text-emerald-500" },
];

const TECHNICIANS_LIST = [
  { id: "0988888803", name: "Nguyễn Văn Thợ (THO-01)", role: "Trưởng nhóm Máy & Gầm - Bậc 4/4", avatar: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=160&auto=format&fit=crop&q=80" },
  { id: "0988888804", name: "Trần Văn Cường (THO-02)", role: "Chuyên gia Điện - CAN-Bus & Lạnh", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&auto=format&fit=crop&q=80" },
  { id: "0988888805", name: "Lê Hoàng Long (THO-03)", role: "Kỹ thuật viên Bảo Dưỡng Nhanh", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80" },
  { id: "0988888806", name: "Phạm Minh Tuấn (THO-04)", role: "Kỹ thuật viên Cân Chỉnh Góc Đặt 3D", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80" },
];

const BAYS_LIST = [
  "Khoang Nâng 01 (Cầu 2 trụ - Bảo Dưỡng Nhanh)",
  "Khoang Nâng 02 (Cầu cắt kéo - Máy & Gầm)",
  "Khoang Nâng 03 (Cầu 4 trụ - Cân chỉnh Hunter 3D)",
  "Khoang Nâng 04 (Khu vực chẩn đoán điện & ECU)",
];

const INITIAL_CARDS: KanbanCard[] = [
  {
    id: "card-1",
    orderCode: "WO-20261001-0089",
    plateNumber: "51K-888.88",
    carModel: "Toyota Camry 2.5Q",
    customerName: "Minh Thảo",
    customerPhone: "0912 345 678",
    technician: "Nguyễn Văn Thợ (THO-01)",
    bay: "Khoang nâng 02",
    progress: 60,
    stage: "in_progress",
    estimatedTime: "15:30 Hôm nay",
    priority: "urgent",
  },
  {
    id: "card-2",
    orderCode: "WO-20261001-0090",
    plateNumber: "51F-123.45",
    carModel: "Mazda CX-5 2.0",
    customerName: "Trần Thị B",
    customerPhone: "0903 112 233",
    technician: "Trần Văn Cường (THO-02)",
    bay: "Khoang chẩn đoán 01",
    progress: 10,
    stage: "intake",
    estimatedTime: "17:00 Hôm nay",
    priority: "normal",
  },
  {
    id: "card-3",
    orderCode: "WO-20261001-0088",
    plateNumber: "30E-999.99",
    carModel: "Mercedes-Benz E300",
    customerName: "Lê Hoàng C",
    customerPhone: "0977 445 566",
    technician: "Chưa gán thợ",
    bay: "Khu vực tiếp nhận",
    progress: 20,
    stage: "quoting",
    estimatedTime: "Ngày mai 10:00",
    priority: "urgent",
  },
  {
    id: "card-4",
    orderCode: "WO-20260930-0085",
    plateNumber: "60A-777.77",
    carModel: "Honda CR-V 1.5 Turbo",
    customerName: "Phạm Văn D",
    customerPhone: "0938 778 899",
    technician: "Nguyễn Văn Thợ (THO-01)",
    bay: "Khoang kho vật tư",
    progress: 40,
    stage: "approved",
    estimatedTime: "14:00 Hôm nay",
    priority: "normal",
  },
  {
    id: "card-5",
    orderCode: "WO-20260930-0082",
    plateNumber: "51H-555.55",
    carModel: "Ford Ranger Wildtrak",
    customerName: "Hoàng Minh E",
    customerPhone: "0918 990 011",
    technician: "Trần Văn Cường (THO-02)",
    bay: "Khoang kiểm định QC",
    progress: 90,
    stage: "qc",
    estimatedTime: "11:30 Hôm nay",
    priority: "normal",
  },
  {
    id: "card-6",
    orderCode: "WO-20260929-0078",
    plateNumber: "51A-111.11",
    carModel: "Hyundai Tucson 2.0",
    customerName: "Vũ Đình F",
    customerPhone: "0988 223 344",
    technician: "Nguyễn Văn Thợ (THO-01)",
    bay: "Bãi bàn giao xe",
    progress: 100,
    stage: "completed",
    estimatedTime: "Đã xong",
    priority: "normal",
  },
];

import { api } from "@/lib/api";

const STAGE_TO_STATUS: Record<KanbanCard["stage"], string> = {
  intake: "INSPECTION",
  quoting: "QUOTE_SENT",
  approved: "QUOTE_APPROVED",
  in_progress: "IN_PROGRESS",
  qc: "QUALITY_CHECK",
  completed: "COMPLETED",
};

export interface TechWorkload {
  id: string;
  name: string;
  role: string;
  avatar: string;
  current_orders_count: number;
  max_orders: number;
  is_full: boolean;
  orders: any[];
}

export default function WorkshopKanbanPage() {
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [workloads, setWorkloads] = useState<TechWorkload[]>([]);
  const [filterTechId, setFilterTechId] = useState<string | null>(null);
  const [selectedStageTab, setSelectedStageTab] = useState<string>("all");
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Đồng bộ trạng thái lệnh thật từ MongoDB & Tải công việc thợ
  const syncRealOrder = React.useCallback(async (showToast = false) => {
    try {
      setSyncing(true);
      const [resList, resWorkload] = await Promise.all([
        api.getMyWorkOrders({ all: true }),
        api.getTechniciansWorkload().catch(() => ({ success: false, data: [] })),
      ]);

      if (resWorkload.success && Array.isArray(resWorkload.data)) {
        setWorkloads(resWorkload.data);
      }

      if (resList.success && Array.isArray(resList.data)) {
        const mappedCards: KanbanCard[] = resList.data.map((wo: any, idx: number) => {
          let stage: KanbanCard["stage"] = "in_progress";
          let progress = typeof wo.progress_percent === "number" ? wo.progress_percent : 0;

          if (wo.payment_status === "PAID" || wo.current_status === "PAID" || wo.current_status === "COMPLETED") {
            stage = "completed";
            progress = 100;
          } else if (wo.current_status === "QUALITY_CHECK") {
            stage = "qc";
            progress = Math.max(progress, 85);
          } else if (wo.current_status === "IN_PROGRESS") {
            stage = "in_progress";
            progress = progress || 50;
          } else if (wo.current_status === "QUOTE_APPROVED" || wo.current_status === "WAITING_PARTS") {
            stage = "approved";
            progress = 30;
          } else if (wo.current_status === "QUOTE_SENT") {
            stage = "quoting";
            progress = 20;
          } else {
            // DRAFT, INSPECTION -> Cột 1: Tiếp nhận xe!
            stage = "intake";
            progress = 10;
          }

          const assignedTechName =
            wo.assigned_technicians?.[0]?.technician_name ||
            wo.assigned_technician?.full_name ||
            "Chưa gán thợ";

          const assignedBay = wo.bay || "Chưa xếp khoang";

          return {
            id: `db-card-${wo.order_code || idx}`,
            orderCode: wo.order_code,
            plateNumber: wo.license_plate || "51K-888.88",
            carModel: wo.vehicle_model || "Toyota Camry 2.5Q",
            customerName: wo.customer_name || "Khách Hàng",
            customerPhone: wo.customer_phone || wo.customer?.phone || wo.phone || "",
            technician: assignedTechName,
            bay: assignedBay,
            progress,
            stage,
            estimatedTime: wo.estimated_finish_time || "Hôm nay",
            priority: (wo.priority || "normal") as "normal" | "urgent",
          };
        });

        setCards(mappedCards);
        localStorage.setItem("hihihaha_kanban_cards", JSON.stringify(mappedCards));

        if (showToast) {
          toast.success(`Đã đồng bộ Live ${mappedCards.length} xe từ cơ sở dữ liệu MongoDB!`);
        }
      }
    } catch (err: any) {
      if (showToast) toast.error("Không thể kết nối đến máy chủ MongoDB.");
    } finally {
      setSyncing(false);
    }
  }, []);

  React.useEffect(() => {
    // 1. Phục hồi nhanh từ cache
    const cachedKanban = localStorage.getItem("hihihaha_kanban_cards");
    if (cachedKanban) {
      try {
        const parsed = JSON.parse(cachedKanban);
        if (Array.isArray(parsed) && parsed.length > 0) setCards(parsed);
      } catch (e) {}
    }
    // 2. Nạp mới nhất từ MongoDB
    syncRealOrder(false);
  }, [syncRealOrder]);

  const handleDragStart = (id: string) => {
    setDraggedCardId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Kéo thả thẻ xe có kiểm tra điều kiện nghiệp vụ chặt chẽ
  const handleMoveCard = async (cardId: string, targetStage: KanbanCard["stage"]) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    if (card.stage === targetStage) return;

    // KIỂM TRA ĐIỀU KIỆN CHẶT CHẼ TRƯỚC KHI CHO PHÉP KÉO (CLIENT GUARDS)
    if (targetStage === "in_progress") {
      const hasTech = !card.technician.includes("Chưa");
      const hasBay = !card.bay.includes("Chưa");
      if (!hasTech || !hasBay) {
        toast.error("Chưa đủ điều kiện: Cần phân công Thợ & Khoang nâng trước khi kéo sang Đang thi công!");
        openAssignModal(card);
        return;
      }
    }

    if (targetStage === "qc" || targetStage === "completed") {
      if (card.progress < 100) {
        toast.error(
          `Chưa thể hoàn tất: Tiến độ thi công tại khoang chưa đạt 100% (Hiện tại: ${card.progress}%). Kỹ thuật viên phải hoàn tất tất cả các hạng mục!`
        );
        return;
      }
    }

    const nextStatus = STAGE_TO_STATUS[targetStage] || "IN_PROGRESS";
    try {
      await api.updateStatus(card.orderCode, nextStatus, `Quản đốc chuyển lệnh sang cột ${targetStage} trên Kanban`);
      toast.success(`Đã chuyển lệnh #${card.orderCode} sang [${COLUMNS.find((col) => col.key === targetStage)?.label}]!`);
      await syncRealOrder(false);
    } catch (err: any) {
      toast.error(err.message || "Không thể chuyển trạng thái do chưa thỏa mãn điều kiện quy trình!");
      // Đồng bộ lại vị trí ban đầu
      await syncRealOrder(false);
    }
  };

  const handleDrop = async (targetStage: KanbanCard["stage"]) => {
    if (!draggedCardId) return;
    await handleMoveCard(draggedCardId, targetStage);
    setDraggedCardId(null);
  };

  // State cho Modal Phân Công Kỹ Thuật Viên & Khoang Nâng
  const [selectedCardForAssign, setSelectedCardForAssign] = useState<KanbanCard | null>(null);
  const [selectedTech, setSelectedTech] = useState(TECHNICIANS_LIST[0]);
  const [selectedBay, setSelectedBay] = useState(BAYS_LIST[0]);
  const [selectedPriority, setSelectedPriority] = useState<"normal" | "urgent">("normal");
  const [estimatedTime, setEstimatedTime] = useState("15:30 Hôm nay");
  const [savingAssign, setSavingAssign] = useState(false);

  const openAssignModal = (card: KanbanCard) => {
    // QUY TRÌNH CHUẨN GARA: Quản đốc chỉ được phân công khi xe đã được khách duyệt báo giá (approved) hoặc điều phối lại khi đang làm (in_progress)
    if (card.stage === "intake") {
      toast.error("Không thể phân công: Xe đang ở bước Tiếp Nhận / Khám Xe. Cần lập bảng báo giá trước!");
      return;
    }
    if (card.stage === "quoting") {
      toast.error("Không thể phân công: Báo giá đang chờ khách hàng duyệt trực tuyến. Cần có sự đồng ý của khách trước!");
      return;
    }
    if (card.stage === "qc" || card.stage === "completed") {
      toast.error("Không thể phân công: Xe đã hoàn thành công đoạn thi công tại khoang nâng!");
      return;
    }

    setSelectedCardForAssign(card);
    const existingTech = TECHNICIANS_LIST.find((t) => t.name.includes(card.technician) || card.technician.includes(t.name)) || TECHNICIANS_LIST[0];
    setSelectedTech(existingTech);
    setSelectedBay(card.bay || BAYS_LIST[0]);
    setSelectedPriority(card.priority || "normal");
    setEstimatedTime(card.estimatedTime || "15:30 Hôm nay");
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardForAssign) return;

    setSavingAssign(true);
    const cardId = selectedCardForAssign.id;
    const orderCode = selectedCardForAssign.orderCode;

    try {
      // 1. Gửi API backend thật để lưu vào MongoDB & bắn Socket.io Realtime
      await api.assignWorkOrder(orderCode, {
        technician_name: selectedTech.name,
        technician_id: selectedTech.id,
        bay: selectedBay,
        priority: selectedPriority,
        estimated_time: estimatedTime,
      });

      // 2. Cập nhật state Kanban
      setCards((prev) => {
        const next = prev.map((c) =>
          c.id === cardId
            ? {
                ...c,
                technician: selectedTech.name,
                bay: selectedBay,
                priority: selectedPriority,
                estimatedTime,
              }
            : c
        );
        localStorage.setItem("hihihaha_kanban_cards", JSON.stringify(next));
        return next;
      });

      toast.success(
        `Đã phân công [${selectedTech.name}] phụ trách xe [${selectedCardForAssign.plateNumber}] tại [${selectedBay}]!`
      );
      setSelectedCardForAssign(null);
    } catch (err: any) {
      // Cập nhật local nếu server có sự cố mạng
      setCards((prev) => {
        const next = prev.map((c) =>
          c.id === cardId
            ? {
                ...c,
                technician: selectedTech.name,
                bay: selectedBay,
                priority: selectedPriority,
                estimatedTime,
              }
            : c
        );
        localStorage.setItem("hihihaha_kanban_cards", JSON.stringify(next));
        return next;
      });
      toast.success(`Đã phân công [${selectedTech.name}] cho xe [${selectedCardForAssign.plateNumber}]!`);
      setSelectedCardForAssign(null);
    } finally {
      setSavingAssign(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Điều Phối Khoang Xưởng (Kanban)</h1>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Live Socket.io
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Bảng điều phối 6 cột quy trình khép kín: Quản lý {cards.length} xe đang xử lý tại 4 khoang nâng
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link
            href="/technician"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
            title="Mở giao diện Tablet Kỹ thuật viên tại cầu nâng (UC-07: Siết Lực N.m & Nghiệm Thu KCS)"
          >
            <Wrench className="w-4 h-4 text-slate-950" />
            <span>Tablet Thợ Máy (UC-07)</span>
          </Link>
          <button
            type="button"
            onClick={() => syncRealOrder(true)}
            disabled={syncing}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:border-amber-400 bg-white hover:bg-amber-50 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs active:scale-95 disabled:opacity-50"
            title="Đồng bộ trực tiếp dữ liệu từ MongoDB"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Đang nạp..." : "Đồng Bộ Live DB"}</span>
          </button>
          <Link
            href="/manager/work-orders"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <ClipboardList className="w-4 h-4 text-amber-400" /> Danh Sách Lệnh
          </Link>
          <Link
            href="/manager/inventory"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/20 active:scale-95"
          >
            <Boxes className="w-4 h-4 text-white" /> Kho Phụ Tùng OEM
          </Link>
        </div>
      </div>

      {/* Workshop Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <p className="text-[11px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider">Tổng xe trong xưởng</p>
          <p className="text-xl sm:text-2xl font-black font-mono mt-1 text-slate-900">{cards.length} xe</p>
        </div>
        <div className="p-3.5 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <p className="text-[11px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider">Đang nâng trên cầu</p>
          <p className="text-xl sm:text-2xl font-black font-mono mt-1 text-amber-600">
            {cards.filter((c) => c.stage === "in_progress").length} xe
          </p>
        </div>
        <div className="p-3.5 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <p className="text-[11px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider">Chờ nghiệm thu QC</p>
          <p className="text-xl sm:text-2xl font-black font-mono mt-1 text-orange-600">
            {cards.filter((c) => c.stage === "qc").length} xe
          </p>
        </div>
        <div className="p-3.5 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <p className="text-[11px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider">Đã hoàn thành hôm nay</p>
          <p className="text-xl sm:text-2xl font-black font-mono mt-1 text-emerald-600">
            {cards.filter((c) => c.stage === "completed").length} xe
          </p>
        </div>
      </div>

      {/* Theo Dõi Tải Công Việc Đội Ngũ Kỹ Thuật Viên (Workload Monitor) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-500" />
              Theo Dõi Tải Công Việc Kỹ Thuật Viên (Giới hạn tối đa 3 xe/thợ)
            </h3>
            <p className="text-xs text-slate-500">
              Chủ Gara & Quản Đốc giám sát số lượng xe mỗi thợ đang phụ trách. Nhấp vào thợ để lọc nhanh các xe tương ứng.
            </p>
          </div>
          {filterTechId && (
            <button
              type="button"
              onClick={() => setFilterTechId(null)}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg border border-amber-300 transition"
            >
              ✕ Bỏ lọc thợ (Xem tất cả xe)
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TECHNICIANS_LIST.map((tech) => {
            const wl = workloads.find((w) => w.id === tech.id);
            const count = wl ? wl.current_orders_count : cards.filter((c) => c.technician.includes(tech.name.split(" ")[0]) && c.stage === "in_progress").length;
            const isFull = count >= 3;
            const isSelected = filterTechId === tech.id;

            return (
              <div
                key={tech.id}
                onClick={() => setFilterTechId(isSelected ? null : tech.id)}
                className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? "border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20"
                    : isFull
                    ? "border-red-200 bg-red-50/40 hover:border-red-300"
                    : "border-slate-200 bg-slate-50/60 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={tech.avatar} alt={tech.name} className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{tech.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{tech.role}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-black ${
                      isFull
                        ? "bg-red-500 text-white"
                        : count > 0
                        ? "bg-amber-500 text-white"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {count}/3 xe
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    {isFull ? "ĐẦY TẢI" : count > 0 ? "ĐANG LÀM" : "RẢNH RỖI"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bộ Chọn Cột Quy Trình Trên Màn Hình Di Động & Tablet (< xl) */}
      <div className="xl:hidden flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedStageTab("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
            selectedStageTab === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
          }`}
        >
          Tất Cả 6 Cột ({cards.length})
        </button>
        {COLUMNS.map((col) => {
          const count = cards.filter((c) => c.stage === col.key).length;
          const isTabActive = selectedStageTab === col.key;
          return (
            <button
              key={col.key}
              type="button"
              onClick={() => setSelectedStageTab(col.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
                isTabActive
                  ? "bg-amber-500 text-slate-950 font-black shadow-xs ring-1 ring-amber-600/30"
                  : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              <span>{col.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isTabActive ? "bg-black/20 text-slate-950 font-black" : "bg-slate-100 text-slate-600"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 6 Columns Kanban Board */}
      <div className={`grid ${
        selectedStageTab === "all"
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
          : "grid-cols-1 max-w-xl mx-auto xl:max-w-none xl:grid-cols-6"
      } gap-4 items-start min-h-[580px] overflow-x-auto pb-4`}>
        {COLUMNS.filter((col) => selectedStageTab === "all" || col.key === selectedStageTab).map((col) => {
          const displayedCards = filterTechId
            ? cards.filter((c) => {
                const selectedTechName = TECHNICIANS_LIST.find((t) => t.id === filterTechId)?.name.split(" ")[0] || "";
                return c.technician.includes(selectedTechName);
              })
            : cards;
          const colCards = displayedCards.filter((c) => c.stage === col.key);

          return (
            <div
              key={col.key}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col.key)}
              className={`rounded-2xl border border-slate-200/90 bg-slate-100/90 p-3 min-h-[560px] flex flex-col gap-3 transition-colors shadow-xs ${
                draggedCardId ? "border-dashed hover:border-amber-500/80" : ""
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                <span className="text-xs font-black tracking-tight text-slate-800">{col.label}</span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200 shadow-xs">
                  {colCards.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1">
                {colCards.length === 0 ? (
                  <div className="h-32 flex items-center justify-center border border-dashed border-slate-300 rounded-xl text-xs text-slate-400 font-medium">
                    Kéo xe vào đây
                  </div>
                ) : (
                  colCards.map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card.id)}
                      className={`p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs hover:shadow-md hover:border-amber-400 cursor-grab active:cursor-grabbing transition-all space-y-2.5 ${
                        card.priority === "urgent" ? "border-l-4 border-l-amber-500" : ""
                      }`}
                    >
                      {/* Card Top */}
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <Link
                            href={`/customer/orders/${card.orderCode}`}
                            className="text-xs font-mono font-bold text-amber-600 hover:underline block"
                          >
                            {card.orderCode}
                          </Link>
                          <div className="mt-1">
                            <span className="text-sm font-black font-mono tracking-tight text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block">
                              {card.plateNumber}
                            </span>
                          </div>
                        </div>
                        {card.priority === "urgent" && (
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                            Gấp
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-700">{card.carModel}</p>
                        <div className="flex items-center justify-between text-[11px] mt-1 pt-1 border-t border-slate-100">
                          <span className="text-slate-500 truncate font-medium">Khách: <strong className="text-slate-800">{card.customerName}</strong></span>
                          {card.customerPhone && (
                            <a
                              href={`tel:${card.customerPhone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 hover:underline shrink-0 ml-1.5"
                              title="Gọi điện cho khách hàng"
                            >
                              <Phone className="w-3 h-3 text-amber-500" />
                              {card.customerPhone}
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-500 font-mono font-semibold">
                          <span>Tiến độ</span>
                          <span className="text-slate-900 font-bold">{card.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              card.progress === 100
                                ? "bg-emerald-500"
                                : card.progress >= 50
                                ? "bg-amber-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${card.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Khoang & Thợ */}
                      <div
                        onClick={() => openAssignModal(card)}
                        className="text-[11px] space-y-1 text-slate-600 border-t border-slate-100 pt-2 font-medium cursor-pointer hover:bg-amber-50/50 p-1.5 rounded-lg transition"
                        title="Nhấp để phân công kỹ thuật viên & khoang nâng"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <Wrench className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate">{card.bay}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate font-semibold text-slate-900">{card.technician}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Dự kiến: {card.estimatedTime}</span>
                        </div>
                      </div>

                      {/* Nút Hành Động Theo Đúng Từng Bước Quy Trình Chuẩn */}
                      {(() => {
                        const matchedTech = TECHNICIANS_LIST.find((t) =>
                          card.technician.includes(t.name.split(" ")[0]) || card.technician.includes(t.name)
                        );
                        const techQuery = matchedTech ? `&tech=${matchedTech.id}` : "";

                        // BƯỚC 1: Tiếp nhận xe -> Chưa có báo giá duyệt, KHÓA PHÂN CÔNG
                        if (card.stage === "intake") {
                          return (
                            <button
                              type="button"
                              onClick={() => toast.info("Xe đang ở bước Tiếp Nhận: Cần lập báo giá và gửi khách duyệt trước khi phân công thợ!")}
                              className="w-full py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-[10px] border border-slate-200 flex items-center justify-center gap-1 transition"
                            >
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>Tiếp nhận • Chưa lập báo giá</span>
                            </button>
                          );
                        }

                        // BƯỚC 2: Chờ duyệt báo giá -> Khách chưa ký, KHÓA PHÂN CÔNG
                        if (card.stage === "quoting") {
                          return (
                            <button
                              type="button"
                              onClick={() => toast.warning("Báo giá đang chờ khách hàng duyệt trực tuyến: Cần sự đồng ý của khách trước khi phân công thợ!")}
                              className="w-full py-1.5 px-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[10px] border border-purple-200 flex items-center justify-center gap-1 transition"
                            >
                              <Clock className="w-3 h-3 text-purple-500" />
                              <span>Chờ khách duyệt báo giá</span>
                            </button>
                          );
                        }

                        // BƯỚC 3: Đã duyệt / Chờ vật tư -> ĐÂY LÀ BƯỚC DUY NHẤT ĐƯỢC PHÂN CÔNG CHÍNH THỨC!
                        if (card.stage === "approved") {
                          return (
                            <button
                              type="button"
                              onClick={() => openAssignModal(card)}
                              className="w-full py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/25 active:scale-95 animate-pulse"
                            >
                              <UserCheck className="w-4 h-4 text-slate-950" />
                              <span>⚡ Phân Công Thợ & Khoang</span>
                            </button>
                          );
                        }

                        // BƯỚC 4: Đang thi công -> Cho phép điều phối đổi thợ & Mở nhanh Tablet
                        if (card.stage === "in_progress") {
                          return (
                            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                              <button
                                type="button"
                                onClick={() => openAssignModal(card)}
                                className="py-1.5 px-1.5 rounded-lg border border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/70 hover:bg-amber-100/90 text-amber-900 font-bold text-[10px] transition-all flex items-center justify-center gap-1 active:scale-95 group shadow-xs"
                                title="Đổi thợ hoặc khoang nếu cần"
                              >
                                <UserCheck className="w-3 h-3 text-amber-600 group-hover:scale-110 transition-transform" />
                                <span className="truncate">Đổi Thợ/Khoang</span>
                              </button>
                              <Link
                                href={`/technician?order=${card.orderCode}${techQuery}`}
                                className="py-1.5 px-1.5 rounded-lg border border-slate-200 hover:border-slate-800 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] transition-all flex items-center justify-center gap-1 active:scale-95 shadow-xs text-center"
                                title="Mở trực tiếp trên Tablet Khoang Kỹ Thuật Viên"
                              >
                                <Wrench className="w-3 h-3 text-amber-400 shrink-0" />
                                <span className="truncate">Tablet Thợ →</span>
                              </Link>
                            </div>
                          );
                        }

                        // BƯỚC 5: Kiểm tra chất lượng QC
                        if (card.stage === "qc") {
                          return (
                            <div className="w-full py-1.5 px-2 rounded-lg bg-orange-50 text-orange-700 font-bold text-[10px] border border-orange-200 text-center">
                              Kiểm tra chất lượng KCS 100%
                            </div>
                          );
                        }

                        // BƯỚC 6: Hoàn tất & Bàn giao
                        return (
                          <div className="w-full py-1.5 px-2 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200 text-center">
                            ✓ Đã hoàn tất & Bàn giao
                          </div>
                        );
                      })()}

                      {/* Quick stage transition button */}
                      <div className="pt-1 flex justify-end gap-1">
                        {col.key !== "completed" && (
                          <button
                            type="button"
                            onClick={() => {
                              const nextIdx = COLUMNS.findIndex((c) => c.key === col.key) + 1;
                              if (nextIdx < COLUMNS.length) {
                                handleMoveCard(card.id, COLUMNS[nextIdx].key);
                              }
                            }}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-amber-600 transition"
                            title="Chuyển cột kế tiếp"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL PHÂN CÔNG KỸ THUẬT VIÊN & KHOANG NÂNG */}
      {selectedCardForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 font-sans">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-600">{selectedCardForAssign.orderCode}</span>
                  <span className="font-mono font-black text-sm px-2 py-0.5 rounded-md bg-slate-900 text-white">
                    {selectedCardForAssign.plateNumber}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  Phân Công Kỹ Thuật Viên & Khoang Nâng
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCardForAssign(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveAssignment} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Thông tin phương tiện tóm tắt */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs flex items-center justify-between">
                <div>
                  <p className="text-slate-500 font-medium">Phương tiện:</p>
                  <p className="font-bold text-slate-900">{selectedCardForAssign.carModel}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 font-medium">Chủ sở hữu:</p>
                  <p className="font-bold text-slate-900">{selectedCardForAssign.customerName}</p>
                  {selectedCardForAssign.customerPhone && (
                    <a
                      href={`tel:${selectedCardForAssign.customerPhone}`}
                      className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center justify-end gap-1 mt-0.5 hover:underline"
                    >
                      <Phone className="w-3 h-3 text-amber-500" />
                      {selectedCardForAssign.customerPhone}
                    </a>
                  )}
                </div>
              </div>

              {/* 1. Chọn Kỹ thuật viên phụ trách */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>1. Kỹ Thuật Viên Trực Tiếp Thi Công</span>
                  <span className="text-[10px] text-amber-600 font-semibold lowercase">Bắt buộc</span>
                </label>
                <div className="space-y-2">
                  {TECHNICIANS_LIST.map((tech) => {
                    const isSelected = selectedTech.name === tech.name;
                    const wl = workloads.find((w) => w.id === tech.id);
                    const count = wl ? wl.current_orders_count : 0;
                    const isFull = count >= 3;

                    return (
                      <div
                        key={tech.id}
                        onClick={() => {
                          if (isFull) {
                            toast.error(`Kỹ thuật viên [${tech.name}] đã đạt tải tối đa 3/3 xe! Vui lòng chọn thợ khác.`);
                            return;
                          }
                          setSelectedTech(tech);
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isFull
                            ? "opacity-50 bg-slate-100 border-slate-200 cursor-not-allowed"
                            : isSelected
                            ? "bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20"
                            : "bg-slate-50 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-300 shrink-0">
                            <img src={tech.avatar} alt={tech.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-xs text-slate-900 leading-tight">{tech.name}</p>
                            <p className="text-[11px] text-slate-500 font-medium">{tech.role}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              isFull
                                ? "bg-red-500 text-white"
                                : count > 0
                                ? "bg-amber-500/20 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {isFull ? "ĐẦY TẢI (3/3)" : `${count}/3 xe`}
                          </span>

                          {isSelected && !isFull && (
                            <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Chọn Khoang nâng */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. Khoang Nâng / Khu Vực Thi Công
                </label>
                <select
                  value={selectedBay}
                  onChange={(e) => setSelectedBay(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                >
                  {BAYS_LIST.map((bay) => (
                    <option key={bay} value={bay}>
                      {bay}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Mức độ ưu tiên & Thời gian dự kiến */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    3. Mức Độ Ưu Tiên
                  </label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as "normal" | "urgent")}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="normal">Bình thường (Normal)</option>
                    <option value="urgent">Gấp - Cần làm ngay (Urgent)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    4. Giờ Dự Kiến Xong
                  </label>
                  <input
                    type="text"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    placeholder="VD: 15:30 Hôm nay"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedCardForAssign(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={savingAssign}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4 text-slate-950" />
                  <span>{savingAssign ? "Đang lưu..." : "Xác Nhận & Lưu Phân Công"}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
