<%@ include file="header.jspf" %>
<h1>Dịch vụ niêm yết</h1>
<p>Mỗi dịch vụ có giá công riêng và có thể kèm một vật tư mặc định. Đổi giá không thay hóa đơn đã lập.</p>
<details class="panel">
  <summary>+ Thêm dịch vụ</summary>
  <form method="post" action="${ctx}/actions/services"><input type="hidden" name="csrf" value="${sessionScope.csrf}">
    <div class="grid two"><label>Mã dịch vụ<input name="service_code" required maxlength="60"></label><label>Tên dịch
        vụ<input name="service_name" required maxlength="150"></label><label>Giá công (₫)<input name="labor_price"
          type="number" min="0" max="9999999999.99" step="0.01" required></label><label>Vật tư mặc định<select name="default_part_id">
          <option value="">Chỉ tiền công</option>
          <c:forEach items="${parts}" var="p">
            <option value="${p.id}">
              <c:out value="${p.part_name}" />
            </option>
          </c:forEach>
        </select></label><label>Định mức vật tư / dịch vụ<input name="default_part_quantity" type="number" value="1"
          min="1" max="1000" required></label></div><button>Thêm dịch vụ</button>
  </form>
</details>
<c:forEach items="${services}" var="s">
  <details class="panel">
    <summary>
      <c:out value="${s.service_code}" /> ·
      <c:out value="${s.service_name}" /> ·
      <fmt:formatNumber value="${s.labor_price}" /> ₫ tiền công
    </summary>
    <form method="post" action="${ctx}/actions/services/${s.id}"><input type="hidden" name="csrf"
        value="${sessionScope.csrf}"><input type="hidden" name="_method" value="PATCH">
      <div class="grid two"><label>Tên dịch vụ<input name="service_name" required maxlength="150"
            value="<c:out value='${s.service_name}'/>"></label><label>Giá công (₫)<input name="labor_price"
            type="number" min="0" max="9999999999.99" step="0.01" required value="${s.labor_price}"></label><label>Vật tư
          mặc định<select name="default_part_id">
            <option value="">Chỉ tiền công</option>
            <c:forEach items="${parts}" var="p">
              <option value="${p.id}" ${s.default_part_id==p.id ? 'selected' : '' }>
                <c:out value="${p.part_name}" />
              </option>
            </c:forEach>
          </select></label><label>Định mức / dịch vụ<input name="default_part_quantity" type="number" min="1" max="1000"
            required value="${s.default_part_quantity}"></label></div><button>Lưu dịch vụ</button>
    </form>
  </details>
</c:forEach>
<%@ include file="footer.jspf" %>
