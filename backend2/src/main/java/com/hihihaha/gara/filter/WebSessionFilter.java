package com.hihihaha.gara.filter;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.*;

/** Session, mã chống gửi form từ website khác và quyền vào từng màn hình JSP. */
@WebFilter("/*")
public class WebSessionFilter implements Filter {
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {
    HttpServletRequest req = (HttpServletRequest) request;
    HttpServletResponse resp = (HttpServletResponse) response;
    req.setCharacterEncoding("UTF-8");
    resp.setCharacterEncoding("UTF-8");
    String path = req.getServletPath() + (req.getPathInfo() == null ? "" : req.getPathInfo());
    if (path.startsWith("/api/") || path.startsWith("/assets/")) {
      chain.doFilter(req, resp);
      return;
    }
    HttpSession session = req.getSession();
    if (session.getAttribute("csrf") == null)
      session.setAttribute("csrf", UUID.randomUUID().toString());
    resp.setHeader("Cache-Control", "no-store");
    boolean publicPage =
        path.equals("/")
            || path.equals("/home")
            || path.startsWith("/login/")
            || Set.of(
                    "/actions/auth/staff-login",
                    "/actions/auth/request-otp",
                    "/actions/auth/verify-otp")
                .contains(path);
    String role = (String) session.getAttribute("role");
    if (!publicPage && role == null) {
      resp.sendRedirect(req.getContextPath() + "/login/staff");
      return;
    }
    if (Set.of("POST", "PATCH", "PUT", "DELETE").contains(req.getMethod())
        && !Objects.equals(session.getAttribute("csrf"), req.getParameter("csrf"))) {
      if (!"POST".equals(req.getMethod())) {
        resp.sendError(403);
        return;
      }
      resp.setStatus(403);
      req.setAttribute("error", "Phiên gửi biểu mẫu đã hết hạn. Mở lại trang rồi thử lại.");
      req.getRequestDispatcher("/WEB-INF/views/error.jsp").forward(req, resp);
      return;
    }
    if (!Set.of("GET", "HEAD", "POST").contains(req.getMethod())) {
      resp.sendError(405);
      return;
    }
    boolean forbidden =
        (Set.of("/inventory", "/services", "/reports").contains(path) && !"MANAGER".equals(role))
            || (path.startsWith("/orders/new") || path.startsWith("/orders/review"))
                && !"TECHNICIAN".equals(role);
    if (forbidden) {
      resp.setStatus(403);
      req.setAttribute("error", "Tài khoản của bạn không được phép mở trang này.");
      req.getRequestDispatcher("/WEB-INF/views/error.jsp").forward(req, resp);
      return;
    }
    chain.doFilter(req, resp);
  }
}
