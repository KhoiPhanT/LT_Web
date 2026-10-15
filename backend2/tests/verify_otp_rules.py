#!/usr/bin/env python3
"""Lợi: verify OTP expiration and five-attempt limit on an isolated demo stack.

Start a separate Docker project with DEMO_MODE=true and OTP_TTL_MS=1200, apply init.sql,
then set GARA_API_BASE to that project's backend URL before running this file.
"""
import json
import os
import time
import urllib.error
import urllib.request

TTL_MS = int(os.environ.get("OTP_TTL_MS", "0"))
if not 1000 <= TTL_MS <= 5000:
    raise SystemExit("Set OTP_TTL_MS=1200 in an isolated test stack and this shell")
BASE = os.environ.get("GARA_API_BASE", "http://127.0.0.1:18089/api/v1")


def call(path, data):
    request = urllib.request.Request(BASE + path, data=json.dumps(data).encode(),
                                     headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            return response.status, json.load(response)
    except urllib.error.HTTPError as error:
        return error.code, json.load(error)


identity = {"phone_number": "0901234567", "license_plate": "59A-12345"}
status, response = call("/auth/request-otp", identity)
assert status == 200, response
code = response["data"]["otp_preview"]
time.sleep(TTL_MS / 1000 + 0.4)
status, response = call("/auth/verify-otp", {**identity, "otp_code": code})
assert status == 400 and "hết hạn" in response["message"], response
status, response = call("/auth/request-otp", identity)
assert status == 200, response
for _ in range(5):
    status, response = call("/auth/verify-otp", {**identity, "otp_code": "wrong"})
    assert status == 400, response
status, response = call("/auth/verify-otp", {**identity, "otp_code": "wrong"})
assert status == 429, response
print(json.dumps({"otp_expired": "PASS", "five_attempt_limit": "PASS"}))
