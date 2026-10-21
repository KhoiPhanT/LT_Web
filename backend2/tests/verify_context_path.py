#!/usr/bin/env python3
"""Kiểm tra WAR deploy dưới /gara trên Tomcat audit. Chỉ đọc dữ liệu và đăng nhập/đăng xuất."""
import http.cookiejar
import json
import os
import re
import time
from urllib import request, error, parse

BASE = os.getenv("GARA_CONTEXT_BASE", "http://127.0.0.1:18089/gara").rstrip("/")
context = parse.urlparse(BASE).path
browser = request.build_opener(request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
for attempt in range(30):
    try:
        response = browser.open(BASE + "/", timeout=5)
        html = response.read().decode()
        break
    except error.HTTPError as ex:
        if ex.code != 404 or attempt == 29:
            raise
        time.sleep(0.5)
assert "Xe của bạn đang" in html
html = browser.open(BASE + "/login/staff").read().decode()
assert f'action="{context}/actions/auth/staff-login"' in html
csrf = re.search(r'name="csrf"\s+value="([^"]+)"', html).group(1)
body = parse.urlencode({"csrf":csrf,"phone_number":"0988888803","password":"123456"}).encode()
response = browser.open(request.Request(BASE + "/actions/auth/staff-login", data=body))
html = response.read().decode()
assert response.url.endswith(context + "/orders")
assert f'href="{context}/assets/style.css"' in html
assert browser.open(BASE + "/assets/style.css").status == 200
for path in ("/inventory;probe", "/%72eports"):
    try:
        browser.open(BASE+path)
        raise AssertionError("Phải kiểm tra quyền khi có context path")
    except error.HTTPError as ex:
        assert ex.code == 403
html = browser.open(BASE + "/orders/detail?code=DEMO-001").read().decode()
assert f'action="{context}/actions/auth/logout"' in html
csrf = re.search(r'name="csrf"\s+value="([^"]+)"', html).group(1)
response = browser.open(request.Request(BASE+"/actions/auth/logout",data=parse.urlencode({"csrf":csrf}).encode()))
assert response.url.endswith(context+"/home")
response = browser.open(BASE+"/orders")
assert response.url.endswith(context+"/login/staff")
print(json.dumps({"result":"PASS","context":context,"checked":["home_UTF8","form_action","session_login","CSS","normalized_role_paths","logout_redirect"]}))
