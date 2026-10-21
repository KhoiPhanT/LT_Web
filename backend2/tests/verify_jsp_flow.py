#!/usr/bin/env python3
"""Luồng JSP đầy đủ, tạo dữ liệu JSPTEST trong DB demo riêng."""
import json
import re
import uuid
from urllib import parse
from web_client import Browser, Forms, login, BASE

manager, tech, other, customer, anonymous = [Browser() for _ in range(5)]
anonymous.call("/")
assert "Xe của bạn đang" in anonymous.html
assert "Tiếp nhận → Phân công" in anonymous.html, "Sai mã hóa tiếng Việt footer"
anonymous.call("/orders")
assert anonymous.url.endswith("/login/staff")
anonymous.call("/actions/auth/staff-login", {"phone_number": "0988888802", "password": "123456"}, 403)
manager.call("/login/staff")
manager.submit("/actions/auth/staff-login", {"phone_number": "0988888802", "password": "wrong"}, expected=401)
assert 'value="0988888802"' in manager.html and "Sai số điện thoại" in manager.html
login(manager, "0988888802")
login(tech, "0988888803")
login(other, "0988888804")
for path in ("/inventory", "/services", "/reports", "/orders?queue=all"):
    manager.call(path)
manager.call("/reports?from=2026-10-21&to=2026-10-20", expected=400)
tech.call("/inventory", expected=403)
manager.call("/orders/new", expected=403)

suffix = uuid.uuid4().hex[:7].upper()
manager.call("/inventory")
manager.submit("/actions/inventory", {"part_code": "JSPTEST-" + suffix, "part_name": "Vật tư thử JSP", "unit": "Cái", "price": "120000", "stock_quantity": "5"})
part = next(p for p in manager.api("/inventory") if p["part_code"] == "JSPTEST-" + suffix)
manager.submit(f"/actions/inventory/{part['id']}/stock", {"stock_quantity": "6"})
manager.call("/services")
manager.submit("/actions/services", {"service_code": "JSPTEST-" + suffix, "service_name": "Thay vật tư thử JSP", "labor_price": "50000", "default_part_id": str(part["id"]), "default_part_quantity": "1"})
service = next(s for s in manager.api("/services") if s["service_code"] == "JSPTEST-" + suffix)
manager.submit(f"/actions/services/{service['id']}", {"service_name": "Thay vật tư thử JSP", "labor_price": "60000", "default_part_id": str(part["id"]), "default_part_quantity": "1"})
manager.submit("/actions/services", {"service_code": "JSPTEST-LABOR-" + suffix, "service_name": "Kiểm tra riêng cho JSP", "labor_price": "30000", "default_part_id": "", "default_part_quantity": "1"})
labor = next(s for s in manager.api("/services") if s["service_code"] == "JSPTEST-LABOR-" + suffix)

tech.call("/orders/new")
values = {"customer_name": "JSPTEST Khách " + suffix, "customer_phone": "090" + str(int(suffix, 16))[-7:].zfill(7), "customer_email": "jsp-test@example.com", "license_plate": "JSPTEST-" + suffix, "vehicle_model": "Xe kiểm thử", "symptoms": '<script>alert("xss")</script>', f"choose_{service['id']}": "on", f"quantity_{service['id']}": "2", f"choose_{labor['id']}": "on", f"quantity_{labor['id']}": "1"}
tech.submit("/orders/review", {**values, "customer_phone": "wrong"}, expected=400)
assert "Số điện thoại cần" in tech.html
assert tech.form("/orders/review")[f"choose_{service['id']}"] == "on", "Giữ lựa chọn khi nhập lỗi"
tech.submit("/orders/review", values)
assert tech.url.endswith("/orders/review")
assert "Xem lại phiếu tiếp nhận" in tech.html
assert '<script>alert("xss")</script>' not in tech.html
before = tech.api("/work-orders")
assert not any(o["license_plate"] == values["license_plate"] for o in before), "Bản nháp chưa được ghi DB"
confirmation = tech.form("/actions/orders")
tech.submit("/actions/orders")
assert "Đã tiếp nhận xe" in tech.html
code = parse.parse_qs(parse.urlparse(tech.url).query)["code"][0]
tech.call("/actions/orders", confirmation, expected=400)
detail = tech.api("/work-orders/" + code)
expected_total = 2 * 180000 + float(labor["labor_price"])
assert float(detail["total_amount"]) == expected_total
other.call("/orders/detail?code=" + code, expected=404)
manager.call("/orders/detail?code=" + code)
assert "phiếu đang nhận" in manager.html
manager.submit("/actions/assignments/" + code, {"technician_id": "2"})
tech.call("/orders/detail?code=" + code)
tech.submit(f"/actions/progress/{code}/start")
assert 'disabled>Hoàn thành sửa chữa' in tech.html
for item in detail["items"]:
    if item["item_type"] == "LABOR":
        tech.submit(f"/actions/progress/{code}/items/{item['id']}", {"progress_percent": "100"})
tech.submit(f"/actions/progress/{code}/finish")
assert tech.api("/work-orders/" + code)["current_status"] == "WAITING_PAYMENT"
assert next(p for p in manager.api("/inventory") if p["id"] == part["id"])["stock_quantity"] == 4

customer.call("/login/customer")
customer.submit("/actions/auth/request-otp", {"phone_number": values["customer_phone"], "license_plate": values["license_plate"]})
assert "Bước 2/2" in customer.html
preview = re.search(r'Mã thử:\s*<strong>\s*([0-9]{6})\s*</strong>', customer.html)
assert preview, "Bật DEMO_MODE=true để kiểm tra OTP không gửi email"
customer.submit("/actions/auth/verify-otp", {"otp_code": preview.group(1)})
customer.call("/orders/detail?code=" + code)
assert "img.vietqr.io/image/MB-0797526990" in customer.html
customer.call("/inventory", expected=403)
customer.call("/orders/detail?code=DEMO-001", expected=404)
customer.call("/orders/detail?code=" + code)
customer.submit("/actions/payments/report")
assert "Vui lòng chờ gara đối soát" in customer.html
manager.call("/orders/detail?code=" + code)
manager.submit("/actions/payments/verify")
assert "Có thể bàn giao xe" in manager.html
assert manager.api("/work-orders/" + code)["payment_status"] == "PAID"
customer.call("/orders/detail?code=" + code)
assert "Khách có thể nhận xe" in customer.html
customer.submit("/actions/auth/logout")
customer.call("/orders")
assert customer.url.endswith("/login/staff")
print(json.dumps({"result": "PASS", "jsp_order": code, "checked": ["UTF-8", "CSRF", "role_pages", "draft_review", "duplicate_submit", "escaped_output", "inventory", "services", "assignment", "checklist", "stock", "OTP", "VietQR", "report_payment", "verify_payment", "logout"]}, ensure_ascii=False))
