package com.hihihaha.gara.servlet;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.hihihaha.gara.util.ResponseUtil;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

/** Chuyển form HTML thành dữ liệu cho controller; nghiệp vụ vẫn dùng chung với API cũ. */
final class WebFlow {
  static boolean isForm(HttpServletRequest req) {
    return req.getServletPath().startsWith("/actions/");
  }

  static JsonNode formBody(HttpServletRequest req) throws IOException {
    if (req.getServletPath().equals("/actions/orders")) {
      Object draft = req.getSession().getAttribute("orderDraft");
      if (!(draft instanceof JsonNode)
          || !Objects.equals(
              req.getParameter("draftToken"), req.getSession().getAttribute("draftToken")))
        throw new IOException("Phiếu nháp đã hết hạn");
      return (JsonNode) draft;
    }
    ObjectNode body = ResponseUtil.getMapper().createObjectNode();
    Set<String> integers =
        Set.of(
            "technician_id",
            "progress_percent",
            "stock_quantity",
            "expected_stock",
            "default_part_id",
            "default_part_quantity");
    req.getParameterMap()
        .forEach(
            (key, values) -> {
              String value = "password".equals(key) ? values[0] : values[0].trim();
              if (integers.contains(key)) {
                if (key.equals("default_part_id") && value.isEmpty()) body.putNull(key);
                else
                  try {
                    body.put(key, Long.parseLong(value));
                  } catch (NumberFormatException e) {
                    body.put(key, value);
                  }
              } else body.put(key, value);
            });
    return body;
  }

  static boolean quoteMatches(HttpServletRequest req, Map<String, Object> service) {
    Object saved = req.getSession().getAttribute("draftLines");
    if (!(saved instanceof List<?>)) return false;
    for (Object entry : (List<?>) saved) {
      if (!(entry instanceof Map<?, ?> line) || !Objects.equals(line.get("id"), service.get("id")))
        continue;
      for (String field :
          List.of(
              "service_name",
              "labor_price",
              "default_part_id",
              "default_part_quantity",
              "part_name",
              "part_price")) {
        if (!Objects.equals(line.get(field), service.get(field))) return false;
      }
      return true;
    }
    return false;
  }

  static void success(HttpServletRequest req, HttpServletResponse resp, Object data)
      throws IOException {
    String path = req.getServletPath();
    Map<?, ?> result = data instanceof Map ? (Map<?, ?>) data : Map.of();
    HttpSession session = req.getSession();
    String target = "/orders";
    String message = "Đã lưu thay đổi.";
    if (path.equals("/actions/auth")) {
      String action = req.getPathInfo();
      if ("/logout".equals(action)) {
        target = "/home";
        message = "Đã đăng xuất.";
      } else if ("/request-otp".equals(action)) {
        session.setAttribute("otpPhone", req.getParameter("phone_number"));
        session.setAttribute("otpPlate", req.getParameter("license_plate"));
        session.setAttribute("maskedEmail", result.get("masked_email"));
        session.setAttribute("otpPreview", result.get("otp_preview"));
        message = "Nhập mã xác minh được gửi đến email của bạn.";
        target = "/login/customer?step=verify";
      } else {
        session.removeAttribute("otpPhone");
        session.removeAttribute("otpPlate");
        session.removeAttribute("otpPreview");
        session.removeAttribute("maskedEmail");
        message = "Đăng nhập thành công.";
      }
    } else if (path.equals("/actions/inventory")) target = "/inventory";
    else if (path.equals("/actions/services")) target = "/services";
    else if (result.get("order_code") != null) {
      target =
          "/orders/detail?code="
              + URLEncoder.encode(result.get("order_code").toString(), StandardCharsets.UTF_8);
      if (path.equals("/actions/orders")) {
        session.removeAttribute("orderDraft");
        session.removeAttribute("draftLines");
        session.removeAttribute("draftForm");
        session.removeAttribute("draftToken");
        session.removeAttribute("draftTotal");
        message = "Đã tiếp nhận xe. Phiếu đã được chuyển đến quản lý để phân công.";
      } else if (path.equals("/actions/payments")) {
        message =
            "/report".equals(req.getPathInfo())
                ? "Đã báo chuyển khoản. Vui lòng chờ gara đối soát."
                : "Đã xác nhận nhận tiền và hoàn tất lệnh. Có thể bàn giao xe cho khách.";
      }
    }
    session.setAttribute("flash", message);
    resp.setStatus(303);
    resp.setHeader("Location", req.getContextPath() + target);
  }

  static void error(HttpServletRequest req, HttpServletResponse resp, int status, String message)
      throws IOException {
    req.setAttribute("error", message);
    String backPath = "/orders";
    switch (req.getServletPath()) {
      case "/actions/orders":
        backPath = "/orders/new";
        break;
      case "/actions/inventory":
        backPath = "/inventory";
        break;
      case "/actions/services":
        backPath = "/services";
        break;
      case "/actions/progress":
      case "/actions/assignments":
        if (req.getPathInfo() != null && req.getPathInfo().split("/").length > 1)
          backPath =
              "/orders/detail?code="
                  + URLEncoder.encode(req.getPathInfo().split("/")[1], StandardCharsets.UTF_8);
        break;
      case "/actions/payments":
        backPath =
            "/orders/detail?code="
                + URLEncoder.encode(
                    Objects.toString(req.getParameter("order_code"), ""), StandardCharsets.UTF_8);
        break;
      default:
        break;
    }
    req.setAttribute("backPath", backPath);
    resp.setStatus(status);
    try {
      String view = "error";
      if ("/actions/auth".equals(req.getServletPath())) {
        if ("/staff-login".equals(req.getPathInfo())) view = "staff-login";
        if ("/request-otp".equals(req.getPathInfo()) || "/verify-otp".equals(req.getPathInfo()))
          view = "customer-login";
      }
      req.getRequestDispatcher("/WEB-INF/views/" + view + ".jsp").forward(req, resp);
    } catch (ServletException e) {
      throw new IOException(e);
    }
  }
}
