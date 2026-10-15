"use client";
// Phụ trách phần mới: Lợi. VietQR chỉ là hướng dẫn chuyển khoản; khách báo, quản lý đối soát.
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { api, WorkOrder, orderStatusLabel, paymentStatusLabel } from "@/lib/api";
export default function PaymentPage() {
  const params = useParams();
  const code = String(params.order_code || "");
  const [order, setOrder] = useState<WorkOrder | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    api
      .getOrder(code)
      .then(setOrder)
      .catch((e) => setError(e.message));
  }, [code]);
  async function report() {
    setBusy(true);
    setError("");
    try {
      await api.reportPayment(code);
      setOrder(await api.getOrder(code));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const amount = Number(order?.total_amount || 0);
  const qrData = `https://img.vietqr.io/image/MB-0797526990-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(code)}`;
  return (
    <section className="space-y-5 max-w-2xl">
      <h1 className="text-2xl font-bold">Thanh toán lệnh {code}</h1>
      {error && (
        <p
          role="alert"
          className="text-red-600"
        >
          {error}
        </p>
      )}
      {order && (
        <div className="bg-white border rounded-xl p-6 space-y-3">
          <p>
            {order.license_plate} · {orderStatusLabel[order.current_status]}
          </p>
          <ul className="text-sm list-disc pl-5">
            {order.items?.map((i) => (
              <li key={i.id}>
                {i.item_name} × {i.quantity}: {Number(i.total_price).toLocaleString("vi-VN")} ₫
              </li>
            ))}
          </ul>
          <p className="font-bold">Tổng: {amount.toLocaleString("vi-VN")} ₫</p>
          <p>Trạng thái: {paymentStatusLabel[order.payment_status]}</p>
          {order.current_status === "WAITING_PAYMENT" && order.payment_status !== "PAID" && (
            <div className="space-y-3">
              <Image
                src={qrData}
                width={240}
                height={240}
                unoptimized
                alt="VietQR chuyển khoản"
              />
              <p className="text-sm">
                Chuyển khoản MB 0797526990, nội dung {code}. Gara sẽ đối soát trước khi xác nhận.
              </p>
              {order.payment_status === "UNPAID" && (
                <button
                  disabled={busy}
                  onClick={report}
                  className="bg-amber-500 rounded-lg px-5 py-3 font-bold disabled:opacity-50"
                >
                  Đã chuyển khoản
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
