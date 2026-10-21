package com.hihihaha.gara.servlet;

import com.fasterxml.jackson.databind.JsonNode;
import com.hihihaha.gara.dao.ServiceDAO;
import com.hihihaha.gara.util.Validation;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.SQLException;

/** Phụ trách phần mới: Tân. Quản lý niêm yết nhiều dịch vụ, có hoặc không có phụ tùng mặc định. */
@WebServlet({"/api/v1/services/*", "/actions/services/*"})
public class ServiceServlet extends ServletSupport {
  private final ServiceDAO dao = new ServiceDAO();

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    if ("CUSTOMER".equals(role(req))) {
      err(req, resp, 403, "Không có quyền xem danh mục dịch vụ");
      return;
    }
    if (req.getPathInfo() != null && !"/".equals(req.getPathInfo())) {
      err(req, resp, 404, "Endpoint không tồn tại");
      return;
    }
    try {
      ok(req, resp, dao.all());
    } catch (SQLException e) {
      err(req, resp, 503, "Không đọc được dịch vụ");
    }
  }

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    if (!allow(req, resp, "MANAGER")) return;
    if (req.getPathInfo() != null && !"/".equals(req.getPathInfo())) {
      err(req, resp, 404, "Endpoint không tồn tại");
      return;
    }
    JsonNode body;
    try {
      body = body(req);
    } catch (Exception e) {
      err(req, resp, 400, "JSON không hợp lệ");
      return;
    }
    Values value = parse(req, body, resp);
    if (value == null) return;
    String code = str(body, "service_code");
    try {
      Validation.text(code, "Mã dịch vụ", 60);
    } catch (IllegalArgumentException e) {
      err(req, resp, 400, e.getMessage());
      return;
    }
    try {
      created(req, resp, dao.create(code, value.name, value.price, value.partId, value.partQty));
    } catch (SQLException e) {
      err(
          req,
          resp,
          "23000".equals(e.getSQLState()) ? 409 : 503,
          "Mã dịch vụ trùng hoặc phụ tùng không tồn tại");
    }
  }

  @Override
  protected void doPatch(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    if (!allow(req, resp, "MANAGER")) return;
    String path = req.getPathInfo();
    if (path == null || !path.matches("/\\d+")) {
      err(req, resp, 404, "Endpoint không tồn tại");
      return;
    }
    long id;
    try {
      id = Long.parseLong(path.substring(1));
    } catch (NumberFormatException e) {
      err(req, resp, 400, "ID dịch vụ không hợp lệ");
      return;
    }
    JsonNode body;
    try {
      body = body(req);
    } catch (Exception e) {
      err(req, resp, 400, "JSON không hợp lệ");
      return;
    }
    Values value = parse(req, body, resp);
    if (value == null) return;
    try {
      var service = dao.update(id, value.name, value.price, value.partId, value.partQty);
      if (service == null) err(req, resp, 404, "Không thấy dịch vụ");
      else ok(req, resp, service);
    } catch (SQLException e) {
      err(
          req,
          resp,
          "23000".equals(e.getSQLState()) ? 400 : 503,
          "Không cập nhật được dịch vụ hoặc phụ tùng không tồn tại");
    }
  }

  /** Tân: một dịch vụ có thể chỉ lấy tiền công; vật tư được chọn từ kho nếu cần. */
  private Values parse(HttpServletRequest req, JsonNode body, HttpServletResponse resp)
      throws IOException {
    String name = str(body, "service_name");
    BigDecimal price;
    long qty = num(body, "default_part_quantity");
    Long partId = null;
    try {
      Validation.text(name, "Tên dịch vụ", 150);
      price = Validation.money(str(body, "labor_price"), "Giá công");
    } catch (Exception e) {
      err(req, resp, 400, e.getMessage());
      return null;
    }
    if (body != null && body.hasNonNull("default_part_id")) {
      long id = num(body, "default_part_id");
      if (id <= 0) {
        err(req, resp, 400, "Phụ tùng không hợp lệ");
        return null;
      }
      partId = id;
    }
    if (name.isBlank() || price.signum() < 0 || qty <= 0 || qty > 1000) {
      err(req, resp, 400, "Tên, giá công hoặc định mức phụ tùng không hợp lệ");
      return null;
    }
    return new Values(name, price, partId, (int) qty);
  }

  private record Values(String name, BigDecimal price, Long partId, int partQty) {}
}
