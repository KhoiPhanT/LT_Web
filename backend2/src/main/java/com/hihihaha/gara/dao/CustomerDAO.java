package com.hihihaha.gara.dao;

import com.hihihaha.gara.config.DBContext;
import com.hihihaha.gara.model.Customer;

import java.sql.*;

public class CustomerDAO {

    public Customer findByPhone(String phone) {
        String sql = "SELECT * FROM customers WHERE phone_number = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, phone);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new Customer(
                            rs.getInt("id"),
                            rs.getString("full_name"),
                            rs.getString("phone_number"),
                            rs.getString("email"),
                            rs.getString("address")
                    );
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public Customer getById(int id) {
        String sql = "SELECT * FROM customers WHERE id = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new Customer(
                            rs.getInt("id"),
                            rs.getString("full_name"),
                            rs.getString("phone_number"),
                            rs.getString("email"),
                            rs.getString("address")
                    );
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public int create(Customer c) {
        String sql = "INSERT INTO customers (full_name, phone_number, email, address) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, c.getFullName());
            ps.setString(2, c.getPhoneNumber());
            ps.setString(3, c.getEmail());
            ps.setString(4, c.getAddress());
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
}
