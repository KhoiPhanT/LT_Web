package com.hihihaha.gara.dao;

import com.hihihaha.gara.config.DBContext;
import java.sql.*;
import java.time.LocalDate;
import java.util.*;

/** Dữ liệu phân công và báo cáo của kỹ thuật viên. */
public class StaffDAO {
  public List<Map<String, Object>> technicians() throws SQLException {
    List<Map<String, Object>> rows = new ArrayList<>();
    try (Connection c = DBContext.getConnection();
        PreparedStatement ps =
            c.prepareStatement(
                "SELECT u.id,u.full_name,(SELECT COUNT(*) FROM work_orders w WHERE"
                    + " w.assigned_to=u.id AND w.status IN ('RECEIVED','IN_PROGRESS')) AS"
                    + " active_count FROM users u WHERE u.role='TECHNICIAN' ORDER BY u.full_name");
        ResultSet rs = ps.executeQuery()) {
      while (rs.next())
        rows.add(
            Map.of(
                "id",
                rs.getLong("id"),
                "full_name",
                rs.getString("full_name"),
                "active_count",
                rs.getInt("active_count")));
    }
    return rows;
  }

  public List<Map<String, Object>> report(LocalDate from, LocalDate to) throws SQLException {
    List<Map<String, Object>> rows = new ArrayList<>();
    try (Connection c = DBContext.getConnection();
        PreparedStatement ps =
            c.prepareStatement(
                "SELECT u.id,u.full_name,COUNT(w.id) assigned_count,SUM(w.finished_at IS NOT NULL)"
                    + " finished_count FROM users u LEFT JOIN work_orders w ON w.assigned_to=u.id"
                    + " AND w.assigned_at>=? AND w.assigned_at<? WHERE u.role='TECHNICIAN' GROUP BY"
                    + " u.id,u.full_name ORDER BY u.id")) {
      ps.setDate(1, java.sql.Date.valueOf(from));
      ps.setDate(2, java.sql.Date.valueOf(to.plusDays(1)));
      try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {
          long count = rs.getLong("assigned_count"), done = rs.getLong("finished_count");
          rows.add(
              Map.of(
                  "id",
                  rs.getLong("id"),
                  "full_name",
                  rs.getString("full_name"),
                  "assigned_count",
                  count,
                  "finished_count",
                  done,
                  "completion_rate",
                  count == 0 ? 0 : Math.round(100.0 * done / count)));
        }
      }
    }
    return rows;
  }
}
