package com.hihihaha.gara.dao;

import com.hihihaha.gara.config.DBContext;
import com.hihihaha.gara.model.Part;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PartDAO {

    public List<Part> getAll() {
        List<Part> list = new ArrayList<>();
        String sql = "SELECT * FROM parts ORDER BY id ASC";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapPart(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public Part getById(int id) {
        String sql = "SELECT * FROM parts WHERE id = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapPart(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean deductStock(int partId, int quantity) {
        String sql = "UPDATE parts SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, quantity);
            ps.setInt(2, partId);
            ps.setInt(3, quantity);
            int rows = ps.executeUpdate();
            return rows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean create(Part p) {
        String sql = "INSERT INTO parts (part_code, part_name, category, unit, price, stock_quantity, location_bin) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, p.getPartCode());
            ps.setString(2, p.getPartName());
            ps.setString(3, p.getCategory());
            ps.setString(4, p.getUnit());
            ps.setBigDecimal(5, p.getPrice());
            ps.setInt(6, p.getStockQuantity());
            ps.setString(7, p.getLocationBin());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private Part mapPart(ResultSet rs) throws SQLException {
        Part p = new Part();
        p.setId(rs.getInt("id"));
        p.setPartCode(rs.getString("part_code"));
        p.setPartName(rs.getString("part_name"));
        p.setCategory(rs.getString("category"));
        p.setUnit(rs.getString("unit"));
        p.setPrice(rs.getBigDecimal("price"));
        p.setStockQuantity(rs.getInt("stock_quantity"));
        p.setLocationBin(rs.getString("location_bin"));
        return p;
    }
}
