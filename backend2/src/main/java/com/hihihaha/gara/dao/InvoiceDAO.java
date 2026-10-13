package com.hihihaha.gara.dao;

import com.hihihaha.gara.config.DBContext;
import com.hihihaha.gara.model.Invoice;

import java.sql.*;

public class InvoiceDAO {

    public Invoice getByWorkOrderId(int workOrderId) {
        String sql = "SELECT inv.*, wo.order_code, c.full_name AS customer_name, v.license_plate " +
                     "FROM invoices inv " +
                     "JOIN work_orders wo ON inv.work_order_id = wo.id " +
                     "JOIN vehicles v ON wo.vehicle_id = v.id " +
                     "JOIN customers c ON v.customer_id = c.id " +
                     "WHERE inv.work_order_id = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, workOrderId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Invoice inv = new Invoice();
                    inv.setId(rs.getInt("id"));
                    inv.setInvoiceCode(rs.getString("invoice_code"));
                    inv.setWorkOrderId(rs.getInt("work_order_id"));
                    inv.setOrderCode(rs.getString("order_code"));
                    inv.setCustomerName(rs.getString("customer_name"));
                    inv.setLicensePlate(rs.getString("license_plate"));
                    inv.setTotalAmount(rs.getBigDecimal("total_amount"));
                    inv.setPaymentMethod(rs.getString("payment_method"));
                    inv.setPaymentStatus(rs.getString("payment_status"));
                    inv.setPaidAt(rs.getTimestamp("paid_at"));
                    inv.setCreatedAt(rs.getTimestamp("created_at"));
                    return inv;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean create(Invoice inv) {
        String sql = "INSERT INTO invoices (invoice_code, work_order_id, total_amount, payment_method, payment_status) " +
                     "VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, inv.getInvoiceCode());
            ps.setInt(2, inv.getWorkOrderId());
            ps.setBigDecimal(3, inv.getTotalAmount());
            ps.setString(4, inv.getPaymentMethod());
            ps.setString(5, inv.getPaymentStatus());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean markPaid(int workOrderId, String method) {
        String sql = "UPDATE invoices SET payment_status = 'PAID', payment_method = ?, paid_at = CURRENT_TIMESTAMP " +
                     "WHERE work_order_id = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, method);
            ps.setInt(2, workOrderId);
            int rows = ps.executeUpdate();
            if (rows > 0) {
                // Cập nhật trạng thái work_order thành COMPLETED
                String sqlWo = "UPDATE work_orders SET status = 'COMPLETED' WHERE id = ?";
                try (PreparedStatement psWo = conn.prepareStatement(sqlWo)) {
                    psWo.setInt(1, workOrderId);
                    psWo.executeUpdate();
                }
                return true;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
}
