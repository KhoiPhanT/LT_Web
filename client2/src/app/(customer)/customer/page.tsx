"use client";
// Phụ trách phần mới: Lợi (hồ sơ khách), Kiệt (hiển thị tiến độ công việc).
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, WorkOrder, orderStatusLabel, paymentStatusLabel } from "@/lib/api";
// Lợi: trang /customer chỉ hiển thị các lệnh mà session OTP được quyền xem.
export default function CustomerOrders() {
  const [orders, setOrders] = useState<WorkOrder[]>([]),
    [error, setError] = useState("");
  // Lợi: khi mở trang, gọi WorkOrderServlet; backend lọc theo khách và biển số trong session.
  useEffect(() => {
    api
      .getOrders()
      .then(setOrders)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">Lệnh sửa chữa của tôi</h1>
      {error && (
        <p
          role="alert"
          className="text-red-600"
        >
          {error}
        </p>
      )}
      {orders.length === 0 && !error && <p>Chưa có lệnh cho xe đã xác minh.</p>}
      {orders.map((o) => (
        <article
          key={o.order_code}
          className="bg-white border rounded-xl p-5 flex flex-wrap justify-between gap-4"
        >
          <div>
            <h2 className="font-bold">
              {o.order_code} · {o.license_plate}
            </h2>
            <p className="text-sm text-slate-600">
              {o.vehicle_model} · {orderStatusLabel[o.current_status]}
            </p>
            <p className="text-sm">
              {Number(o.total_amount).toLocaleString("vi-VN")} ₫ ·{" "}
              {paymentStatusLabel[o.payment_status]}
            </p>
            {o.current_status === "IN_PROGRESS" && (
              <p className="text-sm font-medium text-blue-700">
                Tiến độ sửa chữa: {o.progress_percent}%
              </p>
            )}
          </div>
          <Link
            className="text-amber-700 underline"
            href={`/customer/payment/${o.order_code}`}
          >
            {/* Lợi: đưa mã lệnh vào URL để trang thanh toán biết phải tải đơn nào. */}
            Chi tiết & thanh toán
          </Link>
        </article>
      ))}
    </section>
  );
}
