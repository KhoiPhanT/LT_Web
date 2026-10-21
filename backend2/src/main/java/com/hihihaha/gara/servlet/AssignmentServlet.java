package com.hihihaha.gara.servlet;

import com.fasterxml.jackson.databind.JsonNode;
import com.hihihaha.gara.config.DBContext;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.*;
import java.util.Map;

/** Phụ trách phần mới: Khởi. Quản lý giao lệnh cho kỹ thuật viên còn hoạt động. */
@WebServlet({"/api/v1/assignments/*", "/actions/assignments/*"})
public class AssignmentServlet extends ServletSupport {
  @Override
  protected void doPatch(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    if (!allow(req, resp, "MANAGER")) return;
    String code = req.getPathInfo() == null ? "" : req.getPathInfo().replaceFirst("^/", "");
    if (code.isBlank() || code.contains("/")) {
      err(req, resp, 400, "Thiếu mã lệnh");
      return;
    }
    JsonNode b;
    try {
      b = body(req);
    } catch (Exception e) {
      err(req, resp, 400, "JSON không hợp lệ");
      return;
    }
    long tech = num(b, "technician_id");
    if (tech <= 0) {
      err(req, resp, 400, "Chưa chọn kỹ thuật viên");
      return;
    }
    try (Connection c = DBContext.getConnection()) {
      try (PreparedStatement check =
          c.prepareStatement("SELECT 1 FROM users WHERE id=? AND role='TECHNICIAN'")) {
        check.setLong(1, tech);
        try (ResultSet rs = check.executeQuery()) {
          if (!rs.next()) {
            err(req, resp, 400, "Kỹ thuật viên không tồn tại");
            return;
          }
        }
      }
      try (PreparedStatement ps =
          c.prepareStatement(
              "UPDATE work_orders SET assigned_to=?,assigned_at=CURRENT_TIMESTAMP WHERE"
                  + " order_code=? AND status='RECEIVED'")) {
        ps.setLong(1, tech);
        ps.setString(2, code);
        if (ps.executeUpdate() == 0) {
          err(req, resp, 409, "Chỉ phân công được lệnh mới tiếp nhận");
          return;
        }
      }
      ok(req, resp, Map.of("order_code", code, "technician_id", tech));
    } catch (SQLException e) {
      err(req, resp, 503, "Không phân công được lệnh");
    }
  }
}
