"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Network,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Car,
  Tag,
  Layers,
  Wrench,
  Sparkles,
  Phone,
} from "lucide-react";
import { formatVND } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { GraphRagAiModal } from "@/components/technician/graph-rag-ai-modal";

interface EstimateItem {
  id: string;
  name: string;
  code: string;
  type: "part" | "labor";
  quantity: number;
  unitPrice: number;
  isOemSubstitute?: boolean;
}

interface CompatiblePart {
  partCode: string;
  partName: string;
  brand: string;
  platform: string;
  sharedModels: string[];
  inStock: number;
  price: number;
  confidence: number;
}

export default function EditOrderEstimatePage() {
  const params = useParams();
  const router = useRouter();
  const orderCode = (params.order_code as string) || "WO-20261001-0089";
  const [orderData, setOrderData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // State báo giá hiện tại của WO-20261001-0089 (Khớp giá 2,808,000 VND từ backend/báo cáo)
  const [items, setItems] = useState<EstimateItem[]>([
    {
      id: "item-1",
      name: "Dầu động cơ tổng hợp toàn phần Castrol EDGE 0W-20 (4L)",
      code: "OIL-0W20-CAS",
      type: "part",
      quantity: 1,
      unitPrice: 1200000,
    },
    {
      id: "item-2",
      name: "Lọc nhớt chính hãng Toyota Camry TNGA",
      code: "04152-YZZA6",
      type: "part",
      quantity: 1,
      unitPrice: 250000,
    },
    {
      id: "item-3",
      name: "Má phanh trước Ceramic Akebono Ultra-Premium",
      code: "ACT-1222-AKE",
      type: "part",
      quantity: 1,
      unitPrice: 950000,
    },
    {
      id: "item-4",
      name: "Công thay dầu động cơ, lọc nhớt & dưỡng má phanh",
      code: "LAB-SVC-OIL-BRK",
      type: "labor",
      quantity: 1,
      unitPrice: 200000,
    },
  ]);

  // Nạp dữ liệu thật từ MongoDB & Khôi phục cache F5
  React.useEffect(() => {
    // 1. Phục hồi ngay từ localStorage nếu có
    const cachedItems = localStorage.getItem("advisor_estimate_" + orderCode);
    if (cachedItems) {
      try {
        const parsed = JSON.parse(cachedItems);
        if (Array.isArray(parsed) && parsed.length > 0) setItems(parsed);
      } catch (e) {}
    }

    // 2. Đồng bộ từ MongoDB
    async function loadData() {
      try {
        const res = await api.getWorkOrder(orderCode);
        if (res.success && res.data) {
          setOrderData(res.data);
          if (res.data.estimate?.items && res.data.estimate.items.length > 0) {
            const dbItems = res.data.estimate.items.map((it: any, idx: number) => ({
              id: `item-${idx}`,
              name: it.name,
              code: it.part_code || `PART-${idx}`,
              type: it.type === "LABOR" ? "labor" : "part",
              quantity: it.quantity || 1,
              unitPrice: it.unit_price || 0,
            }));
            setItems(dbItems);
            localStorage.setItem("advisor_estimate_" + orderCode, JSON.stringify(dbItems));
          }
        }
      } catch (err: any) {
        console.warn("Lỗi load work order:", err.message);
      }
    }
    loadData();
  }, [orderCode]);

  // Neo4j Cypher Tra cứu phụ tùng dùng chung
  const [cypherQuery, setCypherQuery] = useState(
    "MATCH (c:CarModel {name: 'Camry 2.5Q'})-[:USES_PLATFORM]->(p:Platform)-[:COMPATIBLE_WITH]->(part:Part) RETURN part, p.name"
  );
  const [isSearchingNeo4j, setIsSearchingNeo4j] = useState(false);
  const [compatibleParts, setCompatibleParts] = useState<CompatiblePart[]>([
    {
      partCode: "ACT-1222-AKE",
      partName: "Má phanh trước Ceramic Akebono (Dùng chung nền tảng TNGA-K)",
      brand: "Akebono Japan",
      platform: "TNGA-K",
      sharedModels: ["Camry 2.5Q (2020-2025)", "RAV4 2.5L", "Lexus ES250", "Highlander 2.5"],
      inStock: 14,
      price: 950000,
      confidence: 100,
    },
    {
      partCode: "04152-YZZA6",
      partName: "Lọc dầu động cơ Toyota/Lexus Cartridge Type",
      brand: "Toyota Genuine",
      platform: "Dynamic Force Engine Family",
      sharedModels: ["Camry A25A-FKS", "RAV4", "Avalon", "Lexus NX250"],
      inStock: 48,
      price: 250000,
      confidence: 100,
    },
    {
      partCode: "DEN-IK20TT",
      partName: "Bugi Iridium TT Denso High-Ignitability",
      brand: "Denso",
      platform: "Universal 14mm Hex",
      sharedModels: ["Camry", "Corolla Cross", "RAV4", "Lexus ES"],
      inStock: 32,
      price: 240000,
      confidence: 96,
    },
    {
      partCode: "BOS-CABIN-AP",
      partName: "Lọc gió điều hòa kháng khuẩn than hoạt tính Bosch Aeristo",
      brand: "Bosch Germany",
      platform: "TNGA Cabin Standard",
      sharedModels: ["Camry", "Corolla Altis", "RAV4", "Harrier"],
      inStock: 22,
      price: 320000,
      confidence: 98,
    },
  ]);

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const vat = Math.round(subtotal * 0.08); // 8% VAT
  const grandTotal = subtotal + vat;

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

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    toast.info("Đã xóa hạng mục khỏi báo giá");
  };

  const handleApplyNeo4jPart = (part: CompatiblePart) => {
    // Check if already in items
    if (items.some((i) => i.code === part.partCode)) {
      toast.warning(`Phụ tùng ${part.partCode} đã có trong báo giá!`);
      return;
    }

    const newItem: EstimateItem = {
      id: `item-${Date.now()}`,
      name: part.partName,
      code: part.partCode,
      type: "part",
      quantity: 1,
      unitPrice: part.price,
      isOemSubstitute: true,
    };

    setItems([...items, newItem]);
    toast.success(`Đã thêm phụ tùng [${part.partCode}] vào bảng báo giá!`);
  };

  // Áp dụng chẩn đoán AI vào bảng báo giá
  const handleApplyAiDiagnosis = (
    parts: any[],
    laborCost: number,
    explanation: string,
    suggestedAction: string
  ) => {
    const newItems: EstimateItem[] = [];

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
          isOemSubstitute: true,
        });
      }
    });

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

  const handleApplySinglePart = (part: any, laborCost: number) => {
    if (items.some((i) => i.code === part.part_code)) {
      toast.warning(`Phụ tùng ${part.part_code} đã có trong báo giá!`);
      return;
    }

    const newItem: EstimateItem = {
      id: `ai-part-${Date.now()}`,
      name: part.part_name,
      code: part.part_code,
      type: "part",
      quantity: 1,
      unitPrice: Number(part.unit_price) || 0,
      isOemSubstitute: true,
    };

    setItems((prev) => [...prev, newItem]);
    toast.success(`Đã thêm phụ tùng ${part.part_name} vào báo giá!`);
  };

  const handleSimulateNeo4jRun = () => {
    setIsSearchingNeo4j(true);
    setTimeout(() => {
      setIsSearchingNeo4j(false);
      toast.success("Đã đồng bộ phụ tùng tương thích theo khung gầm dòng xe!");
    }, 400);
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    localStorage.setItem("advisor_estimate_" + orderCode, JSON.stringify(items));
    try {
      await api.updateEstimate(
        orderCode,
        items.map((it) => ({
          name: it.name,
          part_code: it.code,
          type: it.type === "labor" ? "LABOR" : "PART",
          quantity: it.quantity,
          unit_price: it.unitPrice,
        }))
      );
      toast.success(`Đã lưu cập nhật bảng báo giá Lệnh #${orderCode} vào cơ sở dữ liệu!`);
      setTimeout(() => {
        router.push("/advisor/work-orders");
      }, 800);
    } catch (err: any) {
      toast.error(err.message || "Lỗi lưu bảng báo giá.");
    } finally {
      setSaving(false);
    }
  };

  const plateNumber = orderData?.license_plate || "51K-888.88";
  const carModel = orderData?.vehicle_model || "Toyota Camry 2.5Q";
  const customerName = orderData?.customer_name || "Minh Thảo";
  const customerPhone = orderData?.customer_phone || "0912345678";

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/advisor/work-orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-amber-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách Lệnh Sửa Chữa
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Chỉnh Sửa Báo Giá #{orderCode}</h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              {orderData?.current_status || "Chờ duyệt"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 flex items-center flex-wrap gap-1.5">
            <span>Xe: <strong>{carModel}</strong> (Biển số: <strong className="font-mono">{plateNumber}</strong>)</span>
            <span>•</span>
            <span>Chủ xe: <strong>{customerName}</strong></span>
            {customerPhone && (
              <>
                <span>•</span>
                <a
                  href={`tel:${customerPhone}`}
                  className="text-amber-600 hover:text-amber-700 font-bold inline-flex items-center gap-1 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {customerPhone}
                </a>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <GraphRagAiModal
            vehicleModel={carModel}
            initialSymptoms={orderData?.estimate?.notes || "Đạp phanh nghe tiếng rít kim loại ken két ở 2 bánh trước"}
            onApplyAll={handleApplyAiDiagnosis}
            onApplyPart={handleApplySinglePart}
            triggerLabel="⚡ AI Chẩn Đoán & Bổ Sung Báo Giá"
          />
          <button
            onClick={handleSaveOrder}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Đang lưu..." : "Lưu & Cập Nhật Báo Giá"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Bảng chi tiết báo giá (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  Danh Mục Chi Phí & Nhân Công
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Điều chỉnh số lượng, đơn giá và kiểm tra thuế VAT 8%
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {items.length} hạng mục
              </span>
            </div>

            <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {items.map((item) => (
                <div key={item.id} className="p-4 bg-white hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.type === "part"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {item.type === "part" ? "Phụ tùng" : "Tiền công"}
                      </span>
                      {item.isOemSubstitute && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-amber-600" /> Phụ tùng OEM
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">{item.name}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{item.code}</p>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    {/* Qty */}
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.id, -1)}
                        className="px-2.5 py-1 text-xs hover:bg-slate-100 font-bold text-slate-700"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-mono font-bold text-slate-900">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.id, 1)}
                        className="px-2.5 py-1 text-xs hover:bg-slate-100 font-bold text-slate-700"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right min-w-[110px]">
                      <p className="text-sm font-black font-mono text-amber-600">
                        {formatVND(item.unitPrice * item.quantity)}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {formatVND(item.unitPrice)}/đv
                      </p>
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa hạng mục"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total breakdown */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span className="font-medium">Tiền phụ tùng:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatVND(
                    items
                      .filter((i) => i.type === "part")
                      .reduce((s, i) => s + i.unitPrice * i.quantity, 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-medium">Tiền công thợ:</span>
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
                <span className="font-medium">Thuế VAT (8% theo NĐ 44/2023):</span>
                <span className="font-mono font-bold text-slate-900">{formatVND(vat)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2.5 flex justify-between items-baseline font-bold">
                <span className="text-base text-slate-900">Tổng giá trị báo giá:</span>
                <span className="text-2xl font-mono text-amber-600 font-black">
                  {formatVND(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tra cứu phụ tùng tương thích dòng xe (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Phụ Tùng Khuyến Nghị Cho Xe</h3>
                  <p className="text-xs text-slate-500">Tương thích khung gầm & đời xe chính hãng</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                Sẵn hàng tại kho
              </span>
            </div>

            {/* Thông tin tra cứu */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Tự động khớp phụ tùng phù hợp với thông số kỹ thuật của xe</span>
              </div>
              <button
                type="button"
                onClick={handleSimulateNeo4jRun}
                disabled={isSearchingNeo4j}
                className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shrink-0 active:scale-95 shadow-xs"
              >
                {isSearchingNeo4j ? "Đang quét..." : "Làm mới"}
              </button>
            </div>

            {/* Gợi ý tương thích cross-model */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Phụ tùng tương thích trên nền tảng ({compatibleParts.length} gợi ý)
              </p>

              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {compatibleParts.map((part) => (
                  <div
                    key={part.partCode}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition-all space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{part.partName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-amber-600 font-bold">
                            {part.partCode}
                          </span>
                          <span className="text-[11px] text-slate-500">• {part.brand}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-black text-amber-600 whitespace-nowrap">
                        {formatVND(part.price)}
                      </span>
                    </div>

                    {/* Shared vehicle badges */}
                    <div className="space-y-1">
                      <p className="text-[11px] text-slate-500 font-semibold">Xe tương thích chung:</p>
                      <div className="flex flex-wrap gap-1">
                        {part.sharedModels.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Tồn kho: {part.inStock} cái
                      </span>

                      <button
                        type="button"
                        onClick={() => handleApplyNeo4jPart(part)}
                        className="py-1 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all shadow-xs active:scale-95"
                      >
                        <Plus className="w-3 h-3" /> Thêm vào báo giá
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
