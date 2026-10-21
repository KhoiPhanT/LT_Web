<%@ include file="header.jspf" %>
<h1>Xem lại phiếu tiếp nhận</h1>
<p>Bước 2/2 · Xác nhận thông tin và chi phí với khách trước khi tạo phiếu.</p>
<section class="panel">
  <h2>
    <c:out value="${sessionScope.draftForm.license_plate}" /> ·
    <c:out value="${sessionScope.draftForm.vehicle_model}" />
  </h2>
  <p>
    <c:out value="${sessionScope.draftForm.customer_name}" /> ·
    <c:out value="${sessionScope.draftForm.customer_phone}" /> ·
    <c:out value="${sessionScope.draftForm.customer_email}" />
  </p>
  <p>Tình trạng:
    <c:out value="${sessionScope.draftForm.symptoms}" />
  </p>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Dịch vụ</th>
          <th>Số lượng</th>
          <th>Thành tiền gồm vật tư</th>
        </tr>
      </thead>
      <tbody>
        <c:forEach items="${sessionScope.draftLines}" var="line">
          <tr>
            <td>
              <c:out value="${line.service_name}" />
              <c:if test="${not empty line.part_name}"><br><small>
                  <c:out value="${line.part_name}" /> × ${line.default_part_quantity} mỗi dịch vụ
                </small></c:if>
            </td>
            <td>${line.quantity}</td>
            <td class="money">
              <fmt:formatNumber value="${line.amount}" /> ₫
            </td>
          </tr>
        </c:forEach>
      </tbody>
    </table>
  </div>
  <p class="total">Tổng dự kiến:
    <fmt:formatNumber value="${sessionScope.draftTotal}" /> ₫
  </p>
  <p>Sau khi tạo, quản lý sẽ phân công người sửa. Giá trên phiếu được chốt theo danh mục tại lúc xác nhận.</p>
</section>
<form method="post" action="${ctx}/actions/orders"><input type="hidden" name="draftToken"
    value="${sessionScope.draftToken}"><input type="hidden" name="csrf" value="${sessionScope.csrf}">
  <div class="actions"><button>Xác nhận tiếp nhận xe</button><a href="${ctx}/orders/new">← Sửa lại thông tin</a></div>
</form>
<%@ include file="footer.jspf" %>
