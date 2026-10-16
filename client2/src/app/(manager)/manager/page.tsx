"use client";
// Phụ trách phần mới: Khởi (phân công, chỉ số), Lợi (đối soát), Kiệt (hiển thị tiến độ).
import { useCallback, useEffect, useState } from "react";
import { api, orderStatusLabel, paymentStatusLabel, TechnicianReport, WorkOrder } from "@/lib/api";
// Khởi: input ngày dùng giờ địa phương để số liệu không lệch ngày tại Việt Nam.
function inputDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
// Khởi: trang /manager ghép danh sách lệnh với báo cáo theo ngày để quản lý điều phối.
export default function ManagerPage() {
  // Khởi: orders là lệnh từ MySQL; stats là số lệnh giao/xong theo từng thợ.
  const [orders, setOrders] = useState<WorkOrder[]>([]),
    [stats, setStats] = useState<TechnicianReport[]>([]),
    [error, setError] = useState("");
  const [from, setFrom] = useState(() => {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      return inputDate(date);
    }),
    [to, setTo] = useState(() => inputDate(new Date()));
  // Khởi: tải lại cả danh sách lệnh và báo cáo; from/to đổi thì báo cáo được tính lại.
  const load = useCallback(() => {
    api
      .getOrders()
      .then(setOrders)
      .catch((e) => setError(e.message));
    api
      .report(from, to)
      .then(setStats)
      .catch((e) => setError(e.message));
  }, [from, to]);
  // Khởi: gọi load lúc mở trang và sau khi khoảng ngày thay đổi.
  useEffect(() => {
    load();
  }, [load]);
  // Khởi: khi chọn thợ trong dòng lệnh RECEIVED, gửi mã lệnh + ID thợ đến AssignmentServlet.
  // Thành công thì tải lại để thấy người được giao và thời điểm phân công từ MySQL.
  async function assign(code: string, id: number) {
    if (!id) return;
    setError("");
    try {
      await api.assignOrder(code, id);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  // Lợi: sau khi ngân hàng đã nhận tiền, quản lý xác nhận để PaymentServlet đặt hóa đơn PAID.
  async function verify(code: string) {
    setError("");
    try {
      await api.verifyPayment(code);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <section className="space-y-7">
      <h1 className="text-2xl font-bold">Tổng quan gara</h1>
      {error && (
        <p
          role="alert"
          className="text-red-600"
        >
          {error}
        </p>
      )}
      <div className="bg-white border rounded-xl p-5">
        <h2 className="font-bold mb-3">Hiệu suất kỹ thuật viên</h2>
        <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
          Từ{" "}
          <input
            type="date"
            className="border rounded p-1 max-w-full"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />{" "}
          đến{" "}
          <input
            type="date"
            className="border rounded p-1 max-w-full"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {stats.map((t) => (
            <div
              key={t.id}
              className="border rounded-lg p-3"
            >
              <b>{t.full_name}</b>
              <p className="text-sm text-slate-600">
                Được giao: {t.assigned_count} · Sửa xong: {t.finished_count} · Hoàn thành:{" "}
                {t.completion_rate}%
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="font-bold">Lệnh sửa chữa</h2>
        {orders.map((o) => (
          <article
            key={o.order_code}
            className="bg-white border rounded-xl p-5 flex flex-wrap justify-between gap-4"
          >
            <div>
              <b>
                {o.order_code} · {o.license_plate}
              </b>
              <p className="text-sm text-slate-600">
                {o.customer_name} · {orderStatusLabel[o.current_status]} ·{" "}
                {paymentStatusLabel[o.payment_status]}
              </p>
              <p className="text-sm">
                {Number(o.total_amount).toLocaleString("vi-VN")} ₫ ·{" "}
                {o.technician_name || "Chưa phân công"}
              </p>
              {o.current_status === "IN_PROGRESS" && (
                <p className="text-sm font-medium text-blue-700">
                  Tiến độ công việc: {o.progress_percent}%
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {o.current_status === "RECEIVED" && (
                <select
                  className="border rounded-lg p-2"
                  value={o.assigned_to || ""}
                  onChange={(e) => assign(o.order_code, Number(e.target.value))}
                >
                  <option value="">Chọn kỹ thuật viên</option>
                  {stats.map((t) => (
                    <option
                      key={t.id}
                      value={t.id}
                    >
                      {t.full_name}
                    </option>
                  ))}
                </select>
              )}
              {o.payment_status === "PENDING_VERIFICATION" && (
                <button
                  onClick={() => verify(o.order_code)}
                  className="bg-green-600 text-white rounded-lg px-4 py-2"
                >
                  Xác nhận đã nhận tiền
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
