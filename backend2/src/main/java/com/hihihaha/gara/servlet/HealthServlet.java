package com.hihihaha.gara.servlet;

import com.hihihaha.gara.config.DBContext;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.util.logging.Level;
import java.util.logging.Logger;

/** Phụ trách phần mới: Lợi. Xác nhận API Servlet và MySQL cùng sẵn sàng. */
@WebServlet("/api/v1/health")
public class HealthServlet extends ServletSupport {
    private static final Logger LOGGER = Logger.getLogger(HealthServlet.class.getName());
    @Override protected void doGet(HttpServletRequest req,HttpServletResponse resp) throws IOException {
        try(Connection c=DBContext.getConnection()) { if(c.isValid(2)) ok(resp,java.util.Map.of("backend","servlet","database","mysql")); else err(resp,503,"CSDL chưa sẵn sàng"); }
        catch(Exception e) { LOGGER.log(Level.WARNING, "Kiểm tra kết nối MySQL thất bại", e); err(resp,503,"CSDL chưa sẵn sàng"); }
    }
}
