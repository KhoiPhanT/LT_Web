package com.hihihaha.gara.dao;

import com.hihihaha.gara.config.DBContext;
import java.math.BigDecimal;
import java.sql.*;
import java.util.*;

/** Phụ trách phần mới: Tân. Danh mục kho và phép trừ tồn dùng chung một giao dịch với tiến độ. */
public class InventoryDAO {
  public List<Map<String, Object>> all() throws SQLException {
    List<Map<String, Object>> out = new ArrayList<>();
    try (Connection c = DBContext.getConnection();
        PreparedStatement ps =
            c.prepareStatement(
                "SELECT id,part_code,part_name,unit,price,stock_quantity FROM parts ORDER BY"
                    + " part_code");
        ResultSet rs = ps.executeQuery()) {
      while (rs.next()) out.add(row(rs));
    }
    return out;
  }

  public Map<String, Object> create(
      String code, String name, String unit, BigDecimal price, int stock) throws SQLException {
    try (Connection c = DBContext.getConnection();
        PreparedStatement ps =
            c.prepareStatement(
                "INSERT INTO parts(part_code,part_name,unit,price,stock_quantity)"
                    + " VALUES(?,?,?,?,?)",
                Statement.RETURN_GENERATED_KEYS)) {
      ps.setString(1, code);
      ps.setString(2, name);
      ps.setString(3, unit);
      ps.setBigDecimal(4, price);
      ps.setInt(5, stock);
      ps.executeUpdate();
      try (ResultSet rs = ps.getGeneratedKeys()) {
        rs.next();
        return byId(c, rs.getLong(1));
      }
    }
  }

  public Map<String, Object> setStock(long id, int stock) throws SQLException {
    try (Connection c = DBContext.getConnection();
        PreparedStatement ps = c.prepareStatement("UPDATE parts SET stock_quantity=? WHERE id=?")) {
      ps.setInt(1, stock);
      ps.setLong(2, id);
      if (ps.executeUpdate() == 0) return null;
      return byId(c, id);
    }
  }

  public Map<String, Object> byId(Connection c, long id) throws SQLException {
    try (PreparedStatement ps =
        c.prepareStatement(
            "SELECT id,part_code,part_name,unit,price,stock_quantity FROM parts WHERE id=?")) {
      ps.setLong(1, id);
      try (ResultSet rs = ps.executeQuery()) {
        return rs.next() ? row(rs) : null;
      }
    }
  }

  private Map<String, Object> row(ResultSet rs) throws SQLException {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("id", rs.getLong("id"));
    m.put("part_code", rs.getString("part_code"));
    m.put("part_name", rs.getString("part_name"));
    m.put("unit", rs.getString("unit"));
    m.put("price", rs.getBigDecimal("price"));
    m.put("stock_quantity", rs.getInt("stock_quantity"));
    return m;
  }

  /**
   * Tân: khóa từng mã hàng, kiểm tra đủ tồn rồi cập nhật; Kiệt gọi trong giao dịch hoàn thành lệnh.
   */
  public void deductForOrder(Connection c, long orderId) throws SQLException {
    List<long[]> needs = new ArrayList<>();
    try (PreparedStatement ps =
        c.prepareStatement(
            "SELECT part_id,SUM(quantity) AS qty FROM work_order_items WHERE work_order_id=? AND"
                + " part_id IS NOT NULL GROUP BY part_id ORDER BY part_id")) {
      ps.setLong(1, orderId);
      try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) needs.add(new long[] {rs.getLong("part_id"), rs.getLong("qty")});
      }
    }
    for (long[] need : needs) {
      try (PreparedStatement lock =
          c.prepareStatement("SELECT stock_quantity FROM parts WHERE id=? FOR UPDATE")) {
        lock.setLong(1, need[0]);
        try (ResultSet rs = lock.executeQuery()) {
          if (!rs.next() || rs.getLong(1) < need[1])
            throw new SQLException("Phụ tùng không đủ tồn (ID " + need[0] + ")", "45000");
        }
      }
      try (PreparedStatement update =
          c.prepareStatement("UPDATE parts SET stock_quantity=stock_quantity-? WHERE id=?")) {
        update.setLong(1, need[1]);
        update.setLong(2, need[0]);
        update.executeUpdate();
      }
    }
  }
}
