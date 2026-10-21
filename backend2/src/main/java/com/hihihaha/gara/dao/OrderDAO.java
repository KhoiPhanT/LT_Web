package com.hihihaha.gara.dao;

import com.hihihaha.gara.config.DBContext;
import java.sql.*;
import java.util.*;

/** Đọc phiếu theo phạm vi vai trò, dùng chung cho JSP và API. */
public class OrderDAO {
  /** Khởi: ánh xạ một lệnh cho trang tiếp nhận, quản lý và khách hàng. */
  public static Map<String, Object> orderRow(ResultSet rs) throws SQLException {
    Map<String, Object> row = new LinkedHashMap<>();
    row.put("order_code", rs.getString("order_code"));
    row.put("license_plate", rs.getString("license_plate"));
    row.put("vehicle_model", rs.getString("vehicle_model"));
    row.put("customer_name", rs.getString("customer_name"));
    row.put("current_status", rs.getString("status"));
    row.put("progress_percent", rs.getInt("progress_percent"));
    row.put("symptoms", rs.getString("symptoms"));
    row.put("assigned_to", rs.getObject("assigned_to"));
    row.put("technician_name", rs.getString("technician_name"));
    row.put("total_amount", rs.getBigDecimal("total_amount"));
    row.put("payment_status", rs.getString("payment_status"));
    return row;
  }

  // Khởi: phép JOIN chung để các trang dùng cùng trạng thái lệnh và hóa đơn.
  // Kiệt: phần trăm chung tính từ các dòng công việc, không lưu số tổng dễ lệch dữ liệu.
  public static final String ORDER_SELECT =
      "SELECT"
          + " w.id,w.order_code,w.status,w.symptoms,w.assigned_to,w.total_amount,v.license_plate,v.model"
          + " AS vehicle_model,c.full_name AS customer_name,u.full_name AS"
          + " technician_name,i.payment_status,(SELECT"
          + " COALESCE(ROUND(AVG(task.progress_percent)),0) FROM work_order_items task WHERE"
          + " task.work_order_id=w.id AND task.item_type='LABOR') AS progress_percent FROM"
          + " work_orders w JOIN vehicles v ON v.id=w.vehicle_id JOIN customers c ON"
          + " c.id=v.customer_id LEFT JOIN users u ON u.id=w.assigned_to JOIN invoices i ON"
          + " i.work_order_id=w.id ";

  public List<Map<String, Object>> list(String role, long userId, String plate)
      throws SQLException {
    String sql = ORDER_SELECT + scope(role) + " ORDER BY w.id DESC";
    try (Connection c = DBContext.getConnection();
        PreparedStatement ps = c.prepareStatement(sql)) {
      bindScope(ps, 1, role, userId, plate);
      List<Map<String, Object>> rows = new ArrayList<>();
      try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) rows.add(orderRow(rs));
      }
      return rows;
    }
  }

  public Map<String, Object> detail(String code, String role, long userId, String plate)
      throws SQLException {
    try (Connection c = DBContext.getConnection();
        PreparedStatement ps =
            c.prepareStatement(ORDER_SELECT + scope(role) + " AND w.order_code=?")) {
      int next = bindScope(ps, 1, role, userId, plate);
      ps.setString(next, code);
      Map<String, Object> order;
      long id;
      try (ResultSet rs = ps.executeQuery()) {
        if (!rs.next()) return null;
        order = orderRow(rs);
        id = rs.getLong("id");
      }
      List<Map<String, Object>> items = new ArrayList<>();
      try (PreparedStatement lines =
          c.prepareStatement(
              "SELECT"
                  + " id,part_id,service_id,item_type,item_name,quantity,unit_price,total_price,progress_percent"
                  + " FROM work_order_items WHERE work_order_id=? ORDER BY id")) {
        lines.setLong(1, id);
        try (ResultSet rs = lines.executeQuery()) {
          while (rs.next()) {
            Map<String, Object> line = new LinkedHashMap<>();
            for (String key :
                List.of(
                    "id",
                    "part_id",
                    "service_id",
                    "item_type",
                    "item_name",
                    "quantity",
                    "unit_price",
                    "total_price",
                    "progress_percent")) line.put(key, rs.getObject(key));
            items.add(line);
          }
        }
      }
      order.put("items", items);
      return order;
    }
  }

  private String scope(String role) {
    return " WHERE 1=1 "
        + switch (role) {
          case "CUSTOMER" -> " AND c.id=? AND v.license_plate=?";
          case "TECHNICIAN" -> " AND (w.created_by=? OR w.assigned_to=?)";
          case "MANAGER" -> "";
          default -> " AND 1=0";
        };
  }

  private int bindScope(PreparedStatement ps, int index, String role, long id, String plate)
      throws SQLException {
    if ("CUSTOMER".equals(role)) {
      ps.setLong(index++, id);
      ps.setString(index++, plate);
    }
    if ("TECHNICIAN".equals(role)) {
      ps.setLong(index++, id);
      ps.setLong(index++, id);
    }
    return index;
  }
}
