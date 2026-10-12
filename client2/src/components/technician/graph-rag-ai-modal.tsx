"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Bot, AlertTriangle, CheckCircle2, Wrench, X, RefreshCw, Layers, PlusCircle, CheckCheck } from "lucide-react";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { formatCurrencyVND } from "@/lib/utils";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";

export interface RecommendedPart {
  part_code: string;
  part_name: string;
  category: string;
  subsystem: string;
  shared_platform: string;
  unit_price: number;
  unit: string;
  stock_quantity: number;
  available_quantity: number;
  location_rack: string;
  is_in_stock: boolean;
  confidence_score: number;
}

export interface DiagnosisResponse {
  success: boolean;
  vehicle_model: string;
  symptoms_input: string;
  confidence_overall: string;
  explanation: string;
  recommended_parts: RecommendedPart[];
  estimated_labor_cost: number;
  suggested_action: string;
}

export interface GraphRagAiModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  vehicleModel?: string;
  initialSymptoms?: string;
  onApplyPart?: (part: RecommendedPart, laborCost: number) => void;
  onApplyAll?: (parts: RecommendedPart[], laborCost: number, explanation: string, suggestedAction: string) => void;
  triggerLabel?: string;
}

export function GraphRagAiModal({
  isOpen,
  onClose,
  vehicleModel = "Toyota Camry 2.5Q",
  initialSymptoms = "",
  onApplyPart,
  onApplyAll,
  triggerLabel = "⚡ AI Chẩn Đoán & Gợi Ý Báo Giá",
}: GraphRagAiModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [symptoms, setSymptoms] = useState(initialSymptoms);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResponse | null>(null);

  // Cập nhật symptoms khi initialSymptoms thay đổi từ form
  useEffect(() => {
    if (initialSymptoms) {
      setSymptoms(initialSymptoms);
    }
  }, [initialSymptoms]);

  const isControlled = typeof isOpen === "boolean";
  const showModal = isControlled ? isOpen : internalOpen;

  const handleClose = () => {
    if (onClose) onClose();
    if (!isControlled) setInternalOpen(false);
  };

  if (!showModal) {
    if (isControlled) return null;
    return (
      <button
        type="button"
        onClick={() => setInternalOpen(true)}
        className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-500/15 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-amber-900 font-extrabold text-xs transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
      >
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-600" />
        {triggerLabel}
      </button>
    );
  }

  const handleDiagnose = async () => {
    if (!symptoms.trim()) {
      toast.error("Vui lòng nhập mô tả triệu chứng hoặc yêu cầu kiểm tra của khách");
      return;
    }

    setLoading(true);
    try {
      const response = await fetchApi<{ success: boolean; data: DiagnosisResponse }>("/ai/diagnose", {
        method: "POST",
        body: JSON.stringify({
          vehicle_model: vehicleModel,
          symptoms: symptoms.trim(),
          max_recommendations: 5,
        }),
      });

      if (response.success && response.data) {
        setResult(response.data);
        toast.success("AI đã phân tích chẩn đoán và đề xuất phụ tùng phù hợp trong kho!");
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Lỗi khi phân tích chẩn đoán AI";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 shadow-2xl p-4 sm:p-6 transition-all font-sans text-slate-900">
        
        {/* Header Modal - Dành riêng cho Cố Vấn Dịch Vụ */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Trợ Lý AI Chẩn Đoán & Lập Báo Giá
                </h3>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Kho phụ tùng chính hãng
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tự động phân tích triệu chứng xe và bốc phụ tùng sẵn sàng trong kho
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Triệu chứng & Thông tin xe */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">
              Dòng xe tiếp nhận: <span className="text-amber-700 font-extrabold">{vehicleModel || "Chưa xác định (Quét kho tự động)"}</span>
            </span>
            <span className="text-slate-400 text-[11px]">Hỗ trợ tiếng Việt tự nhiên</span>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Nhập triệu chứng xe (Ví dụ: Đạp phanh kêu ken két, máy rung khi dừng đèn đỏ, bảo dưỡng 40.000km thay dầu nhớt...)"
              className="w-full p-3.5 text-sm rounded-2xl border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition resize-none font-sans font-medium"
            />
          </div>

          {/* Chip mẫu triệu chứng để thử nhanh */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[11px] font-bold text-slate-500">Gợi ý thử nhanh:</span>
            {[
              "Phanh kêu ken két khi đạp gấp",
              "Bảo dưỡng định kỳ 40.000km, thay nhớt & lọc",
              "Gầm xe kêu lục cục khi qua gờ giảm tốc",
              "Xe đề dai khó nổ, rung giật động cơ",
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setSymptoms(chip)}
                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-semibold transition active:scale-95 text-left"
              >
                + {chip}
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-1">
            <LiquidGlassButton
              size="md"
              onClick={handleDiagnose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  Đang phân tích kỹ thuật & kiểm tra kho...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  Phân Tích Kỹ Thuật AI & Bốc Phụ Tùng
                </>
              )}
            </LiquidGlassButton>
          </div>
        </div>

        {/* Kết quả phân tích */}
        {result && (
          <div className="mt-6 space-y-5 animate-in slide-in-from-bottom-3 duration-300">
            {/* Hộp giải thích AI & Đề xuất */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs leading-relaxed space-y-2">
              <div className="flex items-center justify-between font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-600" /> Báo cáo Chẩn đoán Kỹ thuật
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300 text-[11px] font-mono">
                  Độ tin cậy: {result.confidence_overall}
                </span>
              </div>
              <p className="text-slate-700 font-medium">{result.explanation}</p>
              
              <div className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  Đề xuất xử lý: <strong className="text-slate-950">{result.suggested_action}</strong>
                </div>
                <div className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-amber-300">
                  Ước tính tiền công: <span className="font-mono text-amber-700">{formatCurrencyVND(result.estimated_labor_cost)}</span>
                </div>
              </div>
            </div>

            {/* Thanh tác vụ: NẠP TẤT CẢ VÀO BÁO GIÁ */}
            {onApplyAll && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-emerald-950">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                    Lập Báo Giá Tự Động 1-Click
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    Tự động đưa {result.recommended_parts.length} phụ tùng và 1 mục tiền công thợ vào bảng báo giá
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onApplyAll(
                      result.recommended_parts,
                      result.estimated_labor_cost,
                      result.explanation,
                      result.suggested_action
                    );
                    handleClose();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  Áp Dụng Tất Cả Vào Báo Giá
                </button>
              </div>
            )}

            {/* Danh sách phụ tùng gợi ý */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Phụ tùng tương thích trong kho ({result.recommended_parts.length})
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">Bấm chọn từng món nếu chỉ muốn bổ sung lẻ</span>
              </div>

              <div className="space-y-2.5">
                {result.recommended_parts.map((part) => (
                  <div
                    key={part.part_code}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-amber-400 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold border border-slate-200">
                          {part.part_code}
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {part.part_name}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>Hệ thống: <strong className="text-slate-700">{part.subsystem}</strong></span>
                        <span>Kệ kho: <strong className="text-slate-700 font-mono">{part.location_rack}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-sm font-bold text-amber-700 font-mono">
                          {formatCurrencyVND(part.unit_price)}
                        </div>
                        <div className="text-[11px] flex items-center gap-1 justify-end font-medium">
                          {part.is_in_stock ? (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Khả dụng: {part.available_quantity} {part.unit}
                            </span>
                          ) : (
                            <span className="text-rose-600 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-500" /> Hết hàng (Cần đặt)
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (onApplyPart) {
                            onApplyPart(part, result.estimated_labor_cost);
                          }
                          handleClose();
                        }}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition active:scale-95 shadow-xs flex items-center gap-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Thêm Món Này
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
