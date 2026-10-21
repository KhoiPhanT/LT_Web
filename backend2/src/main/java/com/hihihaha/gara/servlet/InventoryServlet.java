package com.hihihaha.gara.servlet;

import com.fasterxml.jackson.databind.JsonNode;
import com.hihihaha.gara.dao.InventoryDAO;
import com.hihihaha.gara.util.Validation;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.SQLException;

/** Phụ trách phần mới: Tân. Quản lý danh mục và tồn kho phụ tùng dùng cho dịch vụ. */
@WebServlet({"/api/v1/inventory/*", "/actions/inventory/*"})
public class InventoryServlet extends ServletSupport {
  private final InventoryDAO dao = new InventoryDAO();

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    if ("CUSTOMER".equals(role(req))) {
      err(req, resp, 403, "Không có quyền xem kho");
      return;
    }
    try {
      ok(req, resp, dao.all());
    } catch (SQLException e) {
      err(req, resp, 503, "Không đọc được kho");
    }
  }

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    if (!allow(req, resp, "MANAGER")) return;
    JsonNode b;
    try {
      b = body(req);
    } catch (Exception e) {
      err(req, resp, 400, "JSON không hợp lệ");
      return;
    }
    String code = str(b, "part_code"), name = str(b, "part_name"), unit = str(b, "unit");
    BigDecimal price;
    int stock;
    try {
      Validation.text(code, "Mã phụ tùng", 50);
      Validation.text(name, "Tên phụ tùng", 150);
      Validation.text(unit, "Đơn vị", 30);
      price = Validation.money(str(b, "price"), "Đơn giá");
      stock = Math.toIntExact(num(b, "stock_quantity"));
    } catch (Exception e) {
      err(req, resp, 400, "Giá hoặc số lượng không hợp lệ");
      return;
    }
    if (code.isBlank() || name.isBlank() || unit.isBlank() || price.signum() < 0 || stock < 0) {
      err(req, resp, 400, "Thiếu thông tin hoặc số âm");
      return;
    }
    try {
      created(req, resp, dao.create(code, name, unit, price, stock));
    } catch (SQLException e) {
      err(
          req,
          resp,
          "23000".equals(e.getSQLState()) ? 409 : 503,
          "Không thêm được phụ tùng hoặc trùng mã");
    }
  }

  @Override
  protected void doPatch(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    if (!allow(req, resp, "MANAGER")) return;
    String path = req.getPathInfo();
    if (path == null || !path.matches("/\\d+/stock")) {
      err(req, resp, 404, "Endpoint không tồn tại");
      return;
    }
    JsonNode b;
    try {
      b = body(req);
    } catch (Exception e) {
      err(req, resp, 400, "JSON không hợp lệ");
      return;
    }
    long id;
    try {
      id = Long.parseLong(path.split("/")[1]);
    } catch (NumberFormatException e) {
      err(req, resp, 400, "ID phụ tùng không hợp lệ");
      return;
    }
    long n = num(b, "stock_quantity"), expected = num(b, "expected_stock");
    if (n < 0 || n > Integer.MAX_VALUE || expected < 0 || expected > Integer.MAX_VALUE) {
      err(
          req,
          resp,
          400,
          "Tồn kho và tồn lúc mở trang (expected_stock) phải là số nguyên không âm");
      return;
    }
    try {
      var p = dao.setStock(id, (int) n, (int) expected);
      if (p == null) err(req, resp, 404, "Không thấy phụ tùng");
      else ok(req, resp, p);
    } catch (SQLException e) {
      err(
          req,
          resp,
          "45000".equals(e.getSQLState()) ? 409 : 503,
          "45000".equals(e.getSQLState()) ? e.getMessage() : "Không cập nhật được kho");
    }
  }
}
