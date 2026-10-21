package com.hihihaha.gara.servlet;

import com.hihihaha.gara.dao.StaffDAO;
import com.hihihaha.gara.util.Validation;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.*;
import java.time.LocalDate;

/** Phụ trách phần mới: Khởi. Chỉ số hiệu suất dựa trên nhóm lệnh được giao trong khoảng ngày. */
@WebServlet("/api/v1/reports/technicians")
public class ReportServlet extends ServletSupport {
  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    if (!allow(req, resp, "MANAGER")) return;
    LocalDate from, to;
    try {
      from =
          req.getParameter("from") == null
              ? LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")).minusDays(30)
              : LocalDate.parse(req.getParameter("from"));
      to =
          req.getParameter("to") == null
              ? LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"))
              : LocalDate.parse(req.getParameter("to"));
      Validation.dates(from, to);
    } catch (Exception e) {
      err(req, resp, 400, "Khoảng ngày không hợp lệ");
      return;
    }
    try {
      ok(req, resp, new StaffDAO().report(from, to));
    } catch (SQLException e) {
      err(req, resp, 503, "Không đọc được báo cáo");
    }
  }
}
