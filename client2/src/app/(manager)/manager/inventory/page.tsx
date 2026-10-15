"use client";

// Phụ trách phần mới: Tân. Quản lý riêng phụ tùng và dịch vụ niêm yết cho lệnh nhiều công việc.
import { FormEvent, useEffect, useState } from "react";
import { api, Part, Service } from "@/lib/api";

const money = (value: number) => new Intl.NumberFormat("vi-VN").format(value) + " ₫";
const emptyPart = { part_code: "", part_name: "", unit: "Cái", price: "", stock_quantity: "" };
const emptyService = {
  service_code: "",
  service_name: "",
  labor_price: "",
  default_part_id: "",
  default_part_quantity: "1",
};

export default function InventoryPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [partForm, setPartForm] = useState(emptyPart);
  const [serviceForm, setServiceForm] = useState(emptyService);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function reload() {
    try {
      const [partRows, serviceRows] = await Promise.all([api.inventory(), api.services()]);
      setParts(partRows);
      setServices(serviceRows);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Không tải được danh mục");
    }
  }
  useEffect(() => {
    void reload();
  }, []);

  async function addPart(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await api.addPart({
        ...partForm,
        price: Number(partForm.price),
        stock_quantity: Number(partForm.stock_quantity),
      });
      setPartForm(emptyPart);
      await reload();
      setMessage("Đã thêm phụ tùng.");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Không thêm được phụ tùng");
    } finally {
      setBusy(false);
    }
  }
  // Tân: dịch vụ có thể chỉ có tiền công; nếu có vật tư, chọn mã kho và định mức dùng.
  async function addService(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await api.addService({
        service_code: serviceForm.service_code,
        service_name: serviceForm.service_name,
        labor_price: Number(serviceForm.labor_price),
        default_part_id: serviceForm.default_part_id ? Number(serviceForm.default_part_id) : null,
        default_part_quantity: Number(serviceForm.default_part_quantity),
      });
      setServiceForm(emptyService);
      await reload();
      setMessage("Đã thêm dịch vụ.");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Không thêm được dịch vụ");
    } finally {
      setBusy(false);
    }
  }
  async function editStock(part: Part) {
    const input = window.prompt(`Tồn kho mới của ${part.part_name}`, String(part.stock_quantity));
    if (input === null) return;
    const quantity = Number(input);
    if (input.trim() === "" || !Number.isInteger(quantity) || quantity < 0) {
      setMessage("Tồn kho phải là số nguyên không âm.");
      return;
    }
    try {
      await api.setStock(part.id, quantity);
      await reload();
      setMessage("Đã cập nhật tồn kho.");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Không cập nhật được tồn kho");
    }
  }
  async function editService(service: Service) {
    const name = window.prompt("Tên dịch vụ", service.service_name);
    if (name === null) return;
    const input = window.prompt("Giá công niêm yết (đồng)", String(service.labor_price));
    if (input === null) return;
    const price = Number(input);
    if (!name.trim() || input.trim() === "" || !Number.isFinite(price) || price < 0) {
      setMessage("Tên hoặc giá công không hợp lệ.");
      return;
    }
    try {
      await api.updateService(service.id, {
        service_name: name.trim(),
        labor_price: price,
        default_part_id: service.default_part_id,
        default_part_quantity: service.default_part_quantity,
      });
      await reload();
      setMessage("Đã cập nhật giá công.");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Không cập nhật được dịch vụ");
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6 text-slate-900">
      <header>
        <h1 className="text-3xl font-bold">Kho và dịch vụ</h1>
        <p className="mt-2 text-slate-600">
          Một xe có thể chọn nhiều dịch vụ. Mỗi dịch vụ có giá công riêng và có thể gắn phụ tùng từ
          kho.
        </p>
      </header>
      {message && (
        <p
          role="status"
          className="rounded-lg bg-blue-50 p-3 text-blue-900"
        >
          {message}
        </p>
      )}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Phụ tùng</h2>
        <form
          onSubmit={addPart}
          className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3"
        >
          {(
            [
              ["part_code", "Mã phụ tùng"],
              ["part_name", "Tên phụ tùng"],
              ["unit", "Đơn vị"],
              ["price", "Giá phụ tùng (đ)"],
              ["stock_quantity", "Số lượng tồn"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="space-y-1 text-sm font-medium"
            >
              <span>{label}</span>
              <input
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                type={["price", "stock_quantity"].includes(key) ? "number" : "text"}
                min={["price", "stock_quantity"].includes(key) ? 0 : undefined}
                step="1"
                value={partForm[key]}
                onChange={(event) => setPartForm({ ...partForm, [key]: event.target.value })}
              />
            </label>
          ))}
          <div className="flex items-end">
            <button
              disabled={busy}
              className="w-full rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-50"
            >
              Thêm phụ tùng
            </button>
          </div>
        </form>
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3">Phụ tùng</th>
                <th className="p-3">Giá</th>
                <th className="p-3">Tồn</th>
                <th className="p-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part) => (
                <tr
                  key={part.id}
                  className="border-t"
                >
                  <td className="p-3">
                    <strong>{part.part_name}</strong>
                    <br />
                    <span className="text-slate-500">
                      {part.part_code} · {part.unit}
                    </span>
                  </td>
                  <td className="p-3">{money(part.price)}</td>
                  <td className="p-3">{part.stock_quantity}</td>
                  <td className="p-3">
                    <button
                      onClick={() => void editStock(part)}
                      className="text-blue-700 underline"
                    >
                      Sửa tồn
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Dịch vụ và giá công niêm yết</h2>
        <form
          onSubmit={addService}
          className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3"
        >
          {(
            [
              ["service_code", "Mã dịch vụ"],
              ["service_name", "Tên công việc"],
              ["labor_price", "Giá công (đ)"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="space-y-1 text-sm font-medium"
            >
              <span>{label}</span>
              <input
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                type={key === "labor_price" ? "number" : "text"}
                min={key === "labor_price" ? 0 : undefined}
                step="1"
                value={serviceForm[key]}
                onChange={(event) => setServiceForm({ ...serviceForm, [key]: event.target.value })}
              />
            </label>
          ))}
          <label className="space-y-1 text-sm font-medium">
            <span>Phụ tùng mặc định (nếu có)</span>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              value={serviceForm.default_part_id}
              onChange={(event) =>
                setServiceForm({ ...serviceForm, default_part_id: event.target.value })
              }
            >
              <option value="">Không dùng phụ tùng</option>
              {parts.map((part) => (
                <option
                  key={part.id}
                  value={part.id}
                >
                  {part.part_name}
                </option>
              ))}
            </select>
          </label>
          {serviceForm.default_part_id && (
            <label className="space-y-1 text-sm font-medium">
              <span>Định mức phụ tùng</span>
              <input
                required
                type="number"
                min="1"
                max="1000"
                step="1"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                value={serviceForm.default_part_quantity}
                onChange={(event) =>
                  setServiceForm({ ...serviceForm, default_part_quantity: event.target.value })
                }
              />
            </label>
          )}
          <div className="flex items-end">
            <button
              disabled={busy}
              className="w-full rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-50"
            >
              Thêm dịch vụ
            </button>
          </div>
        </form>
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3">Dịch vụ</th>
                <th className="p-3">Giá công</th>
                <th className="p-3">Vật tư mặc định</th>
                <th className="p-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr
                  key={service.id}
                  className="border-t"
                >
                  <td className="p-3">
                    <strong>{service.service_name}</strong>
                    <br />
                    <span className="text-slate-500">{service.service_code}</span>
                  </td>
                  <td className="p-3">{money(service.labor_price)}</td>
                  <td className="p-3">
                    {service.part_name
                      ? `${service.part_name} × ${service.default_part_quantity}`
                      : "Không có"}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => void editService(service)}
                      className="text-blue-700 underline"
                    >
                      Sửa giá công
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
