<%@ include file="header.jspf" %>
<section class="narrow">
  <h1>Chưa thể hoàn tất thao tác</h1>
  <p>Kiểm tra thông báo bên trên rồi quay lại trang phù hợp để tiếp tục.</p>
  <c:url var="backUrl" value="${empty backPath ? '/home' : backPath}"/>
  <p><a class="button secondary" href="<c:out value='${backUrl}'/>">← Quay lại</a></p>
  <p><a href="${ctx}/orders">Về danh sách phiếu</a> · <a href="${ctx}/home">Về trang đầu</a></p>
</section>
<%@ include file="footer.jspf" %>
