#!/usr/bin/env python3
"""Khởi/Tân/Lợi/Kiệt: verify the idempotent classroom seed through the Servlet API."""
import http.cookiejar
import json
import os
import urllib.request

BASE = os.environ.get("GARA_API_BASE", "http://127.0.0.1:8089/api/v1")


def client():
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))


def call(opener, method, path, data=None):
    body = None if data is None else json.dumps(data).encode()
    request = urllib.request.Request(BASE + path, data=body, method=method,
                                     headers={"Content-Type": "application/json"})
    with opener.open(request, timeout=10) as response:
        assert response.status == 200, (method, path, response.status)
        return json.load(response)["data"]


manager, technician = client(), client()
manager_login = call(manager, "POST", "/auth/staff-login", {"phone_number": "0988888802", "password": "123456"})
call(technician, "POST", "/auth/staff-login", {"phone_number": "0988888803", "password": "123456"})
# Khởi/Lợi: bắt lỗi seed đọc sai mã UTF-8 và tên cũ còn lưu ở trình duyệt.
assert manager_login["user"]["full_name"] == "Quản lý gara", manager_login
assert call(manager, "GET", "/auth/me")["full_name"] == "Quản lý gara"
parts = call(manager, "GET", "/inventory")
assert len(parts) >= 14, f"Expected at least 14 seed parts, got {len(parts)}"
assert any(part["part_code"] == "FILTER-01" and part["part_name"] == "Lọc dầu" for part in parts), parts
services = call(manager, "GET", "/services")
assert len(services) >= 16, f"Expected at least 16 seed services, got {len(services)}"
assert next(service for service in services if service["service_code"] == "SVC-SPARK-01")["service_name"] == "Thay bugi"
assert next(service for service in services if service["service_code"] == "SVC-INSPECT")["default_part_id"] is None
orders = {order["order_code"]: order for order in call(manager, "GET", "/work-orders/my-orders")}
expected = {
    "DEMO-001": ("RECEIVED", "UNPAID", 280000),
    "DEMO-002": ("IN_PROGRESS", "UNPAID", 1000000),
    "DEMO-003": ("WAITING_PAYMENT", "UNPAID", 1500000),
    "DEMO-004": ("COMPLETED", "PAID", 280000),
    "DEMO-005": ("WAITING_PAYMENT", "PENDING_VERIFICATION", 1050000),
}
for code, (status, payment, total) in expected.items():
    order = orders.get(code)
    assert order, f"Missing {code}"
    # Khởi/Lợi: seed chạy lại phải giữ trạng thái đã được người dùng thao tác, không kéo lệnh về mốc ban đầu.
    status_rank = {"RECEIVED": 0, "IN_PROGRESS": 1, "WAITING_PAYMENT": 2, "COMPLETED": 3}
    payment_rank = {"UNPAID": 0, "PENDING_VERIFICATION": 1, "PAID": 2}
    assert status_rank[order["current_status"]] >= status_rank[status], order
    assert payment_rank[order["payment_status"]] >= payment_rank[payment], order
    assert int(order["total_amount"]) == total, order
    assert (order["current_status"] == "COMPLETED") == (order["payment_status"] == "PAID"), order
    detail = call(manager, "GET", "/work-orders/" + code)
    assert sum(int(item["total_price"]) for item in detail["items"]) == total, detail
    # Kiệt: lệnh đã sửa xong có checklist 100%; lệnh đang sửa có thể được cập nhật dở.
    if order["current_status"] in ("WAITING_PAYMENT", "COMPLETED"):
        assert order["progress_percent"] == 100, order
    else:
        assert 0 <= order["progress_percent"] <= 100, order
assert orders["DEMO-001"]["customer_name"] == "Nguyễn Minh Anh", orders["DEMO-001"]
report = call(manager, "GET", "/reports/technicians")
assert len(report) >= 2, report
assert any(row["full_name"] == "Kỹ thuật viên An" for row in report), report
tech_orders = call(technician, "GET", "/work-orders/my-orders")
assert any(order["order_code"] == "DEMO-002" for order in tech_orders)
print(json.dumps({"result": "PASS", "parts": len(parts), "services": len(services), "demo_orders": len(expected),
                  "technicians": len(report)}, ensure_ascii=False))
