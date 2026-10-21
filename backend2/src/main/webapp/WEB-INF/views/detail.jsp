<%@ include file="header.jspf" %>
<a href="${ctx}/orders">← Danh sách phiếu</a>
<div class="heading">
  <div>
    <h1>
      <c:out value="${order.license_plate}" />
    </h1>
    <p>
      <c:out value="${order.order_code}" /> ·
      <c:out value="${order.vehicle_model}" /> ·
      <c:out value="${order.customer_name}" />
    </p>
  </div><span class="badge">
    <c:out value="${statusNames[order.current_status]}" />
  </span>
</div>
<section class="panel">
  <h2>Tình trạng xe</h2>
  <p class="preserve">
    <c:out value="${empty order.symptoms ? 'Chưa ghi chú tình trạng.' : order.symptoms}" />
  </p>
  <p>Người sửa: <strong>
      <c:out value="${empty order.technician_name ? 'Đang chờ quản lý phân công' : order.technician_name}" />
    </strong></p><label>Tiến độ công việc · ${order.progress_percent}%<progress value="${order.progress_percent}"
      max="100">${order.progress_percent}%</progress></label>
</section>
<c:if test="${sessionScope.role == 'MANAGER' && order.current_status == 'RECEIVED'}">
  <section class="panel">
    <h2>Phân công sửa chữa</h2>
    <p>Chọn người trực tiếp thực hiện. Số phiếu đang nhận giúp bạn cân đối công việc.</p>
    <form method="post" action="${ctx}/actions/assignments/${order.order_code}" class="toolbar"><input type="hidden"
        name="csrf" value="${sessionScope.csrf}"><input type="hidden" name="_method" value="PATCH"><label>Kỹ thuật
        viên<select name="technician_id" required>
          <option value="">Chọn người sửa</option>
          <c:forEach items="${technicians}" var="t">
            <option value="${t.id}" ${order.assigned_to==t.id ? 'selected' : '' }>
              <c:out value="${t.full_name}" /> · ${t.active_count} phiếu đang nhận
            </option>
          </c:forEach>
        </select></label><button>Lưu phân công</button></form>
  </section>
</c:if>
<c:if
  test="${sessionScope.role == 'TECHNICIAN' && order.assigned_to == sessionScope.user_id && order.current_status == 'RECEIVED'}">
  <section class="panel">
    <h2>Nhận việc</h2>
    <p>Kiểm tra dịch vụ và vật tư bên dưới trước khi bắt đầu.</p>
    <form method="post" action="${ctx}/actions/progress/${order.order_code}/start"><input type="hidden" name="csrf"
        value="${sessionScope.csrf}"><button>Bắt đầu sửa xe</button></form>
  </section>
</c:if>
<section class="panel">
  <h2>Công việc và chi phí</h2>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Hạng mục</th>
          <th>Loại</th>
          <th>Số lượng</th>
          <th>Đơn giá</th>
          <th>Thành tiền</th>
          <th>Tiến độ</th>
        </tr>
      </thead>
      <tbody>
        <c:set var="allDone" value="true" />
        <c:forEach items="${order.items}" var="item">
          <c:if test="${item.item_type == 'LABOR' && item.progress_percent != 100}">
            <c:set var="allDone" value="false" />
          </c:if>
          <tr>
            <td>
              <c:out value="${item.item_name}" />
            </td>
            <td>${item.item_type == 'LABOR' ? 'Tiền công' : 'Phụ tùng'}</td>
            <td>${item.quantity}</td>
            <td class="money">
              <fmt:formatNumber value="${item.unit_price}" /> ₫
            </td>
            <td class="money">
              <fmt:formatNumber value="${item.total_price}" /> ₫
            </td>
            <td>
              <c:if test="${item.item_type == 'LABOR'}">
                <c:choose>
                  <c:when
                    test="${sessionScope.role == 'TECHNICIAN' && order.assigned_to == sessionScope.user_id && order.current_status == 'IN_PROGRESS'}">
                    <form class="inline" method="post"
                      action="${ctx}/actions/progress/${order.order_code}/items/${item.id}"><input type="hidden"
                        name="csrf" value="${sessionScope.csrf}"><input type="hidden" name="_method"
                        value="PATCH"><select aria-label="Tiến độ công việc ${item.id}" name="progress_percent">
                        <option value="0" ${item.progress_percent==0 ? 'selected' : '' }>Chưa làm · 0%</option>
                        <option value="50" ${item.progress_percent==50 ? 'selected' : '' }>Đang làm · 50%</option>
                        <option value="100" ${item.progress_percent==100 ? 'selected' : '' }>Đã xong · 100%</option>
                      </select><button>Lưu</button></form>
                  </c:when>
                  <c:otherwise>${item.progress_percent}%</c:otherwise>
                </c:choose>
              </c:if>
            </td>
          </tr>
        </c:forEach>
      </tbody>
    </table>
  </div>
  <p class="total">Tổng thanh toán:
    <fmt:formatNumber value="${order.total_amount}" /> ₫
  </p>
  <p>Giá trên phiếu đã được lưu tại thời điểm tiếp nhận.</p>
</section>
<c:if
  test="${sessionScope.role == 'TECHNICIAN' && order.assigned_to == sessionScope.user_id && order.current_status == 'IN_PROGRESS'}">
  <section class="panel">
    <h2>Kết thúc sửa chữa</h2>
    <c:choose>
      <c:when test="${allDone}">
        <p>Mọi công việc đã xong. Xác nhận để ghi nhận vật tư đã dùng và chuyển phiếu sang chờ thanh toán.</p>
        <form method="post" action="${ctx}/actions/progress/${order.order_code}/finish"><input type="hidden" name="csrf"
            value="${sessionScope.csrf}"><button>Hoàn thành sửa chữa</button></form>
      </c:when>
      <c:otherwise>
        <p>Hoàn thành và lưu 100% từng công việc bên trên để chuyển sang bước thanh toán.</p><button disabled>Hoàn thành
          sửa chữa</button>
      </c:otherwise>
    </c:choose>
  </section>
</c:if>
<section class="panel">
  <h2>Thanh toán & bàn giao</h2>
  <p><strong>
      <c:out value="${paymentNames[order.payment_status]}" />
    </strong></p>
  <c:choose>
    <c:when test="${order.current_status == 'COMPLETED'}">
      <p>Gara đã xác nhận nhận tiền và hoàn tất phiếu. Khách có thể nhận xe.</p>
    </c:when>
    <c:when test="${order.current_status != 'WAITING_PAYMENT'}">
      <p>Hóa đơn sẵn sàng thanh toán sau khi kỹ thuật viên hoàn thành sửa chữa.</p>
    </c:when>
    <c:otherwise>
      <c:if test="${sessionScope.role == 'CUSTOMER'}">
        <c:url var="qr" value="https://img.vietqr.io/image/MB-0797526990-compact2.png">
          <c:param name="amount" value="${order.total_amount}" />
          <c:param name="addInfo" value="${order.order_code}" />
        </c:url>
        <div class="payment"><img class="qr" src="<c:out value='${qr}'/>" width="240" height="240"
            alt="VietQR chuyển khoản cho phiếu sửa chữa">
          <div>
            <p>Ngân hàng: <strong>MB</strong><br>Số tài khoản: <strong>0797526990</strong><br>Số tiền: <strong>
                <fmt:formatNumber value="${order.total_amount}" /> ₫
              </strong><br>Nội dung: <strong>
                <c:out value="${order.order_code}" />
              </strong></p>
            <p>Kiểm tra người nhận trong ứng dụng ngân hàng trước khi chuyển khoản.</p>
            <c:if test="${order.payment_status == 'UNPAID'}">
              <form method="post" action="${ctx}/actions/payments/report"><input type="hidden" name="csrf"
                  value="${sessionScope.csrf}"><input type="hidden" name="order_code" value="${order.order_code}"><label
                  class="check"><input type="checkbox" required> Tôi đã chuyển đúng số tiền và nội dung
                  trên.</label><button>Báo gara đã chuyển khoản</button></form>
            </c:if>
          </div>
        </div>
      </c:if>
      <c:if test="${order.payment_status == 'PENDING_VERIFICATION'}">
        <p>Khách đã báo chuyển khoản. Gara cần kiểm tra giao dịch trước khi bàn giao xe.</p>
        <c:if test="${sessionScope.role == 'MANAGER'}">
          <p>Đối chiếu tài khoản MB 0797526990 · Nội dung <strong>
              <c:out value="${order.order_code}" />
            </strong> · Số tiền <strong>
              <fmt:formatNumber value="${order.total_amount}" /> ₫
            </strong>.</p>
          <form method="post" action="${ctx}/actions/payments/verify"><input type="hidden" name="csrf"
              value="${sessionScope.csrf}"><input type="hidden" name="order_code" value="${order.order_code}"><label
              class="check"><input type="checkbox" required> Tôi đã kiểm tra và nhận đủ tiền trong tài khoản
              gara.</label><button>Xác nhận nhận tiền & hoàn tất phiếu</button></form>
        </c:if>
      </c:if>
      <c:if test="${sessionScope.role != 'CUSTOMER' && order.payment_status == 'UNPAID'}">
        <p>Chờ khách tra cứu phiếu và báo chuyển khoản. Quản lý đối soát sau khi nhận thông báo.</p>
      </c:if>
    </c:otherwise>
  </c:choose>
</section>
<%@ include file="footer.jspf" %>
