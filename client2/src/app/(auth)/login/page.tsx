"use client";
// Phụ trách phần mới: Lợi. OTP email gắn biển số và số điện thoại đã lưu trong CSDL.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
// Lợi: trang /login cho khách xác minh biển số + điện thoại trước khi xem lệnh của mình.
export default function CustomerLogin() {
  const router = useRouter();
  // Lợi: các giá trị người dùng đang nhập; sent quyết định form đang ở bước gửi hay nhập OTP.
  const [plate, setPlate] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [hint, setHint] = useState("");
  const [error, setError] = useState("");
  // Lợi: busy khóa nút trong lúc request đang chạy để tránh gửi trùng.
  const [busy, setBusy] = useState(false);
  // Lợi: cùng một form có hai lần submit: xin mã OTP, rồi xác thực mã vừa nhập.
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (!sent) {
        // AuthServlet tìm khách theo phone + plate và gửi mã tới email đã lưu.
        const data = await api.requestOtp(phone, plate);
        setSent(true);
        setHint(
          `Mã đã gửi đến ${data.masked_email}${data.otp_preview ? ` • Mã demo: ${data.otp_preview}` : ""}`,
        );
      } else {
        // OTP đúng: Servlet tạo HttpSession; frontend chuyển sang danh sách lệnh của khách.
        await api.verifyOtp(phone, plate, otp);
        router.push("/customer");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      onSubmit={submit}
      className="w-full max-w-md bg-white rounded-2xl border p-8 shadow-sm space-y-4"
    >
      <h1 className="text-2xl font-bold">Tra cứu lệnh của khách</h1>
      <p className="text-sm text-slate-500">Nhận OTP qua email đã đăng ký khi tiếp nhận xe.</p>
      <label className="block text-sm">
        Biển số
        <input
          className="mt-1 w-full border rounded-lg p-3"
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
          disabled={sent}
          required
        />
      </label>
      <label className="block text-sm">
        Số điện thoại
        <input
          className="mt-1 w-full border rounded-lg p-3"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={sent}
          required
        />
      </label>
      {sent && (
        <label className="block text-sm">
          Mã OTP 6 chữ số
          <input
            className="mt-1 w-full border rounded-lg p-3"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputMode="numeric"
            maxLength={6}
            required
          />
        </label>
      )}
      {hint && <p className="text-sm text-green-700">{hint}</p>}
      {error && (
        <p
          role="alert"
          className="text-red-600 text-sm"
        >
          {error}
        </p>
      )}
      <button
        disabled={busy}
        className="w-full bg-amber-500 rounded-lg p-3 font-bold disabled:opacity-50"
      >
        {busy ? "Đang xử lý..." : sent ? "Xác nhận OTP" : "Gửi OTP"}
      </button>
      {sent && (
        <button
          type="button"
          onClick={() => {
            // Lợi: quay lại bước đầu để đổi biển số/điện thoại; OTP đang nhập bị xóa.
            setSent(false);
            setOtp("");
          }}
          className="text-sm underline"
        >
          Nhập lại thông tin
        </button>
      )}
    </form>
  );
}
