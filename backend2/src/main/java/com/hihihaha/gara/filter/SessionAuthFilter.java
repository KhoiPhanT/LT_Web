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
    resp.setHeader("Cache-Control", "no-store");
    String path = req.getServletPath() + (req.getPathInfo() == null ? "" : req.getPathInfo());
    // JSON API không nhận body text/plain/form do website khác tự gửi bằng form HTML.
    if (!java.util.Set.of("GET", "HEAD", "OPTIONS").contains(req.getMethod())
        && (req.getContentType() == null
            || !req.getContentType()
                .split(";", 2)[0]
                .trim()
                .equalsIgnoreCase("application/json"))) {
      ResponseUtil.sendError(resp, "API yêu cầu Content-Type application/json", 415);
      return;
    }
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
