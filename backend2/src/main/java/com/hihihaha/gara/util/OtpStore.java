package com.hihihaha.gara.util;

import java.util.HashMap;
import java.util.Map;

/** Một OTP chỉ dùng một lần; kiểm tra mã và tăng số lần thử là một thao tác nguyên tử. */
public final class OtpStore {
  public record Ticket(String code, long sentAt, long customerId, int attempts) {}

  public record Result(int status, String message, long customerId) {}

  private final Map<String, Ticket> entries = new HashMap<>();
  private final long ttl;

  public OtpStore(long ttl) {
    this.ttl = ttl;
  }

  public synchronized Ticket reserve(String key, String code, long customerId) {
    long now = System.currentTimeMillis();
    entries.entrySet().removeIf(e -> now - e.getValue().sentAt() > ttl);
    Ticket previous = entries.get(key);
    if (previous != null && now - previous.sentAt() < 60_000L)
      throw new IllegalStateException("Vui lòng chờ 60 giây trước khi gửi lại mã.");
    if (entries.size() >= 10_000)
      throw new IllegalStateException("Đang có nhiều yêu cầu OTP. Vui lòng thử lại sau.");
    Ticket ticket = new Ticket(code, now, customerId, 0);
    entries.put(key, ticket);
    return ticket;
  }

  public synchronized void cancel(String key, Ticket ticket) {
    entries.remove(key, ticket);
  }

  public synchronized Result verify(String key, String code) {
    Ticket entry = entries.get(key);
    if (entry == null || System.currentTimeMillis() - entry.sentAt() > ttl) {
      entries.remove(key);
      return new Result(400, "OTP đã hết hạn hoặc đã được sử dụng", 0);
    }
    if (entry.attempts() >= 5) return new Result(429, "Đã thử quá số lần cho phép", 0);
    if (!entry.code().equals(code)) {
      entries.put(
          key, new Ticket(entry.code(), entry.sentAt(), entry.customerId(), entry.attempts() + 1));
      return new Result(400, "OTP không đúng", 0);
    }
    entries.remove(key);
    return new Result(200, "Đã xác minh", entry.customerId());
  }
}
