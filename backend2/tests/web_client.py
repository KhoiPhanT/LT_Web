#!/usr/bin/env python3
"""HTTP client dùng chung cho kiểm thử JSP và audit; không chạy test khi import."""
import http.cookiejar
import json
import os
import re
import uuid
from html.parser import HTMLParser
from urllib import request, parse, error

BASE = os.getenv("GARA_WEB_BASE", "http://127.0.0.1:18089")


class Forms(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.forms = []
        self.current = None
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "form":
            self.current = {"action": attrs.get("action", ""), "fields": {}}
            self.forms.append(self.current)
        elif tag == "input" and self.current is not None and attrs.get("name"):
            if attrs.get("type") not in ("checkbox", "radio") or "checked" in attrs:
                self.current["fields"][attrs["name"]] = attrs.get("value", "on" if attrs.get("type") in ("checkbox", "radio") else "")

    def handle_endtag(self, tag):
        if tag == "form":
            self.current = None


class Browser:
    def __init__(self):
        self.opener = request.build_opener(request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
        self.html = ""
        self.url = ""

    def call(self, path, data=None, expected=200):
        body = None if data is None else parse.urlencode(data).encode()
        req = request.Request(BASE + path, data=body)
        try:
            response = self.opener.open(req, timeout=20)
        except error.HTTPError as ex:
            response = ex
        self.html = re.sub(r"\s+", " ", response.read().decode())
        self.url = response.url
        assert response.code == expected, (path, response.code, self.html[:1200])
        return self.html

    def form(self, action):
        forms = [f for f in Forms(self.html).forms if f["action"] == action]
        assert len(forms) == 1, (action, [f["action"] for f in Forms(self.html).forms])
        return forms[0]["fields"].copy()

    def submit(self, action, values=None, expected=200):
        fields = self.form(action)
        fields.update(values or {})
        return self.call(action, fields, expected)

    def api(self, path):
        return json.loads(self.opener.open(BASE + "/api/v1" + path, timeout=10).read())["data"]


def login(browser, phone):
    browser.call("/login/staff")
    browser.submit("/actions/auth/staff-login", {"phone_number": phone, "password": "123456"})
    assert "Phiếu sửa chữa" in browser.html
