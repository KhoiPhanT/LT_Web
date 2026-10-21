<%@ include file="header.jspf" %>
<section class="narrow">
  <h1>Tra cứu xe của tôi</h1>
  <c:choose>
    <c:when
      test="${(param.step == 'verify' || pageContext.request.pathInfo == '/verify-otp') && not empty sessionScope.otpPhone}">
      <p>Bước 2/2 · Nhập mã đã gửi đến
        <c:out value="${sessionScope.maskedEmail}" />. Mã mặc định có hiệu lực 5 phút.
      </p>
      <c:if test="${not empty sessionScope.otpPreview}">
        <p class="notice">Chế độ demo · Mã thử: <strong>
            <c:out value="${sessionScope.otpPreview}" />
          </strong></p>
      </c:if>
      <form class="panel" method="post" action="${ctx}/actions/auth/verify-otp"><input type="hidden" name="csrf"
          value="${sessionScope.csrf}"><input type="hidden" name="phone_number"
          value="<c:out value='${not empty param.phone_number ? param.phone_number : sessionScope.otpPhone}'/>"><input
          type="hidden" name="license_plate"
          value="<c:out value='${not empty param.license_plate ? param.license_plate : sessionScope.otpPlate}'/>"><label>Mã
          xác minh<input name="otp_code" pattern="[0-9]{6}" maxlength="6" inputmode="numeric"
            autocomplete="one-time-code" required autofocus></label><button>Xem phiếu sửa chữa</button></form>
      <p><a href="${ctx}/login/customer">Đổi biển số hoặc gửi lại mã</a> · Chờ 60 giây trước khi gửi lại.</p>
    </c:when>
    <c:otherwise>
      <p>Bước 1/2 · Nhập biển số và số điện thoại đã đăng ký khi giao xe.</p>
      <form class="panel" method="post" action="${ctx}/actions/auth/request-otp"><input type="hidden" name="csrf"
          value="${sessionScope.csrf}"><label>Biển số xe<input name="license_plate" placeholder="59A-12345" required
            value="<c:out value='${not empty param.license_plate ? param.license_plate : sessionScope.otpPlate}'/>"></label><label>Số
          điện thoại<input type="tel" name="phone_number" required
            value="<c:out value='${not empty param.phone_number ? param.phone_number : sessionScope.otpPhone}'/>"></label>
        <p>Mã xác minh được gửi đến email đã lưu trong hồ sơ. Nếu thông tin chưa đúng, liên hệ gara để kiểm tra.</p>
        <button>Gửi mã xác minh</button>
      </form>
    </c:otherwise>
  </c:choose>
</section>
<%@ include file="footer.jspf" %>
