package com.hihihaha.gara.servlet;

import com.fasterxml.jackson.databind.JsonNode;
import com.hihihaha.gara.config.DBContext;
import com.hihihaha.gara.dao.InventoryDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.*;
import java.util.Map;

/**
 * Phụ trách phần mới: Kiệt. Checklist công việc và tiến độ lệnh được giao; trừ kho một lần khi
 * xong.
 */
@WebServlet({"/api/v1/progress/*", "/actions/progress/*"})
public class ProgressServlet extends ServletSupport {
  private final InventoryDAO inventory = new InventoryDAO();

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    if (!allow(req, resp, "TECHNICIAN")) return;
    String[] parts = req.getPathInfo() == null ? new String[0] : req.getPathInfo().split("/");
    if (parts.length != 3
        || parts[1].isBlank()
        || !(parts[2].equals("start") || parts[2].equals("finish"))) {
      err(req, resp, 404, "Endpoint không tồn tại");
      return;
    }
    boolean finish = parts[2].equals("finish");
    String code = parts[1];
    try (Connection c = DBContext.getConnection()) {
      c.setAutoCommit(false);
      try {
        long id;
        String status;
        Timestamp deducted;
        try (PreparedStatement ps =
            c.prepareStatement(
                "SELECT id,status,stock_deducted_at FROM work_orders WHERE order_code=? AND"
                    + " assigned_to=? FOR UPDATE")) {
          ps.setString(1, code);
          ps.setLong(2, userId(req));
          try (ResultSet rs = ps.executeQuery()) {
            if (!rs.next()) {
              c.rollback();
              err(req, resp, 404, "Lệnh không được giao cho bạn");
              return;
            }
            id = rs.getLong("id");
            status = rs.getString("status");
            deducted = rs.getTimestamp("stock_deducted_at");
          }
        }
        if ((!finish && !"RECEIVED".equals(status))
            || (finish && (!"IN_PROGRESS".equals(status) || deducted != null))) {
          c.rollback();
          err(req, resp, 409, "Trạng thái lệnh không cho phép thao tác này");
          return;
        }
        // Kiệt: chỉ hoàn thành khi mọi công việc trong checklist đạt 100%.
        if (finish)
          try (PreparedStatement ps =
              c.prepareStatement(
                  "SELECT COUNT(*) AS total,COALESCE(SUM(progress_percent<>100),0) AS incomplete"
                      + " FROM work_order_items WHERE work_order_id=? AND item_type='LABOR'")) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
              rs.next();
              if (rs.getInt("total") == 0 || rs.getInt("incomplete") > 0) {
                c.rollback();
                err(
                    req,
                    resp,
                    409,
                    "Cần hoàn thành 100% các công việc trước khi kết thúc sửa chữa");
                return;
              }
            }
          }
        if (finish) inventory.deductForOrder(c, id);
        String sql =
            finish
                ? "UPDATE work_orders SET"
                      + " status='WAITING_PAYMENT',finished_at=CURRENT_TIMESTAMP,stock_deducted_at=CURRENT_TIMESTAMP"
                      + " WHERE id=?"
                : "UPDATE work_orders SET status='IN_PROGRESS' WHERE id=?";
        try (PreparedStatement ps = c.prepareStatement(sql)) {
          ps.setLong(1, id);
          ps.executeUpdate();
        }
        c.commit();
        ok(
            req,
            resp,
            Map.of(
                "order_code", code, "current_status", finish ? "WAITING_PAYMENT" : "IN_PROGRESS"));
      } catch (SQLException e) {
        c.rollback();
        err(
            req,
            resp,
            "45000".equals(e.getSQLState()) ? 409 : 503,
            "45000".equals(e.getSQLState()) ? e.getMessage() : "Không cập nhật được tiến độ");
      }
    } catch (SQLException e) {
      err(req, resp, 503, "Không kết nối được CSDL");
    }
  }

  /** Kiệt: thợ được phân công cập nhật một việc 0 → 50 → 100; có thể sửa lại trước khi kết thúc. */
  @Override
  protected void doPatch(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    if (!allow(req, resp, "TECHNICIAN")) return;
    String path = req.getPathInfo();
    if (path == null || !path.matches("/[^/]+/items/\\d+")) {
      err(req, resp, 404, "Endpoint không tồn tại");
      return;
    }
    String[] segments = path.split("/");
    String code = segments[1];
    long itemId;
    try {
      itemId = Long.parseLong(segments[3]);
    } catch (NumberFormatException e) {
      err(req, resp, 400, "ID công việc không hợp lệ");
      return;
    }
    JsonNode body;
    try {
      body = body(req);
    } catch (Exception e) {
      err(req, resp, 400, "JSON không hợp lệ");
      return;
    }
    long progress = num(body, "progress_percent");
    if (progress != 0 && progress != 50 && progress != 100) {
      err(req, resp, 400, "Tiến độ chỉ nhận 0, 50 hoặc 100%");
      return;
    }
    try (Connection c = DBContext.getConnection()) {
      c.setAutoCommit(false);
      try {
        long orderId;
        try (PreparedStatement ps =
            c.prepareStatement(
                "SELECT id,status FROM work_orders WHERE order_code=? AND assigned_to=? FOR"
                    + " UPDATE")) {
          ps.setString(1, code);
          ps.setLong(2, userId(req));
          try (ResultSet rs = ps.executeQuery()) {
            if (!rs.next()) {
              c.rollback();
              err(req, resp, 404, "Lệnh không được giao cho bạn");
              return;
            }
            orderId = rs.getLong("id");
            if (!"IN_PROGRESS".equals(rs.getString("status"))) {
              c.rollback();
              err(req, resp, 409, "Chỉ sửa checklist khi lệnh đang thi công");
              return;
            }
          }
        }
        try (PreparedStatement ps =
            c.prepareStatement(
                "SELECT id FROM work_order_items WHERE id=? AND work_order_id=? AND"
                    + " item_type='LABOR' FOR UPDATE")) {
          ps.setLong(1, itemId);
          ps.setLong(2, orderId);
          try (ResultSet rs = ps.executeQuery()) {
            if (!rs.next()) {
              c.rollback();
              err(req, resp, 404, "Không tìm thấy công việc trong lệnh");
              return;
            }
          }
        }
        try (PreparedStatement ps =
            c.prepareStatement("UPDATE work_order_items SET progress_percent=? WHERE id=?")) {
          ps.setLong(1, progress);
          ps.setLong(2, itemId);
          ps.executeUpdate();
        }
        c.commit();
        ok(req, resp, Map.of("order_code", code, "item_id", itemId, "progress_percent", progress));
      } catch (SQLException e) {
        c.rollback();
        err(req, resp, 503, "Không cập nhật được công việc");
      }
    } catch (SQLException e) {
      err(req, resp, 503, "Không kết nối được CSDL");
    }
  }
}
