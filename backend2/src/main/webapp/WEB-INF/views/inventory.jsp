<%@ include file="header.jspf" %>
<h1>Kho phụ tùng</h1>
<p>Tra tồn và điều chỉnh theo số lượng kiểm kê thực tế. Vật tư được trừ khi thợ hoàn thành sửa chữa.</p>
<details class="panel">
  <summary>+ Thêm phụ tùng</summary>
  <form method="post" action="${ctx}/actions/inventory"><input type="hidden" name="csrf" value="${sessionScope.csrf}">
    <div class="grid two"><label>Mã phụ tùng<input name="part_code" required maxlength="50"></label><label>Tên phụ
        tùng<input name="part_name" required maxlength="150"></label><label>Đơn vị<input name="unit" required
          maxlength="30" placeholder="Cái, bộ, chai…"></label><label>Đơn giá (₫)<input type="number" name="price"
          min="0" max="9999999999.99" step="0.01" required></label><label>Tồn ban đầu<input type="number"
          name="stock_quantity" min="0" max="2147483647" required></label></div><button>Thêm phụ tùng</button>
  </form>
</details>
<div class="table-wrap">
  <table>
    <thead>
      <tr>
        <th>Mã</th>
        <th>Phụ tùng</th>
        <th>Đơn vị</th>
        <th>Đơn giá</th>
        <th>Tồn thực tế</th>
      </tr>
    </thead>
    <tbody>
      <c:forEach items="${parts}" var="p">
        <tr>
          <td>
            <c:out value="${p.part_code}" />
          </td>
          <td>
            <c:out value="${p.part_name}" />
            <c:if test="${p.stock_quantity == 0}"><br><strong>Hết hàng</strong></c:if>
          </td>
          <td>
            <c:out value="${p.unit}" />
          </td>
          <td class="money">
            <fmt:formatNumber value="${p.price}" /> ₫
          </td>
          <td>
            <form class="inline" method="post" action="${ctx}/actions/inventory/${p.id}/stock">
            <input type="hidden" name="expected_stock" value="${p.stock_quantity}"><input type="hidden"
                name="csrf" value="${sessionScope.csrf}"><input type="hidden" name="_method" value="PATCH"><input
                aria-label="Tồn thực tế phụ tùng ${p.id}" class="quantity" name="stock_quantity" type="number" min="0"
                max="2147483647" value="${p.stock_quantity}" required><button>Lưu tồn</button></form>
          </td>
        </tr>
      </c:forEach>
    </tbody>
  </table>
</div>
<%@ include file="footer.jspf" %>
