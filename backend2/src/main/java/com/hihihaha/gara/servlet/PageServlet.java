package com.hihihaha.gara.servlet;

import com.fasterxml.jackson.databind.node.*;
import com.hihihaha.gara.dao.*;
import com.hihihaha.gara.util.ResponseUtil;
import com.hihihaha.gara.util.Validation;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.*;
import java.time.LocalDate;
import java.util.*;

/** GET chuẩn bị dữ liệu rồi forward JSP. POST /orders/review chỉ lưu bản nháp, chưa ghi lệnh. */
@WebServlet({
  "",
  "/home",
  "/login/staff",
  "/login/customer",
  "/orders",
  "/orders/new",
  "/orders/review",
  "/orders/detail",
  "/inventory",
  "/services",
  "/reports"
})
public class PageServlet extends HttpServlet {
  private final OrderDAO orders = new OrderDAO();
  private final ServiceDAO services = new ServiceDAO();
  private final InventoryDAO inventory = new InventoryDAO();

  protected void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws IOException, ServletException {
    String path = req.getServletPath();
    String page = "home";
    try {
      switch (path) {
        case "/login/staff":
          page = "staff-login";
          break;
        case "/login/customer":
          page = "customer-login";
          break;
        case "/orders":
          {
            page = "orders";
            var list = orders.list(role(req), id(req), plate(req));
            String queue = Objects.toString(req.getParameter("queue"), "active");
            String search =
                Objects.toString(req.getParameter("q"), "").trim().toLowerCase(Locale.ROOT);
            list.removeIf(
                o ->
                    !matches(o, queue)
                        || !(o.get("order_code")
                                + " "
                                + o.get("license_plate")
                                + " "
                                + o.get("customer_name"))
                            .toLowerCase(Locale.ROOT)
                            .contains(search));
            req.setAttribute("orders", list);
            req.setAttribute("queue", queue);
            break;
          }
        case "/orders/new":
          page = "intake";
          req.setAttribute("services", services.all());
          break;
        case "/orders/review":
          if (req.getSession().getAttribute("orderDraft") == null) {
            resp.sendRedirect(req.getContextPath() + "/orders/new");
            return;
          }
          page = "review";
          break;
        case "/orders/detail":
          {
            page = "detail";
            var order = orders.detail(req.getParameter("code"), role(req), id(req), plate(req));
            if (order == null) {
              WebFlow.error(req, resp, 404, "Không tìm thấy phiếu được phép xem.");
              return;
            }
            req.setAttribute("order", order);
            if ("MANAGER".equals(role(req)))
              req.setAttribute("technicians", new StaffDAO().technicians());
            break;
          }
        case "/inventory":
          page = "inventory";
          req.setAttribute("parts", inventory.all());
          break;
        case "/services":
          page = "services";
          req.setAttribute("services", services.all());
          req.setAttribute("parts", inventory.all());
          break;
        case "/reports":
          page = "reports";
          report(req);
          break;
        default:
          break;
      }
      req.getRequestDispatcher("/WEB-INF/views/" + page + ".jsp").forward(req, resp);
    } catch (IllegalArgumentException e) {
      WebFlow.error(req, resp, 400, e.getMessage());
    } catch (SQLException e) {
      getServletContext().log("Không tải được trang " + path, e);
      WebFlow.error(req, resp, 503, "Chưa kết nối được dữ liệu. Kiểm tra MySQL rồi tải lại trang.");
    }
  }

  protected void doPost(HttpServletRequest req, HttpServletResponse resp)
      throws IOException, ServletException {
    if (!"/orders/review".equals(req.getServletPath())) {
      resp.sendError(405);
      return;
    }
    synchronized (req.getSession()) {
      review(req, resp);
    }
  }

  private void review(HttpServletRequest req, HttpServletResponse resp)
      throws IOException, ServletException {
    try {
      ObjectNode draft = ResponseUtil.getMapper().createObjectNode();
      for (String field :
          List.of(
              "customer_name",
              "customer_phone",
              "customer_email",
              "license_plate",
              "vehicle_model",
              "symptoms")) {
        String value = Objects.toString(req.getParameter(field), "").trim();
        if (!field.equals("symptoms") && value.isBlank())
          throw new IllegalArgumentException("Điền đủ thông tin khách và xe trước khi xem lại.");
        draft.put(field, value);
      }
      Validation.intake(
          draft.get("customer_name").asText(),
          draft.get("customer_phone").asText(),
          draft.get("customer_email").asText(),
          draft.get("license_plate").asText(),
          draft.get("vehicle_model").asText(),
          draft.get("symptoms").asText());
      ArrayNode selections = draft.putArray("services");
      List<Map<String, Object>> lines = new ArrayList<>();
      BigDecimal total = BigDecimal.ZERO;
      for (var service : services.all()) {
        String key = service.get("id").toString();
        if (req.getParameter("choose_" + key) == null) continue;
        int qty;
        try {
          qty = Integer.parseInt(req.getParameter("quantity_" + key));
        } catch (Exception e) {
          throw new IllegalArgumentException("Số lượng dịch vụ phải là số nguyên.");
        }
        if (qty < 1 || qty > 1000)
          throw new IllegalArgumentException("Số lượng dịch vụ từ 1 đến 1000.");
        selections
            .addObject()
            .put("service_id", ((Number) service.get("id")).longValue())
            .put("quantity", qty);
        BigDecimal unit = (BigDecimal) service.get("labor_price");
        if (service.get("part_price") != null)
          unit =
              unit.add(
                  ((BigDecimal) service.get("part_price"))
                      .multiply(new BigDecimal(service.get("default_part_quantity").toString())));
        BigDecimal amount =
            Validation.moneyRange(unit.multiply(BigDecimal.valueOf(qty)), "Thành tiền dịch vụ");
        Map<String, Object> line = new LinkedHashMap<>(service);
        line.put("quantity", qty);
        line.put("amount", amount);
        lines.add(line);
        total = Validation.moneyRange(total.add(amount), "Tổng phiếu");
      }
      if (lines.isEmpty())
        throw new IllegalArgumentException("Chọn ít nhất một dịch vụ đã trao đổi với khách.");
      HttpSession session = req.getSession();
      session.setAttribute("draftToken", UUID.randomUUID().toString());
      session.setAttribute("orderDraft", draft);
      session.setAttribute("draftForm", ResponseUtil.getMapper().convertValue(draft, Map.class));
      session.setAttribute("draftLines", lines);
      session.setAttribute("draftTotal", total);
      resp.setStatus(303);
      resp.setHeader("Location", req.getContextPath() + "/orders/review");
    } catch (IllegalArgumentException e) {
      resp.setStatus(400);
      req.setAttribute("error", e.getMessage());
      try {
        req.setAttribute("services", services.all());
        req.getRequestDispatcher("/WEB-INF/views/intake.jsp").forward(req, resp);
      } catch (SQLException ex) {
        WebFlow.error(req, resp, 503, "Không đọc được dịch vụ.");
      }
    } catch (SQLException e) {
      WebFlow.error(req, resp, 503, "Không đọc được dịch vụ.");
    }
  }

  private boolean matches(Map<String, Object> o, String queue) {
    String status = o.get("current_status").toString();
    return switch (queue) {
      case "all" -> true;
      case "assign" -> status.equals("RECEIVED");
      case "repair" -> status.equals("IN_PROGRESS") || status.equals("RECEIVED");
      case "payment" -> status.equals("WAITING_PAYMENT");
      case "done" -> status.equals("COMPLETED");
      default -> !status.equals("COMPLETED");
    };
  }

  private void report(HttpServletRequest req) throws SQLException {
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
      throw new IllegalArgumentException("Ngày kết thúc cần bằng hoặc sau ngày bắt đầu.");
    }
    req.setAttribute("from", from);
    req.setAttribute("to", to);
    req.setAttribute("rows", new StaffDAO().report(from, to));
  }

  private String role(HttpServletRequest req) {
    return (String) req.getSession().getAttribute("role");
  }

  private long id(HttpServletRequest req) {
    return ((Number) req.getSession().getAttribute("user_id")).longValue();
  }

  private String plate(HttpServletRequest req) {
    return Objects.toString(req.getSession().getAttribute("license_plate"), "");
  }
}
