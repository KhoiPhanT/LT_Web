package com.hihihaha.gara.servlet;

import com.fasterxml.jackson.databind.JsonNode;
import com.hihihaha.gara.dao.*;
import com.hihihaha.gara.model.*;
import com.hihihaha.gara.util.ResponseUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@WebServlet("/api/v1/work-orders/*")
public class WorkOrderServlet extends HttpServlet {
    private final WorkOrderDAO workOrderDAO = new WorkOrderDAO();
    private final WorkOrderItemDAO itemDAO = new WorkOrderItemDAO();
    private final PartDAO partDAO = new PartDAO();
    private final InvoiceDAO invoiceDAO = new InvoiceDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();
        if (pathInfo == null || pathInfo.equals("/")) {
            String status = req.getParameter("status");
            List<WorkOrder> list = workOrderDAO.getAll(status);
            ResponseUtil.sendSuccess(resp, list);
            return;
        }

        // Lấy chi tiết theo ID hoặc OrderCode: /api/v1/work-orders/:id
        String idOrCode = pathInfo.substring(1);
        WorkOrder wo = null;
        try {
            int id = Integer.parseInt(idOrCode);
            wo = workOrderDAO.getById(id);
        } catch (NumberFormatException e) {
            wo = workOrderDAO.getByCode(idOrCode);
        }

        if (wo != null) {
            ResponseUtil.sendSuccess(resp, wo);
        } else {
            ResponseUtil.sendError(resp, "Không tìm thấy lệnh sửa chữa", HttpServletResponse.SC_NOT_FOUND);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        JsonNode body = ResponseUtil.getMapper().readTree(req.getInputStream());

        WorkOrder wo = new WorkOrder();
        String orderCode = "WO-" + System.currentTimeMillis() % 100000;
        wo.setOrderCode(orderCode);
        wo.setVehicleId(body.has("vehicle_id") ? body.get("vehicle_id").asInt() : 1);
        wo.setAdvisorId(body.has("advisor_id") ? body.get("advisor_id").asInt() : 1);

        if (body.has("bay_id") && !body.get("bay_id").isNull()) {
            wo.setBayId(body.get("bay_id").asInt());
        }
        if (body.has("technician_id") && !body.get("technician_id").isNull()) {
            wo.setTechnicianId(body.get("technician_id").asInt());
        }

        wo.setStatus(body.has("status") ? body.get("status").asText() : "RECEIVED");
        wo.setCustomerSymptoms(body.has("customer_symptoms") ? body.get("customer_symptoms").asText() : "");
        wo.setAdvisorDiagnosis(body.has("advisor_diagnosis") ? body.get("advisor_diagnosis").asText() : "");

        BigDecimal totalParts = BigDecimal.ZERO;
        BigDecimal totalLabor = BigDecimal.ZERO;

        int orderId = workOrderDAO.create(wo);
        if (orderId <= 0) {
            ResponseUtil.sendError(resp, "Không thể tạo lệnh sửa chữa", HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return;
        }

        // Tạo các items (phụ tùng / tiền công) nếu có
        if (body.has("items") && body.get("items").isArray()) {
            for (JsonNode itemNode : body.get("items")) {
                WorkOrderItem item = new WorkOrderItem();
                item.setWorkOrderId(orderId);
                String type = itemNode.has("item_type") ? itemNode.get("item_type").asText() : "PART";
                item.setItemType(type);
                item.setItemName(itemNode.has("item_name") ? itemNode.get("item_name").asText() : "Hạng mục");
                int qty = itemNode.has("quantity") ? itemNode.get("quantity").asInt() : 1;
                item.setQuantity(qty);
                BigDecimal price = itemNode.has("unit_price") ? BigDecimal.valueOf(itemNode.get("unit_price").asDouble()) : BigDecimal.ZERO;
                item.setUnitPrice(price);
                BigDecimal subtotal = price.multiply(BigDecimal.valueOf(qty));
                item.setTotalPrice(subtotal);

                if ("PART".equals(type)) {
                    totalParts = totalParts.add(subtotal);
                    if (itemNode.has("part_id")) {
                        item.setPartId(itemNode.get("part_id").asInt());
                    }
                } else {
                    totalLabor = totalLabor.add(subtotal);
                }

                itemDAO.create(item);
            }
        }

        // Tạo hóa đơn tạm ứng
        Invoice inv = new Invoice();
        inv.setInvoiceCode("INV-" + System.currentTimeMillis() % 100000);
        inv.setWorkOrderId(orderId);
        inv.setTotalAmount(totalParts.add(totalLabor));
        inv.setPaymentMethod("VIETQR");
        inv.setPaymentStatus("UNPAID");
        invoiceDAO.create(inv);

        WorkOrder createdWo = workOrderDAO.getById(orderId);
        ResponseUtil.sendSuccess(resp, createdWo, "Tạo lệnh sửa chữa thành công", HttpServletResponse.SC_CREATED);
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();
        if (pathInfo == null) {
            ResponseUtil.sendError(resp, "Thiếu tham số ID", HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        JsonNode body = ResponseUtil.getMapper().readTree(req.getInputStream());
        String[] parts = pathInfo.split("/");

        // Trường hợp cập nhật checklist item: /api/v1/work-orders/items/:id/toggle
        if (parts.length >= 4 && "items".equals(parts[1]) && "toggle".equals(parts[3])) {
            int itemId = Integer.parseInt(parts[2]);
            boolean isDone = body.has("is_done") && body.get("is_done").asBoolean();
            itemDAO.updateDone(itemId, isDone);
            ResponseUtil.sendSuccess(resp, null, "Cập nhật tiến độ thành công", HttpServletResponse.SC_OK);
            return;
        }

        if (parts.length >= 2) {
            int id = Integer.parseInt(parts[1]);

            // /api/v1/work-orders/:id/status
            if (parts.length >= 3 && "status".equals(parts[2])) {
                String newStatus = body.has("status") ? body.get("status").asText() : "";
                boolean ok = workOrderDAO.updateStatus(id, newStatus);
                if (ok) {
                    ResponseUtil.sendSuccess(resp, null, "Cập nhật trạng thái Kanban thành công", HttpServletResponse.SC_OK);
                } else {
                    ResponseUtil.sendError(resp, "Cập nhật trạng thái thất bại", HttpServletResponse.SC_BAD_REQUEST);
                }
                return;
            }

            // /api/v1/work-orders/:id/approve
            if (parts.length >= 3 && "approve".equals(parts[2])) {
                boolean ok = workOrderDAO.approveQuote(id);
                if (ok) {
                    // Trừ tồn kho phụ tùng của đơn
                    List<WorkOrderItem> items = itemDAO.getByWorkOrderId(id);
                    for (WorkOrderItem it : items) {
                        if ("PART".equals(it.getItemType()) && it.getPartId() != null) {
                            partDAO.deductStock(it.getPartId(), it.getQuantity());
                        }
                    }
                    ResponseUtil.sendSuccess(resp, null, "Duyệt báo giá thành công", HttpServletResponse.SC_OK);
                } else {
                    ResponseUtil.sendError(resp, "Không thể duyệt báo giá", HttpServletResponse.SC_BAD_REQUEST);
                }
                return;
            }

            // /api/v1/work-orders/:id/assign
            if (parts.length >= 3 && "assign".equals(parts[2])) {
                if (body.has("bay_id")) {
                    Integer bayId = body.get("bay_id").isNull() ? null : body.get("bay_id").asInt();
                    workOrderDAO.updateBay(id, bayId);
                }
                if (body.has("technician_id")) {
                    Integer techId = body.get("technician_id").isNull() ? null : body.get("technician_id").asInt();
                    workOrderDAO.assignTechnician(id, techId);
                }
                ResponseUtil.sendSuccess(resp, null, "Điều phối thành công", HttpServletResponse.SC_OK);
                return;
            }
        }

        ResponseUtil.sendError(resp, "Endpoint không hợp lệ", HttpServletResponse.SC_NOT_FOUND);
    }
}
