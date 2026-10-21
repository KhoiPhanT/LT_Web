<%@ include file="header.jspf" %>
<h1>Tiếp nhận xe</h1>
<p>Bước 1/2 · Ghi nhận thông tin và chọn dịch vụ đã trao đổi với khách.</p>
<form method="post" action="${ctx}/orders/review"><input type="hidden" name="csrf" value="${sessionScope.csrf}">
  <div class="grid two">
    <section class="panel">
      <h2>Khách hàng</h2><label>Họ và tên<input name="customer_name" required maxlength="100"
          value="<c:out value='${not empty param.customer_name ? param.customer_name : sessionScope.draftForm.customer_name}'/>"></label><label>Số
        điện thoại<input type="tel" name="customer_phone" required pattern="0[0-9]{9,10}"
          value="<c:out value='${not empty param.customer_phone ? param.customer_phone : sessionScope.draftForm.customer_phone}'/>"></label><label>Email
        nhận mã tra cứu<input type="email" name="customer_email" required maxlength="150"
          value="<c:out value='${not empty param.customer_email ? param.customer_email : sessionScope.draftForm.customer_email}'/>"></label>
      <p>Với khách đã có hồ sơ, hãy xác nhận lại tên và email trước khi lưu.</p>
    </section>
    <section class="panel">
      <h2>Thông tin xe</h2><label>Biển số<input name="license_plate" required maxlength="20"
          value="<c:out value='${not empty param.license_plate ? param.license_plate : sessionScope.draftForm.license_plate}'/>"></label><label>Dòng
        xe<input name="vehicle_model" required maxlength="100"
          value="<c:out value='${not empty param.vehicle_model ? param.vehicle_model : sessionScope.draftForm.vehicle_model}'/>"></label><label>Tình
        trạng / yêu cầu của khách<textarea name="symptoms" rows="3"
          maxlength="2000"><c:out value="${not empty param.symptoms ? param.symptoms : sessionScope.draftForm.symptoms}"/></textarea></label>
    </section>
  </div>
  <section class="panel">
    <h2>Dịch vụ dự kiến</h2>
    <p>Giá gồm tiền công và vật tư mặc định. Phiếu được tính giá lại từ danh mục khi xác nhận.</p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Chọn</th>
            <th>Dịch vụ</th>
            <th>Tiền công</th>
            <th>Vật tư / định mức</th>
            <th>Số lượng dịch vụ</th>
          </tr>
        </thead>
        <tbody>
          <c:forEach items="${services}" var="s">
            <c:set var="chosen" value="false" />
            <c:set var="qty" value="1" />
            <c:forEach items="${sessionScope.draftLines}" var="line">
              <c:if test="${line.id == s.id}">
                <c:set var="chosen" value="true" />
                <c:set var="qty" value="${line.quantity}" />
              </c:if>
            </c:forEach>
            <c:set var="chooseKey" value="choose_${s.id}" />
            <c:set var="quantityKey" value="quantity_${s.id}" />
            <tr>
              <td><input aria-label="Chọn dịch vụ ${s.id}" type="checkbox" name="choose_${s.id}" ${(not empty param.csrf
                  ? not empty param[chooseKey] : chosen) ? 'checked' : '' }></td>
              <td>
                <c:out value="${s.service_name}" />
              </td>
              <td class="money">
                <fmt:formatNumber value="${s.labor_price}" /> ₫
              </td>
              <td>
                <c:choose>
                  <c:when test="${empty s.default_part_id}">Chỉ tiền công</c:when>
                  <c:otherwise>
                    <c:out value="${s.part_name}" /> × ${s.default_part_quantity}<br><small>
                      <fmt:formatNumber value="${s.part_price}" /> ₫ / vật tư · Tồn ${s.stock_quantity}
                    </small>
                  </c:otherwise>
                </c:choose>
              </td>
              <td><input aria-label="Số lượng dịch vụ ${s.id}" class="quantity" type="number" name="quantity_${s.id}"
                  min="1" max="1000" value="<c:out value='${not empty param[quantityKey] ? param[quantityKey] : qty}'/>"
                  required></td>
            </tr>
          </c:forEach>
        </tbody>
      </table>
    </div>
  </section>
  <div class="actions"><button>Xem lại phiếu →</button><a href="${ctx}/orders">Về danh sách</a></div>
</form>
<%@ include file="footer.jspf" %>
