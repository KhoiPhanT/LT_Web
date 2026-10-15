package com.hihihaha.gara.servlet;

import com.fasterxml.jackson.databind.JsonNode;
import com.hihihaha.gara.config.DBContext;
import com.hihihaha.gara.util.EmailService;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.security.SecureRandom;
import java.sql.*;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.mindrot.jbcrypt.BCrypt;

/** Phụ trách phần mới: Lợi. Đăng nhập nhân viên và OTP email của khách hàng. */
@WebServlet("/api/v1/auth/*")
public class AuthServlet extends ServletSupport {
  private static final SecureRandom RANDOM = new SecureRandom();
  private static final ConcurrentHashMap<String, Otp> OTPS = new ConcurrentHashMap<>();
  // Lợi: mặc định 5 phút; biến môi trường cho phép kiểm thử hết hạn mà không phải chờ 5 phút.
  private static final long TTL = otpTtl();

  private static long otpTtl() {
    try {
      return Math.max(1_000L, Long.parseLong(System.getenv().getOrDefault("OTP_TTL_MS", "300000")));
    } catch (NumberFormatException e) {
      return 300000L;
    }
  }

  private record Otp(String code, long sentAt, long customerId, int attempts) {}

  private static String plate(String value) {
    return value.replaceAll("\\s+", "").toUpperCase();
  }

  // Lợi: trả tên mới nhất từ MySQL; localStorage cũ chỉ là cache hiển thị.
  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    if (!"/me".equals(req.getPathInfo())) {
      err(resp, 404, "Endpoint không tồn tại");
      return;
    }
    String currentRole = role(req);
    String table = "CUSTOMER".equals(currentRole) ? "customers" : "users";
    try (Connection c = DBContext.getConnection();
        PreparedStatement ps =
            c.prepareStatement("SELECT full_name,phone_number FROM " + table + " WHERE id=?")) {
      ps.setLong(1, userId(req));
      try (ResultSet rs = ps.executeQuery()) {
        if (!rs.next()) {
          req.getSession(false).invalidate();
          err(resp, 401, "Phiên không còn hợp lệ");
          return;
        }
        Map<String, Object> user = new LinkedHashMap<>();
        user.put("id", userId(req));
        user.put("role", currentRole);
        user.put("full_name", rs.getString("full_name"));
        user.put("phone_number", rs.getString("phone_number"));
        if ("CUSTOMER".equals(currentRole))
          user.put("license_plate", req.getSession(false).getAttribute("license_plate"));
        ok(resp, user);
      }
    } catch (SQLException e) {
      err(resp, 503, "Không đọc được phiên đăng nhập");
    }
  }

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    String path = req.getPathInfo();
    if ("/logout".equals(path)) {
      HttpSession s = req.getSession(false);
      if (s != null) s.invalidate();
      ok(resp, Map.of());
      return;
    }
    JsonNode b;
    try {
      b = body(req);
      if (b == null || !b.isObject()) throw new IOException();
    } catch (Exception e) {
      err(resp, 400, "JSON không hợp lệ");
      return;
    }
    if ("/staff-login".equals(path)) {
      String phone = str(b, "phone_number"), pass = str(b, "password");
      try (Connection c = DBContext.getConnection();
          PreparedStatement ps =
              c.prepareStatement(
                  "SELECT id,full_name,password_hash,role FROM users WHERE phone_number=?")) {
        ps.setString(1, phone);
        try (ResultSet rs = ps.executeQuery()) {
          if (!rs.next() || !BCrypt.checkpw(pass, rs.getString("password_hash"))) {
            err(resp, 401, "Sai số điện thoại hoặc mật khẩu");
            return;
          }
          HttpSession s = newSession(req);
          s.setAttribute("role", rs.getString("role"));
          s.setAttribute("user_id", rs.getLong("id"));
          ok(
              resp,
              Map.of(
                  "user",
                  Map.of(
                      "id",
                      rs.getLong("id"),
                      "role",
                      rs.getString("role"),
                      "full_name",
                      rs.getString("full_name"),
                      "phone_number",
                      phone)));
        }
      } catch (SQLException e) {
        err(resp, 503, "Không kết nối được CSDL");
      }
      return;
    }
    if ("/request-otp".equals(path)) {
      String phone = str(b, "phone_number"),
          p = plate(str(b, "license_plate")),
          key = phone + ":" + p;
      Otp previous = OTPS.get(key);
      long now = System.currentTimeMillis();
      if (previous != null && now - previous.sentAt() < 60_000L) {
        err(resp, 429, "Vui lòng chờ 60 giây");
        return;
      }
      try (Connection c = DBContext.getConnection();
          PreparedStatement ps =
              c.prepareStatement(
                  "SELECT c.id,c.email,c.full_name FROM customers c JOIN vehicles v ON"
                      + " v.customer_id=c.id WHERE c.phone_number=? AND v.license_plate=?")) {
        ps.setString(1, phone);
        ps.setString(2, p);
        try (ResultSet rs = ps.executeQuery()) {
          if (!rs.next() || rs.getString("email") == null || rs.getString("email").isBlank()) {
            err(resp, 404, "Không tìm thấy hồ sơ có email");
            return;
          }
          String email = rs.getString("email"),
              code = String.format("%06d", RANDOM.nextInt(1_000_000));
          boolean demo = "true".equalsIgnoreCase(System.getenv("DEMO_MODE"));
          if (!demo) {
            try {
              EmailService.sendOtpEmail(email, rs.getString("full_name"), p, code);
            } catch (Exception e) {
              err(resp, 503, "Không gửi được email OTP");
              return;
            }
          }
          OTPS.put(key, new Otp(code, now, rs.getLong("id"), 0));
          ok(
              resp,
              demo
                  ? Map.of("masked_email", mask(email), "otp_preview", code)
                  : Map.of("masked_email", mask(email)));
        }
      } catch (SQLException e) {
        err(resp, 503, "Không kết nối được CSDL");
      }
      return;
    }
    if ("/verify-otp".equals(path)) {
      String phone = str(b, "phone_number"),
          p = plate(str(b, "license_plate")),
          key = phone + ":" + p,
          code = str(b, "otp_code");
      Otp entry = OTPS.get(key);
      if (entry == null || System.currentTimeMillis() - entry.sentAt() > TTL) {
        OTPS.remove(key);
        err(resp, 400, "OTP đã hết hạn");
        return;
      }
      if (entry.attempts() >= 5) {
        OTPS.remove(key);
        err(resp, 429, "Đã thử quá số lần cho phép");
        return;
      }
      if (!entry.code().equals(code)) {
        OTPS.replace(
            key,
            entry,
            new Otp(entry.code(), entry.sentAt(), entry.customerId(), entry.attempts() + 1));
        err(resp, 400, "OTP không đúng");
        return;
      }
      OTPS.remove(key);
      HttpSession s = newSession(req);
      s.setAttribute("role", "CUSTOMER");
      s.setAttribute("user_id", entry.customerId());
      s.setAttribute("license_plate", p);
      ok(
          resp,
          Map.of(
              "user",
              Map.of(
                  "id",
                  entry.customerId(),
                  "role",
                  "CUSTOMER",
                  "phone_number",
                  phone,
                  "license_plate",
                  p)));
      return;
    }
    err(resp, 404, "Endpoint không tồn tại");
  }

  private static HttpSession newSession(HttpServletRequest req) {
    HttpSession old = req.getSession(false);
    if (old != null) old.invalidate();
    HttpSession s = req.getSession(true);
    s.setMaxInactiveInterval(12 * 60 * 60);
    return s;
  }

  private static String mask(String email) {
    int i = email.indexOf('@');
    return i > 1 ? email.charAt(0) + "***" + email.substring(i) : "***";
  }
}
