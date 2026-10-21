package com.hihihaha.gara.servlet;

import com.fasterxml.jackson.databind.JsonNode;
import com.hihihaha.gara.util.ResponseUtil;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/** Phụ trách phần mới: Lợi. Tiện ích JSON và kiểm tra quyền dùng chung giữa bốn luồng. */
abstract class ServletSupport extends HttpServlet {
  @Override
  protected void service(HttpServletRequest req, HttpServletResponse resp)
      throws IOException, jakarta.servlet.ServletException {
    if (WebFlow.isForm(req) && "POST".equals(req.getMethod())) {
      synchronized (req.getSession()) {
        dispatch(req, resp);
      }
    } else dispatch(req, resp);
  }

  private void dispatch(HttpServletRequest req, HttpServletResponse resp)
      throws IOException, jakarta.servlet.ServletException {
    if ("PATCH".equals(req.getMethod())
        || (WebFlow.isForm(req)
            && "POST".equals(req.getMethod())
            && "PATCH".equals(req.getParameter("_method")))) doPatch(req, resp);
    else super.service(req, resp);
  }

  protected void doPatch(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    err(req, resp, 405, "Phương thức không được hỗ trợ");
  }

  static JsonNode body(HttpServletRequest req) throws IOException {
    return WebFlow.isForm(req)
        ? WebFlow.formBody(req)
        : ResponseUtil.getMapper().readTree(req.getInputStream());
  }

  static String str(JsonNode n, String key) {
    return n != null && n.hasNonNull(key) ? n.get(key).asText().trim() : "";
  }

  // Lợi: ID và số lượng phải là số nguyên JSON thật; tránh 1.5 bị ép thành 1.
  static long num(JsonNode n, String key) {
    if (n == null
        || !n.hasNonNull(key)
        || !n.get(key).isIntegralNumber()
        || !n.get(key).canConvertToLong()) return -1;
    return n.get(key).longValue();
  }

  static String role(HttpServletRequest req) {
    return String.valueOf(req.getSession(false).getAttribute("role"));
  }

  static long userId(HttpServletRequest req) {
    return ((Number) req.getSession(false).getAttribute("user_id")).longValue();
  }

  static boolean allow(HttpServletRequest req, HttpServletResponse resp, String expected)
      throws IOException {
    if (expected.equals(role(req))) return true;
    err(req, resp, 403, "Không có quyền thực hiện thao tác này");
    return false;
  }

  static void ok(HttpServletRequest req, HttpServletResponse resp, Object data) throws IOException {
    if (WebFlow.isForm(req)) WebFlow.success(req, resp, data);
    else ResponseUtil.sendSuccess(resp, data);
  }

  static void created(HttpServletRequest req, HttpServletResponse resp, Object data)
      throws IOException {
    if (WebFlow.isForm(req)) WebFlow.success(req, resp, data);
    else ResponseUtil.sendSuccess(resp, data, "Đã tạo", 201);
  }

  static void err(HttpServletRequest req, HttpServletResponse resp, int code, String msg)
      throws IOException {
    if (WebFlow.isForm(req)) WebFlow.error(req, resp, code, msg);
    else ResponseUtil.sendError(resp, msg, code);
  }
}
