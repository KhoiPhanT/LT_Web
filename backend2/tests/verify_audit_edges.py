#!/usr/bin/env python3
"""Regression các lỗi audit. Chỉ chạy trên stack demo/test; tạo fixture AUDIT riêng.
GARA_WEB_BASE=http://127.0.0.1:18089 python3 backend2/tests/verify_audit_edges.py
"""
import concurrent.futures
import datetime
import json
import re
import threading
import uuid
from urllib import request, error, parse
from web_client import Browser, login, BASE


def api(browser, method, path, data=None, expected=200, content_type="application/json"):
    req = request.Request(BASE + "/api/v1" + path,
                          data=None if data is None else json.dumps(data).encode(),
                          headers={"Content-Type": content_type}, method=method)
    try:
        response = browser.opener.open(req, timeout=20)
    except error.HTTPError as ex:
        response = ex
    body = json.loads(response.read())
    if expected is not None:
        assert response.code == expected, (method, path, response.code, body)
    return response.code, body.get("data", body)


def parallel(calls):
    barrier = threading.Barrier(len(calls))
    def run(call):
        barrier.wait(timeout=10)
        return call()
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(calls)) as pool:
        return list(pool.map(run, calls))


manager, second_manager, tech, other = [Browser() for _ in range(4)]
login(manager, "0988888802")
login(second_manager, "0988888802")
login(tech, "0988888803")
login(other, "0988888804")
for path in ("/inventory", "/inventory;anything", "/%69nventory", "/services;anything", "/reports;anything"):
    tech.call(path, expected=403)
manager.call("/orders/new;anything", expected=403)
manager.call("/reports?from=2026-01-01&to=+999999999-12-31",expected=400)
api(manager,"GET","/reports/technicians?from=2026-01-01&to=%2B999999999-12-31",expected=400)
api(manager, "POST", "/inventory", {"part_code": "FORGED"}, expected=415, content_type="text/plain")
api(manager, "POST", "/auth/staff-login", {"phone_number": "0988888802", "password": " 123456 "}, expected=401)

suffix = uuid.uuid4().hex[:8].upper()
code_prefix = "AUDIT-" + suffix
phone_base = 900000000 + int(suffix, 16) % 90000000
identity = lambda i: {"customer_name": "Khách audit " + suffix, "customer_phone": "0" + str(phone_base+i), "customer_email": "audit@example.com", "license_plate": code_prefix + "-" + str(i), "vehicle_model": "Xe audit", "symptoms": "Audit regression"}
part_data = {"part_code": code_prefix, "part_name": "Vật tư audit", "unit": "Cái", "price": 120000, "stock_quantity": 4}
for price in ("1E1000", "10000000000", "0.001", "-1"):
    api(manager,"POST","/inventory",{**part_data,"price":price},expected=400)
api(manager,"POST","/inventory",{**part_data,"part_code":"x"*51},expected=400)
_, part = api(manager,"POST","/inventory",part_data,expected=201)
pid = part["id"]
manager.call("/inventory")
stale_stock = manager.form(f"/actions/inventory/{pid}/stock")
api(second_manager,"PATCH",f"/inventory/{pid}/stock",{"stock_quantity":3,"expected_stock":4})
manager.call(f"/actions/inventory/{pid}/stock",{**stale_stock,"stock_quantity":"10"},expected=409)
assert next(p for p in manager.api("/inventory") if p["id"]==pid)["stock_quantity"] == 3
api(manager,"PATCH",f"/inventory/{pid}/stock",{"stock_quantity":3,"expected_stock":3})
api(manager,"PATCH",f"/inventory/{pid}/stock",{"stock_quantity":3},expected=400)
manager.call(f"/actions/inventory/{pid}/stock",data={"_method":"PATCH","stock_quantity":"99","expected_stock":"3"},expected=403)
# PATCH thật trên đường form cũng phải có CSRF.
req=request.Request(BASE+f"/actions/inventory/{pid}/stock",data=b"stock_quantity=99&expected_stock=3",method="PATCH",headers={"Content-Type":"application/x-www-form-urlencoded"})
try: manager.opener.open(req); raise AssertionError("PATCH thiếu CSRF phải bị chặn")
except error.HTTPError as ex: assert ex.code==403

svc_data={"service_code":code_prefix,"service_name":"Dịch vụ audit","labor_price":100,"default_part_id":pid,"default_part_quantity":1}
_, service = api(manager,"POST","/services",svc_data,expected=201)
sid=service["id"]
form_values={**identity(0),f"choose_{sid}":"on",f"quantity_{sid}":"1"}
tech.call("/orders/new")
tech.submit("/orders/review",form_values)
confirmation=tech.form("/actions/orders")
api(manager,"PATCH",f"/services/{sid}",{**svc_data,"labor_price":200})
tech.call("/actions/orders",confirmation,expected=409)
assert not any(o["license_plate"]==identity(0)["license_plate"] for o in tech.api("/work-orders"))
tech.call("/orders/new")
tech.submit("/orders/review",form_values)
confirmation=tech.form("/actions/orders")
# Hai lần xác nhận đồng thời cùng session: đúng một phiếu được tạo.
def confirm():
    body=parse.urlencode(confirmation).encode()
    req=request.Request(BASE+"/actions/orders",data=body)
    try: response=tech.opener.open(req,timeout=20)
    except error.HTTPError as ex: response=ex
    response.read()
    return response.code
assert sorted(parallel([confirm,confirm])) == [200,400]
orders=[o for o in tech.api("/work-orders") if o["license_plate"]==identity(0)["license_plate"]]
assert len(orders)==1
code=orders[0]["order_code"]
assert float(orders[0]["total_amount"])==120200
other.call("/orders/detail?code="+code,expected=404)
api(tech,"POST","/work-orders",{**identity(10),"customer_email":"a@b.com\r\nRCPT TO:<x@y.com>","services":[{"service_id":sid,"quantity":1}]},expected=400)
api(tech,"POST","/work-orders",{**identity(10),"vehicle_model":"x"*101,"services":[{"service_id":sid,"quantity":1}]},expected=400)

# Xe cũ đổi dòng xe phải được lưu; tạo phiếu khác trên cùng hồ sơ.
_, changed=api(tech,"POST","/work-orders",{**identity(0),"vehicle_model":"Dòng xe đã sửa","services":[{"service_id":sid,"quantity":1}]},expected=201)
assert tech.api("/work-orders/"+changed["order_code"])["vehicle_model"]=="Dòng xe đã sửa"


# Giá tối đa với phần lẻ được JSON biểu diễn khoa học vẫn hợp lệ; nhân số lượng vượt cột thì rollback.
_, large_service=api(manager,"POST","/services",{"service_code":code_prefix+"-BIG","service_name":"Kiểm tra giới hạn tiền","labor_price":9999999999.99,"default_part_id":None,"default_part_quantity":1},expected=201)
api(tech,"POST","/work-orders",{**identity(20),"services":[{"service_id":large_service["id"],"quantity":2}]},expected=400)
assert not any(o["license_plate"]==identity(20)["license_plate"] for o in tech.api("/work-orders"))

def prepare_order(code):
    api(manager,"PATCH","/assignments/"+code,{"technician_id":2})
    api(tech,"POST",f"/progress/{code}/start",{})
    for task in tech.api("/work-orders/"+code)["items"]:
        if task["item_type"]=="LABOR":
            api(tech,"PATCH",f"/progress/{code}/items/{task['id']}",{"progress_percent":100})

prepare_order(code)
finish = lambda: api(tech,"POST",f"/progress/{code}/finish",{},expected=None)[0]
assert sorted(parallel([finish]*6))==[200,409,409,409,409,409]
assert next(p for p in manager.api("/inventory") if p["id"]==pid)["stock_quantity"]==2

# Hai phiếu tranh một vật tư còn lại: một thành công, phiếu còn lại rollback.
api(manager,"PATCH",f"/inventory/{pid}/stock",{"stock_quantity":1,"expected_stock":2})
codes=[]
for i in (1,2):
    _, created=api(tech,"POST","/work-orders",{**identity(i),"services":[{"service_id":sid,"quantity":1}]},expected=201)
    codes.append(created["order_code"])
    prepare_order(codes[-1])
results=parallel([lambda c=c: api(tech,"POST",f"/progress/{c}/finish",{},expected=None)[0] for c in codes])
assert sorted(results)==[200,409]
assert next(p for p in manager.api("/inventory") if p["id"]==pid)["stock_quantity"]==0
for order_code,status in zip(codes,results):
    assert tech.api("/work-orders/"+order_code)["current_status"] == ("WAITING_PAYMENT" if status==200 else "IN_PROGRESS")


def otp_identity(i):
    return {"phone_number":identity(i)["customer_phone"],"license_plate":identity(i)["license_plate"]}
_, issued=api(Browser(),"POST","/auth/request-otp",otp_identity(0))
otp=issued["otp_preview"]
results=parallel([lambda: api(Browser(),"POST","/auth/verify-otp",{**otp_identity(0),"otp_code":otp},expected=None)[0] for _ in range(12)])
assert results.count(200)==1 and results.count(400)==11
api(Browser(),"POST","/auth/request-otp",otp_identity(1))
results=parallel([lambda: api(Browser(),"POST","/auth/verify-otp",{**otp_identity(1),"otp_code":"wrong"},expected=None)[0] for _ in range(12)])
assert results.count(400)==5 and results.count(429)==7
results=parallel([lambda: api(Browser(),"POST","/auth/request-otp",otp_identity(2),expected=None)[0] for _ in range(8)])
assert results.count(200)==1 and results.count(429)==7

# Chỉ có một phiên khách đã tiêu thụ OTP; tạo lại OTP để kiểm tra thanh toán sau khi thành công.
customer=Browser()
# Hồ sơ thứ 10 có dữ liệu hợp lệ riêng, không phụ thuộc cooldown của các ca OTP trên.
_, pay_order=api(tech,"POST","/work-orders",{**identity(10),"services":[{"service_id":sid,"quantity":1}]},expected=201)
pay_code=pay_order["order_code"]
api(manager,"PATCH",f"/inventory/{pid}/stock",{"stock_quantity":1,"expected_stock":0})
prepare_order(pay_code)
api(tech,"POST",f"/progress/{pay_code}/finish",{})
_, issued=api(customer,"POST","/auth/request-otp",otp_identity(10))
api(customer,"POST","/auth/verify-otp",{**otp_identity(10),"otp_code":issued["otp_preview"]})
for path in ("/inventory;anything","/%72eports","/orders/new;anything"):
    customer.call(path,expected=403)
api(customer,"POST","/payments/report",{"order_code":pay_code})
verify=lambda: api(manager,"POST","/payments/verify",{"order_code":pay_code},expected=None)[0]
assert sorted(parallel([verify]*6))==[200,409,409,409,409,409]
assert customer.api("/work-orders/"+pay_code)["current_status"]=="COMPLETED"
today=datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))).date().isoformat()
report=manager.api(f"/reports/technicians?from={today}&to={today}")
assert next(r for r in report if r["id"]==2)["assigned_count"]>=4
api(customer,"POST","/auth/logout",{})
api(customer,"GET","/auth/me",expected=401)
print(json.dumps({"result":"PASS","prefix":code_prefix,"checked":["normalized_role_paths","JSON_content_type","password_spaces","input_bounds","SMTP_injection","stale_stock","CSRF_PATCH","stale_quote","concurrent_draft_confirm","vehicle_update","concurrent_finish_once","competing_stock_rollback","OTP_consume_once","OTP_attempt_limit","OTP_send_cooldown","concurrent_payment_once","VN_day_report","logout"]},ensure_ascii=False))
