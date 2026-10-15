package com.hihihaha.gara.servlet;

import com.fasterxml.jackson.databind.JsonNode;
import com.hihihaha.gara.config.DBContext;
import com.hihihaha.gara.dao.ServiceDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.*;
import java.util.*;

/** Phụ trách phần mới: Khởi. Tiếp nhận xe/lệnh, tính giá phía server và đọc lệnh theo quyền. */
@WebServlet("/api/v1/work-orders/*")
public class WorkOrderServlet extends ServletSupport {
    private final ServiceDAO services=new ServiceDAO();
    @Override protected void doGet(HttpServletRequest req,HttpServletResponse resp) throws IOException {
        String path=req.getPathInfo();
        if(path==null || path.equals("/") || path.equals("/my-orders")) {
            List<Map<String,Object>> rows=new ArrayList<>();
            String sql=ORDER_SELECT+" WHERE 1=1 ";
            if("CUSTOMER".equals(role(req))) sql+=" AND c.id=? AND v.license_plate=? ";
            if("TECHNICIAN".equals(role(req))) sql+=" AND (w.created_by=? OR w.assigned_to=?) ";
            sql+=" ORDER BY w.id DESC";
            try(Connection c=DBContext.getConnection(); PreparedStatement ps=c.prepareStatement(sql)) {
                if("CUSTOMER".equals(role(req))) { ps.setLong(1,userId(req)); ps.setString(2,String.valueOf(req.getSession(false).getAttribute("license_plate"))); }
                if("TECHNICIAN".equals(role(req))) { ps.setLong(1,userId(req)); ps.setLong(2,userId(req)); }
                try(ResultSet rs=ps.executeQuery()) { while(rs.next()) rows.add(orderRow(rs)); }
                ok(resp,rows);
            } catch(SQLException e) { err(resp,503,"Không đọc được danh sách lệnh"); }
            return;
        }
        String code=path.substring(1);
        if(code.contains("/")) { err(resp,404,"Endpoint không tồn tại"); return; }
        try(Connection c=DBContext.getConnection()) {
            Map<String,Object> row=find(c,code,req);
            if(row==null) { err(resp,404,"Không tìm thấy lệnh được phép xem"); return; }
            long orderId=(long)row.remove("internal_id");
            List<Map<String,Object>> items=new ArrayList<>();
            try(PreparedStatement ps=c.prepareStatement("SELECT id,part_id,service_id,item_type,item_name,quantity,unit_price,total_price,progress_percent FROM work_order_items WHERE work_order_id=? ORDER BY id")) {
                ps.setLong(1,orderId); try(ResultSet rs=ps.executeQuery()) { while(rs.next()) {
                    Map<String,Object> item=new LinkedHashMap<>(); item.put("id",rs.getLong("id")); item.put("part_id",rs.getObject("part_id")); item.put("service_id",rs.getObject("service_id")); item.put("item_type",rs.getString("item_type")); item.put("item_name",rs.getString("item_name")); item.put("quantity",rs.getInt("quantity")); item.put("unit_price",rs.getBigDecimal("unit_price")); item.put("total_price",rs.getBigDecimal("total_price")); item.put("progress_percent",rs.getInt("progress_percent")); items.add(item);
                }}
            }
            row.put("items",items); ok(resp,row);
        } catch(SQLException e) { err(resp,503,"Không đọc được lệnh"); }
    }
    private Map<String,Object> find(Connection c,String code,HttpServletRequest req) throws SQLException {
        String sql=ORDER_SELECT+" WHERE w.order_code=?";
        if("CUSTOMER".equals(role(req))) sql+=" AND c.id=? AND v.license_plate=?";
        if("TECHNICIAN".equals(role(req))) sql+=" AND (w.created_by=? OR w.assigned_to=?)";
        try(PreparedStatement ps=c.prepareStatement(sql)) {
            ps.setString(1,code);
            if("CUSTOMER".equals(role(req))) { ps.setLong(2,userId(req)); ps.setString(3,String.valueOf(req.getSession(false).getAttribute("license_plate"))); }
            if("TECHNICIAN".equals(role(req))) { ps.setLong(2,userId(req)); ps.setLong(3,userId(req)); }
            try(ResultSet rs=ps.executeQuery()) { if(!rs.next()) return null; Map<String,Object> row=orderRow(rs); row.put("internal_id",rs.getLong("id")); return row; }
        }
    }
    @Override protected void doPost(HttpServletRequest req,HttpServletResponse resp) throws IOException {
        if(req.getPathInfo()!=null && !req.getPathInfo().equals("/")) { err(resp,404,"Endpoint không tồn tại"); return; }
        if(!allow(req,resp,"TECHNICIAN")) return;
        JsonNode b; try { b=body(req); } catch(Exception e) { err(resp,400,"JSON không hợp lệ"); return; }
        String plate=str(b,"license_plate").replaceAll("\\s+","").toUpperCase(), phone=str(b,"customer_phone"), name=str(b,"customer_name"), email=str(b,"customer_email"), model=str(b,"vehicle_model");
        JsonNode requested=b==null?null:b.get("services");
        if(plate.isBlank()||phone.isBlank()||name.isBlank()||email.isBlank()||model.isBlank()||requested==null||!requested.isArray()||requested.isEmpty()) { err(resp,400,"Thiếu thông tin xe, khách hoặc dịch vụ"); return; }
        // Khởi: một xe chọn nhiều dịch vụ; cùng dịch vụ được gộp số lượng, không nhân đôi dòng giá công.
        Map<Long,Integer> requestedServices=new LinkedHashMap<>();
        try {
            for(JsonNode selection:requested) {
                long serviceId=num(selection,"service_id"), quantity=num(selection,"quantity");
                if(serviceId<=0 || quantity<=0 || quantity>1000 || requestedServices.getOrDefault(serviceId,0)+quantity>1000) throw new IllegalArgumentException("Dịch vụ hoặc số lượng không hợp lệ");
                requestedServices.merge(serviceId,(int)quantity,Integer::sum);
            }
        } catch(IllegalArgumentException e) { err(resp,400,e.getMessage()); return; }
        String code="WO-"+UUID.randomUUID().toString().substring(0,8).toUpperCase();
        try(Connection c=DBContext.getConnection()) {
            c.setAutoCommit(false);
            try {
                long customerId=customer(c,name,phone,email), vehicleId=vehicle(c,customerId,plate,model);
                long orderId;
                try(PreparedStatement ps=c.prepareStatement("INSERT INTO work_orders(order_code,vehicle_id,created_by,symptoms) VALUES(?,?,?,?)",Statement.RETURN_GENERATED_KEYS)) {
                    ps.setString(1,code); ps.setLong(2,vehicleId); ps.setLong(3,userId(req)); ps.setString(4,str(b,"symptoms")); ps.executeUpdate(); try(ResultSet rs=ps.getGeneratedKeys()) { rs.next(); orderId=rs.getLong(1); }
                }
                BigDecimal total=BigDecimal.ZERO;
                for(Map.Entry<Long,Integer> selection:requestedServices.entrySet()) {
                    long serviceId=selection.getKey(); int qty=selection.getValue();
                    Map<String,Object> service=services.byId(c,serviceId);
                    if(service==null) throw new IllegalArgumentException("Dịch vụ không tồn tại");
                    // Khởi/Tân: chụp giá công và vật tư từ MySQL cho từng dịch vụ; bỏ qua giá gửi từ client.
                    total=total.add(insertItem(c,orderId,null,serviceId,"LABOR",(String)service.get("service_name"),qty,(BigDecimal)service.get("labor_price")));
                    if(service.get("default_part_id")!=null) {
                        long partId=((Number)service.get("default_part_id")).longValue();
                        long partQty=(long)((Number)service.get("default_part_quantity")).intValue()*qty;
                        if(partQty>1000) throw new IllegalArgumentException("Định mức phụ tùng vượt giới hạn");
                        total=total.add(insertItem(c,orderId,partId,serviceId,"PART",(String)service.get("part_name"),(int)partQty,(BigDecimal)service.get("part_price")));
                    }
                }
                try(PreparedStatement ps=c.prepareStatement("UPDATE work_orders SET total_amount=? WHERE id=?")) { ps.setBigDecimal(1,total); ps.setLong(2,orderId); ps.executeUpdate(); }
                try(PreparedStatement ps=c.prepareStatement("INSERT INTO invoices(work_order_id,amount) VALUES(?,?)")) { ps.setLong(1,orderId); ps.setBigDecimal(2,total); ps.executeUpdate(); }
                c.commit(); created(resp,Map.of("order_code",code,"total_amount",total));
            } catch(Exception e) { c.rollback(); if(e instanceof IllegalArgumentException) err(resp,400,e.getMessage()); else if(e instanceof SQLException && "23000".equals(((SQLException)e).getSQLState())) err(resp,409,"Biển số hoặc khách hàng đã thuộc hồ sơ khác"); else err(resp,503,"Không tạo được lệnh"); }
        } catch(SQLException e) { err(resp,503,"Không kết nối được CSDL"); }
    }
    /** Khởi: lưu giá chụp tại thời điểm lập lệnh, để chỉnh giá niêm yết sau này không đổi hóa đơn cũ. */
    private BigDecimal insertItem(Connection c,long orderId,Long partId,Long serviceId,String type,String name,int qty,BigDecimal price) throws SQLException {
        BigDecimal line=price.multiply(BigDecimal.valueOf(qty));
        try(PreparedStatement ps=c.prepareStatement("INSERT INTO work_order_items(work_order_id,part_id,service_id,item_type,item_name,quantity,unit_price,total_price) VALUES(?,?,?,?,?,?,?,?)")) {
            ps.setLong(1,orderId); if(partId==null) ps.setNull(2,Types.BIGINT); else ps.setLong(2,partId);
            ps.setLong(3,serviceId); ps.setString(4,type); ps.setString(5,name); ps.setInt(6,qty); ps.setBigDecimal(7,price); ps.setBigDecimal(8,line); ps.executeUpdate();
        }
        return line;
    }
    private long customer(Connection c,String name,String phone,String email) throws SQLException {
        try(PreparedStatement ps=c.prepareStatement("SELECT id FROM customers WHERE phone_number=? FOR UPDATE")) { ps.setString(1,phone); try(ResultSet rs=ps.executeQuery()) { if(rs.next()) { long id=rs.getLong(1); try(PreparedStatement update=c.prepareStatement("UPDATE customers SET full_name=?,email=? WHERE id=?")) { update.setString(1,name); update.setString(2,email); update.setLong(3,id); update.executeUpdate(); } return id; } } }
        try(PreparedStatement ps=c.prepareStatement("INSERT INTO customers(full_name,phone_number,email) VALUES(?,?,?)",Statement.RETURN_GENERATED_KEYS)) { ps.setString(1,name); ps.setString(2,phone); ps.setString(3,email); ps.executeUpdate(); try(ResultSet rs=ps.getGeneratedKeys()) { rs.next(); return rs.getLong(1); } }
    }
    private long vehicle(Connection c,long customerId,String plate,String model) throws SQLException {
        try(PreparedStatement ps=c.prepareStatement("SELECT id,customer_id FROM vehicles WHERE license_plate=? FOR UPDATE")) { ps.setString(1,plate); try(ResultSet rs=ps.executeQuery()) { if(rs.next()) { if(rs.getLong("customer_id")!=customerId) throw new IllegalArgumentException("Biển số đã thuộc khách khác"); return rs.getLong("id"); } } }
        try(PreparedStatement ps=c.prepareStatement("INSERT INTO vehicles(customer_id,license_plate,model) VALUES(?,?,?)",Statement.RETURN_GENERATED_KEYS)) { ps.setLong(1,customerId); ps.setString(2,plate); ps.setString(3,model); ps.executeUpdate(); try(ResultSet rs=ps.getGeneratedKeys()) { rs.next(); return rs.getLong(1); } }
    }
}
