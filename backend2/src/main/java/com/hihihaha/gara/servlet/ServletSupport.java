package com.hihihaha.gara.servlet;

import com.fasterxml.jackson.databind.JsonNode;
import com.hihihaha.gara.util.ResponseUtil;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.Map;

/** Phụ trách phần mới: Lợi. Tiện ích JSON và kiểm tra quyền dùng chung giữa bốn luồng. */
abstract class ServletSupport extends HttpServlet {
    @Override protected void service(HttpServletRequest req, HttpServletResponse resp) throws IOException, jakarta.servlet.ServletException {
        if ("PATCH".equals(req.getMethod())) doPatch(req, resp);
        else super.service(req, resp);
    }
    protected void doPatch(HttpServletRequest req, HttpServletResponse resp) throws IOException { err(resp,405,"Phương thức không được hỗ trợ"); }
    static JsonNode body(HttpServletRequest req) throws IOException { return ResponseUtil.getMapper().readTree(req.getInputStream()); }
    static String str(JsonNode n, String key) { return n != null && n.hasNonNull(key) ? n.get(key).asText().trim() : ""; }
    // Lợi: ID và số lượng phải là số nguyên JSON thật; tránh 1.5 bị ép thành 1.
    static long num(JsonNode n, String key) {
        if(n==null || !n.hasNonNull(key) || !n.get(key).isIntegralNumber() || !n.get(key).canConvertToLong()) return -1;
        return n.get(key).longValue();
    }
    static String role(HttpServletRequest req) { return String.valueOf(req.getSession(false).getAttribute("role")); }
    static long userId(HttpServletRequest req) { return ((Number) req.getSession(false).getAttribute("user_id")).longValue(); }
    static boolean allow(HttpServletRequest req, HttpServletResponse resp, String expected) throws IOException {
        if (expected.equals(role(req))) return true;
        ResponseUtil.sendError(resp, "Không có quyền thực hiện thao tác này", 403);
        return false;
    }
    static void ok(HttpServletResponse resp, Object data) throws IOException { ResponseUtil.sendSuccess(resp, data); }
    static void created(HttpServletResponse resp, Object data) throws IOException { ResponseUtil.sendSuccess(resp, data, "Đã tạo", 201); }
    static void err(HttpServletResponse resp, int code, String msg) throws IOException { ResponseUtil.sendError(resp, msg, code); }
    /** Khởi: ánh xạ một lệnh cho trang tiếp nhận, quản lý và khách hàng. */
    static Map<String,Object> orderRow(ResultSet rs) throws SQLException {
        Map<String,Object> row = new LinkedHashMap<>();
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
    static final String ORDER_SELECT = "SELECT w.id,w.order_code,w.status,w.symptoms,w.assigned_to,w.total_amount,v.license_plate,v.model AS vehicle_model,c.full_name AS customer_name,u.full_name AS technician_name,i.payment_status,(SELECT COALESCE(ROUND(AVG(task.progress_percent)),0) FROM work_order_items task WHERE task.work_order_id=w.id AND task.item_type='LABOR') AS progress_percent FROM work_orders w JOIN vehicles v ON v.id=w.vehicle_id JOIN customers c ON c.id=v.customer_id LEFT JOIN users u ON u.id=w.assigned_to JOIN invoices i ON i.work_order_id=w.id ";
}
