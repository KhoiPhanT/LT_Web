package com.hihihaha.gara.servlet;

import com.hihihaha.gara.config.DBContext;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.*;
import java.time.LocalDate;
import java.util.*;

/** Phụ trách phần mới: Khởi. Chỉ số hiệu suất dựa trên nhóm lệnh được giao trong khoảng ngày. */
@WebServlet("/api/v1/reports/technicians")
public class ReportServlet extends ServletSupport {
  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    if (!allow(req, resp, "MANAGER")) return;
    LocalDate from, to;
    try {
      from =
          req.getParameter("from") == null
              ? LocalDate.now().minusDays(30)
              : LocalDate.parse(req.getParameter("from"));
      to =
          req.getParameter("to") == null
              ? LocalDate.now()
              : LocalDate.parse(req.getParameter("to"));
      if (to.isBefore(from)) throw new Exception();
    } catch (Exception e) {
      err(resp, 400, "Khoảng ngày không hợp lệ");
      return;
    }
    String sql =
        "SELECT u.id,u.full_name,COUNT(w.id) assigned_count,SUM(CASE WHEN w.finished_at IS NOT NULL"
            + " THEN 1 ELSE 0 END) finished_count FROM users u LEFT JOIN work_orders w ON"
            + " w.assigned_to=u.id AND w.assigned_at>=? AND w.assigned_at<? WHERE"
            + " u.role='TECHNICIAN' GROUP BY u.id,u.full_name ORDER BY u.id";
    List<Map<String, Object>> rows = new ArrayList<>();
    try (Connection c = DBContext.getConnection();
        PreparedStatement ps = c.prepareStatement(sql)) {
      ps.setDate(1, java.sql.Date.valueOf(from));
      ps.setDate(2, java.sql.Date.valueOf(to.plusDays(1)));
      try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {
          long assigned = rs.getLong("assigned_count"), finished = rs.getLong("finished_count");
          rows.add(
              Map.of(
                  "id",
                  rs.getLong("id"),
                  "full_name",
                  rs.getString("full_name"),
                  "assigned_count",
                  assigned,
                  "finished_count",
                  finished,
                  "completion_rate",
                  assigned == 0 ? 0 : Math.round(100.0 * finished / assigned)));
        }
      }
      ok(resp, rows);
    } catch (SQLException e) {
      err(resp, 503, "Không đọc được báo cáo");
    }
  }
}
