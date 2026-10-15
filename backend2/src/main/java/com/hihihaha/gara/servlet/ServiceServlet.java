package com.hihihaha.gara.servlet;

import com.fasterxml.jackson.databind.JsonNode;
import com.hihihaha.gara.dao.ServiceDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.SQLException;

/** Phụ trách phần mới: Tân. Quản lý niêm yết nhiều dịch vụ, có hoặc không có phụ tùng mặc định. */
@WebServlet("/api/v1/services/*")
public class ServiceServlet extends ServletSupport {
    private final ServiceDAO dao=new ServiceDAO();

    @Override protected void doGet(HttpServletRequest req,HttpServletResponse resp) throws IOException {
        if("CUSTOMER".equals(role(req))) { err(resp,403,"Không có quyền xem danh mục dịch vụ"); return; }
        if(req.getPathInfo()!=null && !"/".equals(req.getPathInfo())) { err(resp,404,"Endpoint không tồn tại"); return; }
        try { ok(resp,dao.all()); } catch(SQLException e) { err(resp,503,"Không đọc được dịch vụ"); }
    }
    @Override protected void doPost(HttpServletRequest req,HttpServletResponse resp) throws IOException {
        if(!allow(req,resp,"MANAGER")) return;
        if(req.getPathInfo()!=null && !"/".equals(req.getPathInfo())) { err(resp,404,"Endpoint không tồn tại"); return; }
        JsonNode body; try { body=body(req); } catch(Exception e) { err(resp,400,"JSON không hợp lệ"); return; }
        Values value=parse(body,resp); if(value==null) return;
        String code=str(body,"service_code"); if(code.isBlank()) { err(resp,400,"Thiếu mã dịch vụ"); return; }
        try { created(resp,dao.create(code,value.name,value.price,value.partId,value.partQty)); }
        catch(SQLException e) { err(resp,"23000".equals(e.getSQLState())?409:503,"Mã dịch vụ trùng hoặc phụ tùng không tồn tại"); }
    }
    @Override protected void doPatch(HttpServletRequest req,HttpServletResponse resp) throws IOException {
        if(!allow(req,resp,"MANAGER")) return;
        String path=req.getPathInfo(); if(path==null || !path.matches("/\\d+")) { err(resp,404,"Endpoint không tồn tại"); return; }
        long id; try { id=Long.parseLong(path.substring(1)); } catch(NumberFormatException e) { err(resp,400,"ID dịch vụ không hợp lệ"); return; }
        JsonNode body; try { body=body(req); } catch(Exception e) { err(resp,400,"JSON không hợp lệ"); return; }
        Values value=parse(body,resp); if(value==null) return;
        try { var service=dao.update(id,value.name,value.price,value.partId,value.partQty); if(service==null) err(resp,404,"Không thấy dịch vụ"); else ok(resp,service); }
        catch(SQLException e) { err(resp,"23000".equals(e.getSQLState())?400:503,"Không cập nhật được dịch vụ hoặc phụ tùng không tồn tại"); }
    }
    /** Tân: một dịch vụ có thể chỉ lấy tiền công; vật tư được chọn từ kho nếu cần. */
    private Values parse(JsonNode body,HttpServletResponse resp) throws IOException {
        String name=str(body,"service_name"); BigDecimal price; long qty=num(body,"default_part_quantity");
        Long partId=null;
        try { price=new BigDecimal(str(body,"labor_price")); } catch(Exception e) { err(resp,400,"Giá công không hợp lệ"); return null; }
        if(body!=null && body.hasNonNull("default_part_id")) { long id=num(body,"default_part_id"); if(id<=0) { err(resp,400,"Phụ tùng không hợp lệ"); return null; } partId=id; }
        if(name.isBlank()||price.signum()<0||qty<=0||qty>1000) { err(resp,400,"Tên, giá công hoặc định mức phụ tùng không hợp lệ"); return null; }
        return new Values(name,price,partId,(int)qty);
    }
    private record Values(String name,BigDecimal price,Long partId,int partQty) { }
}
