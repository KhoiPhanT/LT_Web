<%@ include file="header.jspf" %>
<div class="heading">
  <div>
    <h1>Phiếu sửa chữa</h1>
    <p>Chọn một phiếu để xem thông tin và thực hiện bước tiếp theo.</p>
  </div>
  <c:if test="${sessionScope.role == 'TECHNICIAN'}"><a class="button" href="${ctx}/orders/new">+ Tiếp nhận xe</a></c:if>
</div>
<form method="get" action="${ctx}/orders" class="toolbar"><label>Tìm phiếu<input name="q"
      placeholder="Mã phiếu, biển số, tên khách" value="<c:out value='${param.q}'/>"></label><label>Trạng thái<select
      name="queue">
      <option value="active" ${queue=='active' ? 'selected' : '' }>Đang xử lý</option>
      <option value="assign" ${queue=='assign' ? 'selected' : '' }>Chờ phân công / bắt đầu</option>
      <option value="repair" ${queue=='repair' ? 'selected' : '' }>Tiếp nhận và đang sửa</option>
      <option value="payment" ${queue=='payment' ? 'selected' : '' }>Chờ thanh toán</option>
      <option value="done" ${queue=='done' ? 'selected' : '' }>Đã hoàn tất</option>
      <option value="all" ${queue=='all' ? 'selected' : '' }>Tất cả</option>
    </select></label><button>Lọc phiếu</button></form>
<div class="table-wrap">
  <table>
    <thead>
      <tr>
        <th>Phiếu / Xe</th>
        <th>Khách hàng</th>
        <th>Trạng thái</th>
        <th>Phụ trách</th>
        <th>Tổng tiền</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <c:forEach items="${orders}" var="o">
        <tr>
          <td><strong>
              <c:out value="${o.license_plate}" />
            </strong><br><small>
              <c:out value="${o.order_code}" /> ·
              <c:out value="${o.vehicle_model}" />
            </small></td>
          <td>
            <c:out value="${o.customer_name}" />
          </td>
          <td><span class="badge">
              <c:out value="${statusNames[o.current_status]}" />
            </span><br><small>
              <c:out value="${paymentNames[o.payment_status]}" /> · ${o.progress_percent}%
            </small></td>
          <td>
            <c:out value="${empty o.technician_name ? 'Chưa phân công' : o.technician_name}" />
          </td>
          <td class="money">
            <fmt:formatNumber value="${o.total_amount}" /> ₫
          </td>
          <td>
            <c:url var="detailUrl" value="/orders/detail">
              <c:param name="code" value="${o.order_code}" />
            </c:url><a href="${detailUrl}">Mở phiếu →</a>
          </td>
        </tr>
      </c:forEach>
    </tbody>
  </table>
  <c:if test="${empty orders}">
    <p class="empty">Chưa có phiếu trong danh sách này. Thử chọn “Tất cả” hoặc đổi từ khóa.</p>
  </c:if>
</div>
<%@ include file="footer.jspf" %>
