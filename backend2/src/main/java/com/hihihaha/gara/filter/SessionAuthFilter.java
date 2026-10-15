package com.hihihaha.gara.filter;

import com.hihihaha.gara.util.ResponseUtil;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;

/** Phụ trách phần mới: Lợi. Phiên và vai trò luôn lấy từ Tomcat, không từ tham số client. */
@WebFilter("/api/v1/*")
public class SessionAuthFilter implements Filter {
  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {
    HttpServletRequest req = (HttpServletRequest) request;
    HttpServletResponse resp = (HttpServletResponse) response;
    String path = req.getRequestURI().substring(req.getContextPath().length());
    if (path.equals("/api/v1/health")
        || path.equals("/api/v1/auth/staff-login")
        || path.equals("/api/v1/auth/request-otp")
        || path.equals("/api/v1/auth/verify-otp")) {
      chain.doFilter(request, response);
      return;
    }
    HttpSession session = req.getSession(false);
    if (session == null || session.getAttribute("role") == null) {
      ResponseUtil.sendError(resp, "Vui lòng đăng nhập", 401);
      return;
    }
    chain.doFilter(request, response);
  }
}
