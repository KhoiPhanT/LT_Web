package com.hihihaha.gara.dao;

import com.hihihaha.gara.config.DBContext;
import com.hihihaha.gara.model.Vehicle;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class VehicleDAO {

    public List<Vehicle> getAll() {
        List<Vehicle> list = new ArrayList<>();
        String sql = "SELECT v.*, c.full_name AS customer_name, c.phone_number AS customer_phone " +
                     "FROM vehicles v JOIN customers c ON v.customer_id = c.id ORDER BY v.id DESC";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapVehicle(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public Vehicle findByPlate(String plate) {
        String cleanPlate = plate.replaceAll("\\s+", "").toUpperCase();
        String sql = "SELECT v.*, c.full_name AS customer_name, c.phone_number AS customer_phone " +
                     "FROM vehicles v JOIN customers c ON v.customer_id = c.id " +
                     "WHERE REPLACE(UPPER(v.license_plate), ' ', '') = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, cleanPlate);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapVehicle(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public int create(Vehicle v) {
        String sql = "INSERT INTO vehicles (license_plate, customer_id, brand, model, manufacture_year, odo_km) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, v.getLicensePlate());
            ps.setInt(2, v.getCustomerId());
            ps.setString(3, v.getBrand());
            ps.setString(4, v.getModel());
            ps.setInt(5, v.getManufactureYear());
            ps.setInt(6, v.getOdoKm());
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }

    private Vehicle mapVehicle(ResultSet rs) throws SQLException {
        Vehicle v = new Vehicle();
        v.setId(rs.getInt("id"));
        v.setLicensePlate(rs.getString("license_plate"));
        v.setCustomerId(rs.getInt("customer_id"));
        v.setCustomerName(rs.getString("customer_name"));
        v.setCustomerPhone(rs.getString("customer_phone"));
        v.setBrand(rs.getString("brand"));
        v.setModel(rs.getString("model"));
        v.setManufactureYear(rs.getInt("manufacture_year"));
        v.setOdoKm(rs.getInt("odo_km"));
        return v;
    }
}
