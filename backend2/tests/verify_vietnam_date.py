#!/usr/bin/env python3
"""Kiểm tra biên ngày UTC/VN bằng fixture AUDIT, chỉ trên ltweb-audit.
Khôi phục assigned_at sau kiểm tra để chạy lại không làm lệch báo cáo của các test khác.
"""
import json
import pathlib
import subprocess
from web_client import Browser, login, BASE

if BASE != "http://127.0.0.1:18089":
    raise SystemExit("Chỉ chạy trên stack audit mặc định cổng 18089")
root = pathlib.Path(__file__).resolve().parents[2]
prefix = json.loads((root / "docs/audit-test-result.json").read_text())["prefix"]
if not prefix.startswith("AUDIT-") or any(c not in "AUDIT-0123456789ABCDEF" for c in prefix):
    raise SystemExit("Fixture audit không hợp lệ")
cmd = ["docker", "compose", "--env-file", ".env.audit.local", "exec", "-T", "mysql_db", "sh", "-c",
       'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 -N -uroot hihihaha_simple_db']


def sql(text):
    result = subprocess.run(cmd, input="SET time_zone='+00:00';\n" + text, text=True,
                            capture_output=True, cwd=root, check=True)
    return result.stdout.strip()


row = sql(f"SELECT w.id,DATE_FORMAT(w.assigned_at,'%Y-%m-%d %H:%i:%s') FROM work_orders w JOIN vehicles v ON v.id=w.vehicle_id WHERE v.license_plate='{prefix}-0' AND w.assigned_to=2 LIMIT 1;")
order_id, original = row.split("\t")
assert order_id.isdigit()
manager = Browser()
login(manager, "0988888802")


def count(day):
    rows = manager.api(f"/reports/technicians?from={day}&to={day}")
    return next(r for r in rows if r["id"] == 2)["assigned_count"]


try:
    # Lấy baseline không có fixture này, kể cả khi những lần chạy trước có fixture cùng ngày.
    sql(f"UPDATE work_orders SET assigned_at=NULL WHERE id={order_id};")
    baseline = {day:count(day) for day in ("2020-01-01", "2020-01-02")}
    sql(f"UPDATE work_orders SET assigned_at='2020-01-01 17:30:00' WHERE id={order_id};")
    assert count("2020-01-01") == baseline["2020-01-01"]
    assert count("2020-01-02") == baseline["2020-01-02"] + 1
finally:
    value = "NULL" if original == "NULL" else "'" + original + "'"
    sql(f"UPDATE work_orders SET assigned_at={value} WHERE id={order_id};")
print(json.dumps({"result":"PASS", "UTC":"2020-01-01 17:30:00", "Vietnam":"2020-01-02 00:30:00", "checked":"report uses Vietnam day; fixture timestamp restored"}))
