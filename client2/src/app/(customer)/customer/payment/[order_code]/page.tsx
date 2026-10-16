"use client";
// Trang thanh toán của khách: xem hóa đơn, hiện VietQR và báo đã chuyển khoản.
// Frontend không xác nhận tiền đã đến; bước đối soát thuộc API quản lý trong PaymentServlet.
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { api, WorkOrder, orderStatusLabel, paymentStatusLabel } from "@/lib/api";
// Luồng: URL -> useParams -> GET WorkOrderServlet -> render; nút bấm -> POST PaymentServlet.
export default function PaymentPage() {
  // Thư mục [order_code] của Next.js nhận đoạn cuối URL: /customer/payment/DEMO-001.
  // useParams trả { order_code: "DEMO-001" }; code là mã lệnh gửi cho API, không phải ID khách.
  const params = useParams();
  const code = String(params.order_code || "");
  // order bắt đầu null vì chưa có phản hồi; setOrder khiến React vẽ lại phần tiền/trạng thái.
  // error hiện lỗi từ API, busy khóa nút để khách không gửi yêu cầu thanh toán lặp.
  const [order, setOrder] = useState<WorkOrder | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  // Khi trang mở hoặc code đổi, api.getOrder gửi GET /api/v1/work-orders/{code}.
  // WorkOrderServlet kiểm tra session khách + biển số, JOIN work_orders/invoices và trả các hạng mục.
  // Thành công -> setOrder; lỗi (401/404/503...) -> setError để hiện thông báo.
  useEffect(() => {
    api
      .getOrder(code)
      .then(setOrder)
      .catch((e) => setError(e.message));
  }, [code]);
  // Nút "Đã chuyển khoản" gọi POST /api/v1/payments/report với { order_code: code }.
  // PaymentServlet kiểm tra session CUSTOMER, xe thuộc khách và hóa đơn đang UNPAID;
  // nếu hợp lệ, backend đổi invoices.payment_status sang PENDING_VERIFICATION.
  // GET lại lệnh để giao diện nhận trạng thái mới; chỉ API /payments/verify của MANAGER mới đặt PAID.
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
  // total_amount lấy từ lệnh do backend trả về; code đưa vào nội dung VietQR để đối soát đúng lệnh.
  // Ảnh QR chỉ hỗ trợ chuyển khoản, không chứng minh ngân hàng đã nhận tiền.
  const amount = Number(order?.total_amount || 0);
  const qrData = `https://img.vietqr.io/image/MB-0797526990-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(code)}`;
  return (
    <section className="space-y-5 max-w-2xl">
      {/* Tiêu đề lấy code trên URL để khách biết mình đang xem đúng lệnh sửa xe nào. */}
      <h1 className="text-2xl font-bold">Thanh toán lệnh {code}</h1>
      {/* Chỉ hiện lỗi khi request GET lệnh hoặc POST báo thanh toán thất bại. */}
      {error && (
        <p
          role="alert"
          className="text-red-600"
        >
          {error}
        </p>
      )}
      {/* Chỉ render hóa đơn sau khi GET trả về; mỗi item là một dòng công hoặc phụ tùng. */}
      {order && (
        <div className="bg-white border rounded-xl p-6 space-y-3">
          {/* Biển số và trạng thái sửa chữa lấy từ work_orders + vehicles qua WorkOrderServlet. */}
          <p>
            {order.license_plate} · {orderStatusLabel[order.current_status]}
          </p>
          {/* map biến mảng items từ backend thành các dòng trên màn hình; key giúp React nhận ra từng dòng. */}
          <ul className="text-sm list-disc pl-5">
            {order.items?.map((i) => (
              <li key={i.id}>
                {i.item_name} × {i.quantity}: {Number(i.total_price).toLocaleString("vi-VN")} ₫
              </li>
            ))}
          </ul>
          {/* Tổng tiền là giá đã lưu trong lệnh/hóa đơn, không tính lại từ giá kho hiện tại. */}
          <p className="font-bold">Tổng: {amount.toLocaleString("vi-VN")} ₫</p>
          {/* payment_status đến từ invoices: UNPAID, PENDING_VERIFICATION hoặc PAID. */}
          <p>Trạng thái: {paymentStatusLabel[order.payment_status]}</p>
          {/* QR chỉ hiện khi đã sửa xong và hóa đơn chưa được quản lý xác nhận PAID. */}
          {order.current_status === "WAITING_PAYMENT" && order.payment_status !== "PAID" && (
            <div className="space-y-3">
              {/* VietQR dùng amount và code; ảnh không tự tạo giao dịch hay tự cập nhật database. */}
              <Image
                src={qrData}
                width={240}
                height={240}
                unoptimized
                alt="VietQR chuyển khoản"
              />
              {/* Nội dung chuyển khoản chứa mã lệnh để quản lý tìm đúng khoản tiền khi đối soát. */}
              <p className="text-sm">
                Chuyển khoản MB 0797526990, nội dung {code}. Gara sẽ đối soát trước khi xác nhận.
              </p>
              {/* Chỉ hiện nút khi UNPAID; onClick chạy report(), disabled ngăn bấm lặp
                  trong lúc chờ backend. Đã báo rồi thì ẩn nút và chờ quản lý đối soát. */}
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
