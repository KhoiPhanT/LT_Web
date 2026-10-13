package com.hihihaha.gara.dao;

import com.hihihaha.gara.config.DBContext;
import com.hihihaha.gara.model.WorkOrderItem;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class WorkOrderItemDAO {

    public List<WorkOrderItem> getByWorkOrderId(int workOrderId) {
        List<WorkOrderItem> list = new ArrayList<>();
        String sql = "SELECT * FROM work_order_items WHERE work_order_id = ? ORDER BY id ASC";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, workOrderId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    WorkOrderItem item = new WorkOrderItem();
                    item.setId(rs.getInt("id"));
                    item.setWorkOrderId(rs.getInt("work_order_id"));
                    int pId = rs.getInt("part_id");
                    item.setPartId(rs.wasNull() ? null : pId);
                    item.setItemType(rs.getString("item_type"));
                    item.setItemName(rs.getString("item_name"));
                    item.setQuantity(rs.getInt("quantity"));
                    item.setUnitPrice(rs.getBigDecimal("unit_price"));
                    item.setTotalPrice(rs.getBigDecimal("total_price"));
                    item.setDone(rs.getBoolean("is_done"));
                    list.add(item);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public boolean create(WorkOrderItem item) {
        String sql = "INSERT INTO work_order_items (work_order_id, part_id, item_type, item_name, quantity, unit_price, total_price, is_done) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, item.getWorkOrderId());
            if (item.getPartId() != null) {
                ps.setInt(2, item.getPartId());
            } else {
                ps.setNull(2, Types.INTEGER);
            }
            ps.setString(3, item.getItemType());
            ps.setString(4, item.getItemName());
            ps.setInt(5, item.getQuantity());
            ps.setBigDecimal(6, item.getUnitPrice());
            ps.setBigDecimal(7, item.getTotalPrice());
            ps.setBoolean(8, item.isDone());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateDone(int itemId, boolean isDone) {
        String sql = "UPDATE work_order_items SET is_done = ? WHERE id = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setBoolean(1, isDone);
            ps.setInt(2, itemId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
}
