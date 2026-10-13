package com.hihihaha.gara.dao;

import com.hihihaha.gara.config.DBContext;
import com.hihihaha.gara.model.WorkOrder;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class WorkOrderDAO {
    private final WorkOrderItemDAO itemDAO = new WorkOrderItemDAO();

    public List<WorkOrder> getAll(String statusFilter) {
        List<WorkOrder> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
            "SELECT wo.*, v.license_plate, v.model AS vehicle_model, " +
            "c.full_name AS customer_name, c.phone_number AS customer_phone, " +
            "adv.full_name AS advisor_name, " +
            "b.bay_name, tech.full_name AS technician_name " +
            "FROM work_orders wo " +
            "JOIN vehicles v ON wo.vehicle_id = v.id " +
            "JOIN customers c ON v.customer_id = c.id " +
            "JOIN users adv ON wo.advisor_id = adv.id " +
            "LEFT JOIN workshop_bays b ON wo.bay_id = b.id " +
            "LEFT JOIN users tech ON wo.technician_id = tech.id "
        );

        if (statusFilter != null && !statusFilter.trim().isEmpty()) {
            sql.append("WHERE wo.status = ? ");
        }
        sql.append("ORDER BY wo.id DESC");

        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            if (statusFilter != null && !statusFilter.trim().isEmpty()) {
                ps.setString(1, statusFilter.trim());
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    WorkOrder wo = mapWorkOrder(rs);
                    list.add(wo);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public WorkOrder getById(int id) {
        String sql = 
            "SELECT wo.*, v.license_plate, v.model AS vehicle_model, " +
            "c.full_name AS customer_name, c.phone_number AS customer_phone, " +
            "adv.full_name AS advisor_name, " +
            "b.bay_name, tech.full_name AS technician_name " +
            "FROM work_orders wo " +
            "JOIN vehicles v ON wo.vehicle_id = v.id " +
            "JOIN customers c ON v.customer_id = c.id " +
            "JOIN users adv ON wo.advisor_id = adv.id " +
            "LEFT JOIN workshop_bays b ON wo.bay_id = b.id " +
            "LEFT JOIN users tech ON wo.technician_id = tech.id " +
            "WHERE wo.id = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    WorkOrder wo = mapWorkOrder(rs);
                    wo.setItems(itemDAO.getByWorkOrderId(wo.getId()));
                    return wo;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public WorkOrder getByCode(String code) {
        String sql = 
            "SELECT wo.*, v.license_plate, v.model AS vehicle_model, " +
            "c.full_name AS customer_name, c.phone_number AS customer_phone, " +
            "adv.full_name AS advisor_name, " +
            "b.bay_name, tech.full_name AS technician_name " +
            "FROM work_orders wo " +
            "JOIN vehicles v ON wo.vehicle_id = v.id " +
            "JOIN customers c ON v.customer_id = c.id " +
            "JOIN users adv ON wo.advisor_id = adv.id " +
            "LEFT JOIN workshop_bays b ON wo.bay_id = b.id " +
            "LEFT JOIN users tech ON wo.technician_id = tech.id " +
            "WHERE wo.order_code = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, code);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    WorkOrder wo = mapWorkOrder(rs);
                    wo.setItems(itemDAO.getByWorkOrderId(wo.getId()));
                    return wo;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public int create(WorkOrder wo) {
        String sql = "INSERT INTO work_orders (order_code, vehicle_id, advisor_id, bay_id, technician_id, status, customer_symptoms, advisor_diagnosis, total_parts_amount, total_labor_amount, total_amount, is_quote_approved) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, wo.getOrderCode());
            ps.setInt(2, wo.getVehicleId());
            ps.setInt(3, wo.getAdvisorId());
            if (wo.getBayId() != null) ps.setInt(4, wo.getBayId()); else ps.setNull(4, Types.INTEGER);
            if (wo.getTechnicianId() != null) ps.setInt(5, wo.getTechnicianId()); else ps.setNull(5, Types.INTEGER);
            ps.setString(6, wo.getStatus());
            ps.setString(7, wo.getCustomerSymptoms());
            ps.setString(8, wo.getAdvisorDiagnosis());
            ps.setBigDecimal(9, wo.getTotalPartsAmount());
            ps.setBigDecimal(10, wo.getTotalLaborAmount());
            ps.setBigDecimal(11, wo.getTotalAmount());
            ps.setBoolean(12, wo.isQuoteApproved());
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

    public boolean updateStatus(int id, String newStatus) {
        String sql = "UPDATE work_orders SET status = ? WHERE id = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, newStatus);
            ps.setInt(2, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateBay(int id, Integer bayId) {
        String sql = "UPDATE work_orders SET bay_id = ? WHERE id = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            if (bayId != null) ps.setInt(1, bayId); else ps.setNull(1, Types.INTEGER);
            ps.setInt(2, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean assignTechnician(int id, Integer techId) {
        String sql = "UPDATE work_orders SET technician_id = ? WHERE id = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            if (techId != null) ps.setInt(1, techId); else ps.setNull(1, Types.INTEGER);
            ps.setInt(2, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean approveQuote(int id) {
        String sql = "UPDATE work_orders SET is_quote_approved = TRUE, status = 'WAITING_PARTS' WHERE id = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private WorkOrder mapWorkOrder(ResultSet rs) throws SQLException {
        WorkOrder wo = new WorkOrder();
        wo.setId(rs.getInt("id"));
        wo.setOrderCode(rs.getString("order_code"));
        wo.setVehicleId(rs.getInt("vehicle_id"));
        wo.setLicensePlate(rs.getString("license_plate"));
        wo.setVehicleModel(rs.getString("vehicle_model"));
        wo.setCustomerName(rs.getString("customer_name"));
        wo.setCustomerPhone(rs.getString("customer_phone"));
        wo.setAdvisorId(rs.getInt("advisor_id"));
        wo.setAdvisorName(rs.getString("advisor_name"));

        int bId = rs.getInt("bay_id");
        wo.setBayId(rs.wasNull() ? null : bId);
        wo.setBayName(rs.getString("bay_name"));

        int tId = rs.getInt("technician_id");
        wo.setTechnicianId(rs.wasNull() ? null : tId);
        wo.setTechnicianName(rs.getString("technician_name"));

        wo.setStatus(rs.getString("status"));
        wo.setCustomerSymptoms(rs.getString("customer_symptoms"));
        wo.setAdvisorDiagnosis(rs.getString("advisor_diagnosis"));
        wo.setTotalPartsAmount(rs.getBigDecimal("total_parts_amount"));
        wo.setTotalLaborAmount(rs.getBigDecimal("total_labor_amount"));
        wo.setTotalAmount(rs.getBigDecimal("total_amount"));
        wo.setQuoteApproved(rs.getBoolean("is_quote_approved"));
        wo.setCreatedAt(rs.getTimestamp("created_at"));
        return wo;
    }
}
