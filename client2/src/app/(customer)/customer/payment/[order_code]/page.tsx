"use client";
// Phụ trách phần mới: Lợi. VietQR chỉ là hướng dẫn chuyển khoản; khách báo, quản lý đối soát.
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { api, WorkOrder, orderStatusLabel, paymentStatusLabel } from "@/lib/api";
// Lợi: trang /customer/payment/[order_code] dùng mã lệnh trên URL để xem và báo thanh toán.
export default function PaymentPage() {
  // Lợi: /customer/payment/DEMO-001 -> params.order_code là "DEMO-001".
  // Mã này là mã lệnh sửa chữa, không phải mã khách; backend vẫn kiểm tra session khi đọc.
  const params = useParams();
  const code = String(params.order_code || "");
  // Lợi: order là dữ liệu trả từ MySQL; ban đầu null vì request chưa hoàn thành.
  const [order, setOrder] = useState<WorkOrder | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  // Lợi: khi mở trang hoặc code trong URL đổi, lấy chi tiết đúng lệnh để hiển thị tiền và trạng thái.
  useEffect(() => {
    api
      .getOrder(code)
      .then(setOrder)
      .catch((e) => setError(e.message));
  }, [code]);
  // Lợi: nút "Đã chuyển khoản" chỉ báo cho backend chuyển sang chờ đối soát.
  // Gọi GET lần nữa để giao diện nhận trạng thái mới; chỉ quản lý mới có quyền xác nhận PAID.
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
  // Lợi: số tiền và nội dung chuyển khoản lấy từ lệnh vừa tải, không lấy từ ô nhập của khách.
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
