package com.hihihaha.gara.servlet;

import com.fasterxml.jackson.databind.JsonNode;
import com.hihihaha.gara.config.DBContext;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.*;
import java.util.Map;

/** Phụ trách phần mới: Lợi. Khách chỉ báo đã chuyển khoản; quản lý mới xác nhận PAID. */
@WebServlet("/api/v1/payments/*")
public class PaymentServlet extends ServletSupport {
    @Override protected void doPost(HttpServletRequest req,HttpServletResponse resp) throws IOException {
        String path=req.getPathInfo(); boolean report="/report".equals(path), verify="/verify".equals(path);
        if(!report&&!verify) { err(resp,404,"Endpoint không tồn tại"); return; }
        if(!allow(req,resp,report?"CUSTOMER":"MANAGER")) return;
        JsonNode b; try { b=body(req); } catch(Exception e) { err(resp,400,"JSON không hợp lệ"); return; }
        String code=str(b,"order_code"); if(code.isBlank()) { err(resp,400,"Thiếu mã lệnh"); return; }
        try(Connection c=DBContext.getConnection()) {
            c.setAutoCommit(false);
            try {
                String sql="SELECT w.id,w.status,i.payment_status FROM work_orders w JOIN invoices i ON i.work_order_id=w.id JOIN vehicles v ON v.id=w.vehicle_id WHERE w.order_code=?"+(report?" AND v.customer_id=? AND v.license_plate=?":"")+" FOR UPDATE";
                long id; String status,payment;
                try(PreparedStatement ps=c.prepareStatement(sql)) {
                    ps.setString(1,code); if(report) { ps.setLong(2,userId(req)); ps.setString(3,String.valueOf(req.getSession(false).getAttribute("license_plate"))); }
                    try(ResultSet rs=ps.executeQuery()) { if(!rs.next()) { c.rollback(); err(resp,404,"Không tìm thấy lệnh được phép thanh toán"); return; } id=rs.getLong("id"); status=rs.getString("status"); payment=rs.getString("payment_status"); }
                }
                if(report && (!"WAITING_PAYMENT".equals(status)||!"UNPAID".equals(payment)) || verify && (!"WAITING_PAYMENT".equals(status)||!"PENDING_VERIFICATION".equals(payment))) { c.rollback(); err(resp,409,"Lệnh chưa ở trạng thái thanh toán phù hợp"); return; }
                String update=report?"UPDATE invoices SET payment_status='PENDING_VERIFICATION',reported_at=CURRENT_TIMESTAMP WHERE work_order_id=?":"UPDATE invoices SET payment_status='PAID',paid_at=CURRENT_TIMESTAMP WHERE work_order_id=?";
                try(PreparedStatement ps=c.prepareStatement(update)) { ps.setLong(1,id); ps.executeUpdate(); }
                if(verify) try(PreparedStatement ps=c.prepareStatement("UPDATE work_orders SET status='COMPLETED' WHERE id=?")) { ps.setLong(1,id); ps.executeUpdate(); }
                c.commit(); ok(resp,Map.of("order_code",code,"payment_status",report?"PENDING_VERIFICATION":"PAID"));
            } catch(SQLException e) { c.rollback(); err(resp,503,"Không lưu được thanh toán"); }
        } catch(SQLException e) { err(resp,503,"Không kết nối được CSDL"); }
    }
}
