"use client";

// Khởi: một xe có thể có nhiều dịch vụ trong cùng lệnh. Tân: danh mục giá công và vật tư.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Service, ServiceSelection } from "@/lib/api";

const money = (value: number) => value.toLocaleString("vi-VN") + " ₫";

export default function CreateOrder() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<Service[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    license_plate: "",
    customer_phone: "",
    customer_name: "",
    customer_email: "",
    vehicle_model: "",
    symptoms: "",
  });
  const [services, setServices] = useState<ServiceSelection[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    api
      .services()
      .then(setCatalog)
      .catch((cause) => setError(cause.message));
  }, []);
  const selected = catalog.find((service) => service.id === Number(serviceId));
  // Khởi: đây là giá xem trước; Servlet luôn tính lại từ dữ liệu MySQL khi tạo lệnh.
  const estimate = services.reduce((sum, entry) => {
    const service = catalog.find((candidate) => candidate.id === entry.service_id);
    if (!service) return sum;
    return (
      sum +
      entry.quantity *
        (Number(service.labor_price) +
          Number(service.part_price || 0) * service.default_part_quantity)
    );
  }, 0);

  function addService() {
    const count = Number(quantity);
    if (!selected || !Number.isInteger(count) || count <= 0 || count > 1000) {
      setError("Chọn dịch vụ và số lần thực hiện hợp lệ.");
      return;
    }
    const previous = services.find((entry) => entry.service_id === selected.id)?.quantity || 0;
    if (previous + count > 1000 || selected.default_part_quantity * (previous + count) > 1000) {
      setError("Số lượng vượt giới hạn một lệnh.");
      return;
    }
    setServices((rows) =>
      rows.some((entry) => entry.service_id === selected.id)
        ? rows.map((entry) =>
            entry.service_id === selected.id
              ? { ...entry, quantity: entry.quantity + count }
              : entry,
          )
        : [...rows, { service_id: selected.id, quantity: count }],
    );
    setServiceId("");
    setQuantity("1");
    setError("");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (services.length === 0) {
      setError("Chọn ít nhất một dịch vụ.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const order = await api.createOrder({ ...form, services });
      router.push(`/technician?created=${order.order_code}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tạo được lệnh");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="max-w-4xl space-y-6"
    >
      <h1 className="text-2xl font-bold">Tiếp nhận xe và lập lệnh</h1>
      {error && (
        <p
          role="alert"
          className="text-red-600"
        >
          {error}
        </p>
      )}
      <div className="grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-2">
        {(
          [
            ["license_plate", "Biển số"],
            ["vehicle_model", "Dòng xe"],
            ["customer_name", "Tên khách"],
            ["customer_phone", "Số điện thoại"],
            ["customer_email", "Email nhận OTP"],
          ] as const
        ).map(([key, label]) => (
          <label
            key={key}
            className="text-sm"
          >
            {label}
            <input
              required
              type={key === "customer_email" ? "email" : key === "customer_phone" ? "tel" : "text"}
              className="mt-1 w-full rounded-lg border p-2"
              value={form[key]}
              onChange={(event) => setForm({ ...form, [key]: event.target.value })}
            />
          </label>
        ))}
        <label className="text-sm sm:col-span-2">
          Mô tả tình trạng xe
          <textarea
            className="mt-1 w-full rounded-lg border p-2"
            value={form.symptoms}
            onChange={(event) => setForm({ ...form, symptoms: event.target.value })}
          />
        </label>
      </div>
      <div className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="font-bold">Các dịch vụ cho xe này</h2>
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Chọn dịch vụ"
            className="min-w-0 flex-1 rounded-lg border p-2"
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
          >
            <option value="">Chọn dịch vụ</option>
            {catalog.map((service) => (
              <option
                key={service.id}
                value={service.id}
              >
                {service.service_name} · công {money(Number(service.labor_price))}
              </option>
            ))}
          </select>
          <input
            aria-label="Số lần thực hiện"
            type="number"
            min="1"
            max="1000"
            step="1"
            className="w-20 rounded-lg border p-2"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
          <button
            type="button"
            onClick={addService}
            className="rounded-lg border px-4"
          >
            Thêm
          </button>
        </div>
        {selected && (
          <p className="text-sm text-slate-600">
            {selected.part_name
              ? `Vật tư: ${selected.part_name} × ${selected.default_part_quantity} · ${money(Number(selected.part_price))} mỗi đơn vị · tồn ${selected.stock_quantity}`
              : "Dịch vụ chỉ có tiền công, không dùng vật tư."}
          </p>
        )}
        <ul className="space-y-2 text-sm">
          {services.map((entry) => {
            const service = catalog.find((candidate) => candidate.id === entry.service_id);
            if (!service) return null;
            const subtotal =
              entry.quantity *
              (Number(service.labor_price) +
                Number(service.part_price || 0) * service.default_part_quantity);
            return (
              <li
                key={entry.service_id}
                className="flex flex-wrap justify-between gap-2 border-b py-2"
              >
                <span>
                  {service.service_name} × {entry.quantity}
                  <small className="block text-slate-500">
                    {service.part_name
                      ? `${service.part_name} × ${service.default_part_quantity * entry.quantity}`
                      : "Không dùng vật tư"}{" "}
                    · công {money(Number(service.labor_price) * entry.quantity)}
                  </small>
                </span>
                <span>
                  {money(subtotal)}
                  <button
                    type="button"
                    onClick={() =>
                      setServices((rows) =>
                        rows.filter((row) => row.service_id !== entry.service_id),
                      )
                    }
                    className="ml-4 text-red-600"
                  >
                    Xóa
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
        <p className="font-bold">Tạm tính: {money(estimate)}</p>
        <p className="text-xs text-slate-500">
          Giá chính thức lấy từ MySQL khi lập lệnh; hóa đơn cũ giữ nguyên giá lúc lập.
        </p>
      </div>
      <button
        disabled={busy}
        className="rounded-lg bg-amber-500 px-6 py-3 font-bold disabled:opacity-50"
      >
        {busy ? "Đang lưu..." : "Tạo lệnh sửa chữa"}
      </button>
    </form>
  );
}
