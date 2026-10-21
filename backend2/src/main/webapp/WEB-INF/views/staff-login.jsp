<%@ include file="header.jspf" %>
<section class="narrow">
  <h1>Đăng nhập nhân viên</h1>
  <p>Dùng tài khoản được gara cấp cho quản lý hoặc kỹ thuật viên.</p>
  <form class="panel" method="post" action="${ctx}/actions/auth/staff-login"><input type="hidden" name="csrf"
      value="${sessionScope.csrf}"><label>Số điện thoại<input type="tel" name="phone_number" required
        autocomplete="username" value="<c:out value='${param.phone_number}'/>"></label><label>Mật khẩu<input
        type="password" name="password" required autocomplete="current-password"></label><button>Đăng nhập</button>
  </form>
  <p>Bạn là khách hàng? <a href="${ctx}/login/customer">Tra cứu bằng biển số</a></p>
</section>
<%@ include file="footer.jspf" %>
