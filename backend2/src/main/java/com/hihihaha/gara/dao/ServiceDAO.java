package com.hihihaha.gara.dao;

import com.hihihaha.gara.config.DBContext;
import java.math.BigDecimal;
import java.sql.*;
import java.util.*;

/** Phụ trách phần mới: Tân. Danh mục dịch vụ độc lập với kho; một dịch vụ có thể không dùng vật tư. */
public class ServiceDAO {
    private static final String SELECT = "SELECT s.id,s.service_code,s.service_name,s.labor_price,s.default_part_id,s.default_part_quantity,p.part_name,p.price AS part_price,p.stock_quantity FROM services s LEFT JOIN parts p ON p.id=s.default_part_id";

    public List<Map<String,Object>> all() throws SQLException {
        List<Map<String,Object>> rows=new ArrayList<>();
        try(Connection c=DBContext.getConnection(); PreparedStatement ps=c.prepareStatement(SELECT+" ORDER BY s.service_code"); ResultSet rs=ps.executeQuery()) {
            while(rs.next()) rows.add(row(rs));
        }
        return rows;
    }
    public Map<String,Object> byId(Connection c,long id) throws SQLException {
        try(PreparedStatement ps=c.prepareStatement(SELECT+" WHERE s.id=?")) {
            ps.setLong(1,id); try(ResultSet rs=ps.executeQuery()) { return rs.next()?row(rs):null; }
        }
    }
    public Map<String,Object> create(String code,String name,BigDecimal laborPrice,Long partId,int partQty) throws SQLException {
        try(Connection c=DBContext.getConnection(); PreparedStatement ps=c.prepareStatement("INSERT INTO services(service_code,service_name,labor_price,default_part_id,default_part_quantity) VALUES(?,?,?,?,?)",Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1,code); ps.setString(2,name); ps.setBigDecimal(3,laborPrice); setPartId(ps,4,partId); ps.setInt(5,partQty); ps.executeUpdate();
            try(ResultSet rs=ps.getGeneratedKeys()) { rs.next(); return byId(c,rs.getLong(1)); }
        }
    }
    public Map<String,Object> update(long id,String name,BigDecimal laborPrice,Long partId,int partQty) throws SQLException {
        try(Connection c=DBContext.getConnection(); PreparedStatement ps=c.prepareStatement("UPDATE services SET service_name=?,labor_price=?,default_part_id=?,default_part_quantity=? WHERE id=?")) {
            ps.setString(1,name); ps.setBigDecimal(2,laborPrice); setPartId(ps,3,partId); ps.setInt(4,partQty); ps.setLong(5,id);
            ps.executeUpdate();
            return byId(c,id);
        }
    }
    private void setPartId(PreparedStatement ps,int index,Long partId) throws SQLException {
        if(partId==null) ps.setNull(index,Types.BIGINT); else ps.setLong(index,partId);
    }
    private Map<String,Object> row(ResultSet rs) throws SQLException {
        Map<String,Object> row=new LinkedHashMap<>();
        row.put("id",rs.getLong("id")); row.put("service_code",rs.getString("service_code")); row.put("service_name",rs.getString("service_name"));
        row.put("labor_price",rs.getBigDecimal("labor_price")); row.put("default_part_id",rs.getObject("default_part_id")); row.put("default_part_quantity",rs.getInt("default_part_quantity"));
        row.put("part_name",rs.getString("part_name")); row.put("part_price",rs.getBigDecimal("part_price")); row.put("stock_quantity",rs.getObject("stock_quantity"));
        return row;
    }
}
