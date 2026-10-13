package com.hihihaha.gara.servlet;

import com.fasterxml.jackson.databind.JsonNode;
import com.hihihaha.gara.dao.InvoiceDAO;
import com.hihihaha.gara.model.Invoice;
import com.hihihaha.gara.util.ResponseUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/api/v1/payments/*")
public class PaymentServlet extends HttpServlet {
    private final InvoiceDAO invoiceDAO = new InvoiceDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();
        if (pathInfo != null && pathInfo.startsWith("/work-order/")) {
            int workOrderId = Integer.parseInt(pathInfo.substring("/work-order/".length()));
            Invoice inv = invoiceDAO.getByWorkOrderId(workOrderId);
            if (inv != null) {
                ResponseUtil.sendSuccess(resp, inv);
            } else {
                ResponseUtil.sendError(resp, "Chưa có hóa đơn cho lệnh này", HttpServletResponse.SC_NOT_FOUND);
            }
            return;
        }

        ResponseUtil.sendError(resp, "Endpoint không hợp lệ", HttpServletResponse.SC_NOT_FOUND);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();
        JsonNode body = ResponseUtil.getMapper().readTree(req.getInputStream());

        if (pathInfo != null && (pathInfo.equals("/confirm") || pathInfo.equals("/pay"))) {
            int workOrderId = body.has("work_order_id") ? body.get("work_order_id").asInt() : 0;
            String method = body.has("payment_method") ? body.get("payment_method").asText() : "VIETQR";

            boolean ok = invoiceDAO.markPaid(workOrderId, method);
            if (ok) {
                ResponseUtil.sendSuccess(resp, null, "Thanh toán thành công! Lệnh sửa chữa đã hoàn tất.", HttpServletResponse.SC_OK);
            } else {
                ResponseUtil.sendError(resp, "Thanh toán thất bại", HttpServletResponse.SC_BAD_REQUEST);
            }
            return;
        }

        ResponseUtil.sendError(resp, "Endpoint không hợp lệ", HttpServletResponse.SC_NOT_FOUND);
    }
}
