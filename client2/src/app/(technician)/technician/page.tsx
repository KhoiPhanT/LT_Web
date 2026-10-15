"use client";

// Phụ trách phần mới: Kiệt. Thợ cập nhật checklist từng công việc và hoàn thành lệnh được giao.
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, WorkOrder, getCurrentUser, orderStatusLabel } from "@/lib/api";

export default function TechnicianPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null);

  // Kiệt: lấy chi tiết của lệnh đang sửa để hiện checklist đã lưu trong MySQL.
  async function load() {
    try {
      const rows = await api.getOrders();
      const detailed = await Promise.all(
        rows.map((order) =>
          order.current_status === "IN_PROGRESS"
            ? api.getOrder(order.order_code)
            : Promise.resolve(order),
        ),
      );
      setOrders(detailed);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được lệnh");
    }
  }
  useEffect(() => {
    setUser(getCurrentUser());
    void load();
  }, []);

  async function change(code: string, finish: boolean) {
    setError("");
    setBusy(code);
    try {
      if (finish) await api.finishOrder(code);
      else await api.startOrder(code);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không cập nhật được lệnh");
    } finally {
      setBusy("");
    }
  }

  // Kiệt: nút bấm đi 0 → 50 → 100; trước khi kết thúc có thể đưa về 0 để làm lại.
  async function advance(code: string, itemId: number, current: number) {
    setError("");
    setBusy(`${code}-${itemId}`);
    const next = (current === 0 ? 50 : current === 50 ? 100 : 0) as 0 | 50 | 100;
    try {
      await api.updateTaskProgress(code, itemId, next);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không cập nhật được công việc");
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Lệnh sửa chữa</h1>
        <Link
          href="/technician/create-order"
          className="rounded-lg bg-amber-500 px-4 py-2 font-bold"
        >
          Tiếp nhận xe
        </Link>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-red-700"
        >
          {error}
        </p>
      )}
      {orders.map((order) => {
        const assigned = order.assigned_to === user?.id;
        const tasks = order.items?.filter((item) => item.item_type === "LABOR") || [];
        const canFinish = tasks.length > 0 && tasks.every((item) => item.progress_percent === 100);
        return (
          <article
            key={order.order_code}
            className="space-y-4 rounded-xl border bg-white p-5"
          >
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <h2 className="font-bold">
                  {order.order_code} · {order.license_plate}
                </h2>
                <p className="text-sm text-slate-600">
                  {order.customer_name} · {order.vehicle_model} ·{" "}
                  {orderStatusLabel[order.current_status]}
                </p>
                <p className="text-sm">{order.symptoms}</p>
                <p className="text-sm">Phụ trách: {order.technician_name || "Chưa phân công"}</p>
              </div>
              {assigned && order.current_status === "RECEIVED" && (
                <button
                  disabled={Boolean(busy)}
                  onClick={() => void change(order.order_code, false)}
                  className="h-fit rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                >
                  Bắt đầu
                </button>
              )}
            </div>
            {assigned && order.current_status === "IN_PROGRESS" && (
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">Checklist công việc</h3>
                  <span className="text-sm font-semibold">
                    {order.progress_percent}% hoàn thành
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label={`Tiến độ lệnh ${order.order_code}`}
                  aria-valuenow={order.progress_percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-2 overflow-hidden rounded-full bg-slate-200"
                >
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${order.progress_percent}%` }}
                  />
                </div>
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{task.item_name}</p>
                      <p className="text-sm text-slate-600">
                        {task.progress_percent === 100
                          ? "Đã hoàn thành"
                          : task.progress_percent === 50
                            ? "Đang thi công"
                            : "Chưa bắt đầu"}{" "}
                        · {task.progress_percent ?? 0}%
                      </p>
                    </div>
                    <button
                      disabled={Boolean(busy)}
                      onClick={() =>
                        task.id &&
                        void advance(order.order_code, task.id, task.progress_percent ?? 0)
                      }
                      className="rounded-lg border border-blue-600 px-3 py-2 text-sm font-medium text-blue-700 disabled:opacity-50"
                    >
                      {task.progress_percent === 100
                        ? "Làm lại"
                        : task.progress_percent === 50
                          ? "Đánh dấu xong"
                          : "Bắt đầu việc"}
                    </button>
                  </div>
                ))}
                <button
                  disabled={!canFinish || Boolean(busy)}
                  onClick={() => void change(order.order_code, true)}
                  className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Hoàn thành sửa chữa
                </button>
                {!canFinish && (
                  <p className="text-sm text-slate-500">
                    Hoàn thành 100% từng công việc để kết thúc sửa chữa và trừ kho.
                  </p>
                )}
              </div>
            )}
            {!assigned && order.current_status === "IN_PROGRESS" && (
              <p className="text-sm text-slate-500">
                Chỉ kỹ thuật viên được phân công mới cập nhật được tiến độ.
              </p>
            )}
          </article>
        );
      })}
    </section>
  );
}
