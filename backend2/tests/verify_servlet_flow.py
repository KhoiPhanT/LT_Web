# Phụ trách phần mới: Lợi (quyền/thanh toán), Khởi (lệnh nhiều dịch vụ), Tân (kho/dịch vụ), Kiệt (tiến độ).
# Chạy trên MySQL demo tách biệt; tạo dữ liệu kiểm thử riêng.
import http.cookiejar
import json
import os
import urllib.error
import urllib.request
import uuid

BASE = os.environ.get("GARA_API_BASE", "http://127.0.0.1:8089/api/v1")


def client():
    return urllib.request.build_opener(
        urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar())
    )


def call(opener, method, path, data=None):
    body = None if data is None else json.dumps(data).encode()
    request = urllib.request.Request(
        BASE + path, data=body, headers={"Content-Type": "application/json"}, method=method
    )
    try:
        with opener.open(request) as response:
            return response.status, json.load(response)
    except urllib.error.HTTPError as error:
        return error.code, json.load(error)


manager, tech, other, customer, anon = client(), client(), client(), client(), client()
assert call(anon, "GET", "/services")[0] == 401
assert (
    call(
        manager, "POST", "/auth/staff-login", {"phone_number": "0988888802", "password": "123456"}
    )[0]
    == 200
)
assert (
    call(tech, "POST", "/auth/staff-login", {"phone_number": "0988888803", "password": "123456"})[0]
    == 200
)
assert (
    call(other, "POST", "/auth/staff-login", {"phone_number": "0988888804", "password": "123456"})[
        0
    ]
    == 200
)
assert call(tech, "POST", "/services", {"service_code": "X"})[0] == 403
assert call(tech, "GET", "/reports/technicians")[0] == 403
assert call(manager, "GET", "/reports/technicians")[0] == 200

suffix = uuid.uuid4().hex[:8].upper()
part = call(
    manager,
    "POST",
    "/inventory",
    {
        "part_code": "TEST-" + suffix,
        "part_name": "Phụ tùng kiểm thử",
        "unit": "Cái",
        "price": 123000,
        "stock_quantity": 2,
    },
)
assert part[0] == 201, part
part_id = part[1]["data"]["id"]
linked = call(
    manager,
    "POST",
    "/services",
    {
        "service_code": "SVC-TEST-" + suffix,
        "service_name": "Thay phụ tùng kiểm thử",
        "labor_price": 50000,
        "default_part_id": part_id,
        "default_part_quantity": 1,
    },
)
labor_only = call(
    manager,
    "POST",
    "/services",
    {
        "service_code": "SVC-CHECK-" + suffix,
        "service_name": "Kiểm tra bổ sung",
        "labor_price": 30000,
        "default_part_id": None,
        "default_part_quantity": 1,
    },
)
assert linked[0] == 201 and labor_only[0] == 201, (linked, labor_only)
service_id, check_id = linked[1]["data"]["id"], labor_only[1]["data"]["id"]
assert (
    call(
        manager,
        "POST",
        "/services",
        {
            "service_code": "SVC-TEST-" + suffix,
            "service_name": "Trùng",
            "labor_price": 1,
            "default_part_id": None,
            "default_part_quantity": 1,
        },
    )[0]
    == 409
)

plate = "TEST" + suffix
phone = "09" + suffix.replace("A", "1").replace("B", "2").replace("C", "3").replace(
    "D", "4"
).replace("E", "5").replace("F", "6")
base_order = {
    "license_plate": plate,
    "vehicle_model": "Xe demo",
    "customer_phone": phone,
    "customer_name": "Khách demo",
    "customer_email": "demo@example.com",
    "symptoms": "Kiểm thử nhiều dịch vụ",
}
assert (
    call(
        tech,
        "POST",
        "/work-orders",
        {**base_order, "services": [{"service_id": service_id, "quantity": 2147483648}]},
    )[0]
    == 400
)
assert (
    call(
        tech,
        "POST",
        "/work-orders",
        {**base_order, "services": [{"service_id": service_id, "quantity": 1.5}]},
    )[0]
    == 400
)
assert (
    call(
        tech,
        "POST",
        "/work-orders",
        {**base_order, "items": [{"item_type": "LABOR", "unit_price": 1}]},
    )[0]
    == 400
)
order = call(
    tech,
    "POST",
    "/work-orders",
    {
        **base_order,
        "services": [
            {"service_id": service_id, "quantity": 1, "labor_price": 1, "part_price": 1},
            {"service_id": service_id, "quantity": 1},
            {"service_id": check_id, "quantity": 1, "labor_price": 1},
        ],
    },
)
assert order[0] == 201, order
code = order[1]["data"]["order_code"]
assert float(order[1]["data"]["total_amount"]) == 376000, order
detail = call(tech, "GET", "/work-orders/" + code)[1]["data"]
assert [(item["item_type"], item["quantity"]) for item in detail["items"]] == [
    ("LABOR", 2),
    ("PART", 2),
    ("LABOR", 1),
], detail
assert (
    detail["items"][0]["service_id"] == service_id and detail["items"][2]["service_id"] == check_id
)
assert (
    call(
        manager,
        "PATCH",
        "/services/" + str(service_id),
        {
            "service_name": "Công mới",
            "labor_price": 60000,
            "default_part_id": part_id,
            "default_part_quantity": 1,
        },
    )[0]
    == 200
)
assert float(call(tech, "GET", "/work-orders/" + code)[1]["data"]["total_amount"]) == 376000
assert call(customer, "GET", "/work-orders/" + code)[0] == 401
assert call(tech, "POST", "/progress/" + code + "/start", {})[0] == 404
assert call(manager, "PATCH", "/assignments/" + code, {"technician_id": 2})[0] == 200
assert call(tech, "POST", "/progress/" + code + "/start", {})[0] == 200

# Kiệt: cả hai dịch vụ đều có checklist; một việc 100% vẫn chưa được kết thúc lệnh.
task_a, task_b = detail["items"][0]["id"], detail["items"][2]["id"]
task_path = "/progress/" + code + "/items/" + str(task_a)
assert call(other, "PATCH", task_path, {"progress_percent": 50})[0] == 404
assert call(manager, "PATCH", task_path, {"progress_percent": 50})[0] == 403
assert call(tech, "PATCH", task_path, {"progress_percent": 25})[0] == 400
assert (
    call(
        tech,
        "PATCH",
        "/progress/" + code + "/items/" + str(detail["items"][1]["id"]),
        {"progress_percent": 50},
    )[0]
    == 404
)
assert call(tech, "POST", "/progress/" + code + "/finish", {})[0] == 409
assert call(tech, "PATCH", task_path, {"progress_percent": 50})[0] == 200
assert call(manager, "GET", "/work-orders/" + code)[1]["data"]["progress_percent"] == 25
assert call(tech, "PATCH", task_path, {"progress_percent": 100})[0] == 200
assert call(tech, "POST", "/progress/" + code + "/finish", {})[0] == 409
assert (
    call(tech, "PATCH", "/progress/" + code + "/items/" + str(task_b), {"progress_percent": 100})[0]
    == 200
)
assert call(manager, "GET", "/work-orders/" + code)[1]["data"]["progress_percent"] == 100
assert call(tech, "POST", "/progress/" + code + "/finish", {})[0] == 200
assert call(tech, "POST", "/progress/" + code + "/finish", {})[0] == 409
assert call(tech, "PATCH", task_path, {"progress_percent": 0})[0] == 409
stock = next(
    part for part in call(manager, "GET", "/inventory")[1]["data"] if part["id"] == part_id
)["stock_quantity"]
assert stock == 0, stock

# Lợi: khách chỉ xem xe đã xác minh, báo chuyển khoản; quản lý mới được xác nhận PAID.
assert call(tech, "POST", "/payments/verify", {"order_code": code})[0] == 403
otp = call(customer, "POST", "/auth/request-otp", {"phone_number": phone, "license_plate": plate})
assert otp[0] == 200, otp
otp_code = otp[1]["data"]["otp_preview"]
assert (
    call(
        customer,
        "POST",
        "/auth/verify-otp",
        {"phone_number": phone, "license_plate": plate, "otp_code": "000000"},
    )[0]
    == 400
)
assert (
    call(
        customer,
        "POST",
        "/auth/verify-otp",
        {"phone_number": phone, "license_plate": plate, "otp_code": otp_code},
    )[0]
    == 200
)
assert call(customer, "GET", "/work-orders/" + code)[0] == 200
assert call(customer, "GET", "/services")[0] == 403
assert call(customer, "POST", "/payments/verify", {"order_code": code})[0] == 403
assert call(customer, "POST", "/payments/report", {"order_code": code})[0] == 200
assert call(manager, "POST", "/payments/verify", {"order_code": code})[0] == 200
assert call(manager, "GET", "/work-orders/" + code)[1]["data"]["payment_status"] == "PAID"

# Tân/Kiệt: thiếu hàng rollback lệnh dù mọi công việc đã đạt 100%.
short = uuid.uuid4().hex[:8].upper()
p2 = call(
    manager,
    "POST",
    "/inventory",
    {
        "part_code": "SHORT-" + short,
        "part_name": "Kho thiếu",
        "unit": "Cái",
        "price": 100,
        "stock_quantity": 1,
    },
)
assert p2[0] == 201, p2
p2id = p2[1]["data"]["id"]
s2 = call(
    manager,
    "POST",
    "/services",
    {
        "service_code": "SVC-SHORT-" + short,
        "service_name": "Thay món thiếu",
        "labor_price": 10000,
        "default_part_id": p2id,
        "default_part_quantity": 2,
    },
)
assert s2[0] == 201, s2
o2 = call(
    tech,
    "POST",
    "/work-orders",
    {
        "license_plate": "SHORT" + short,
        "vehicle_model": "Xe demo",
        "customer_phone": "090" + short,
        "customer_name": "Khách thiếu kho",
        "customer_email": "demo@example.com",
        "symptoms": "Kiểm thử thiếu kho",
        "services": [{"service_id": s2[1]["data"]["id"], "quantity": 1}],
    },
)
assert o2[0] == 201, o2
code2 = o2[1]["data"]["order_code"]
assert call(manager, "PATCH", "/assignments/" + code2, {"technician_id": 2})[0] == 200
assert call(tech, "POST", "/progress/" + code2 + "/start", {})[0] == 200
short_detail = call(tech, "GET", "/work-orders/" + code2)[1]["data"]
short_task = next(item for item in short_detail["items"] if item["item_type"] == "LABOR")
assert (
    call(
        tech,
        "PATCH",
        "/progress/" + code2 + "/items/" + str(short_task["id"]),
        {"progress_percent": 100},
    )[0]
    == 200
)
assert call(tech, "POST", "/progress/" + code2 + "/finish", {})[0] == 409
assert call(tech, "GET", "/work-orders/" + code2)[1]["data"]["current_status"] == "IN_PROGRESS"
assert (
    next(part for part in call(manager, "GET", "/inventory")[1]["data"] if part["id"] == p2id)[
        "stock_quantity"
    ]
    == 1
)
assert call(customer, "GET", "/work-orders/" + code2)[0] == 404
print(
    json.dumps({"result": "PASS", "multi_service_order": code, "insufficient_stock_order": code2})
)
