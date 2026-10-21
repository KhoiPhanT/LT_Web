<%@ include file="header.jspf" %>
<h1>Hiệu suất kỹ thuật viên</h1>
<p>Đếm các phiếu được phân công trong khoảng ngày đã chọn. Phiếu sửa xong bao gồm cả phiếu đang chờ thanh toán.</p>
<form method="get" action="${ctx}/reports" class="toolbar"><label>Từ ngày<input type="date" name="from" value="${from}"
      required></label><label>Đến ngày<input type="date" name="to" value="${to}" required></label><button>Xem báo
    cáo</button></form>
<div class="table-wrap">
  <table>
    <thead>
      <tr>
        <th>Kỹ thuật viên</th>
        <th>Đã nhận</th>
        <th>Đã sửa xong</th>
        <th>Tỷ lệ hoàn thành</th>
      </tr>
    </thead>
    <tbody>
      <c:forEach items="${rows}" var="r">
        <tr>
          <td>
            <c:out value="${r.full_name}" />
          </td>
          <td>${r.assigned_count}</td>
          <td>${r.finished_count}</td>
          <td>${r.completion_rate}%</td>
        </tr>
      </c:forEach>
    </tbody>
  </table>
</div>
<%@ include file="footer.jspf" %>
