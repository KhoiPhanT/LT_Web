package com.hihihaha.gara.dao;

import com.hihihaha.gara.config.DBContext;
import com.hihihaha.gara.model.WorkshopBay;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class WorkshopBayDAO {

    public List<WorkshopBay> getAll() {
        List<WorkshopBay> list = new ArrayList<>();
        String sql = "SELECT * FROM workshop_bays ORDER BY id ASC";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                WorkshopBay b = new WorkshopBay();
                b.setId(rs.getInt("id"));
                b.setBayCode(rs.getString("bay_code"));
                b.setBayName(rs.getString("bay_name"));
                b.setBayType(rs.getString("bay_type"));
                b.setOccupied(rs.getBoolean("is_occupied"));
                list.add(b);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public void updateOccupied(int bayId, boolean occupied) {
        String sql = "UPDATE workshop_bays SET is_occupied = ? WHERE id = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setBoolean(1, occupied);
            ps.setInt(2, bayId);
            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
