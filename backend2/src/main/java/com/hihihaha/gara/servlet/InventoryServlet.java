package com.hihihaha.gara.servlet;

import com.fasterxml.jackson.databind.JsonNode;
import com.hihihaha.gara.dao.PartDAO;
import com.hihihaha.gara.model.Part;
import com.hihihaha.gara.util.ResponseUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@WebServlet("/api/v1/inventory/*")
public class InventoryServlet extends HttpServlet {
    private final PartDAO partDAO = new PartDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();
        if (pathInfo != null && pathInfo.length() > 1) {
            int id = Integer.parseInt(pathInfo.substring(1));
            Part p = partDAO.getById(id);
            if (p != null) {
                ResponseUtil.sendSuccess(resp, p);
            } else {
                ResponseUtil.sendError(resp, "Không tìm thấy phụ tùng", HttpServletResponse.SC_NOT_FOUND);
            }
            return;
        }

        List<Part> list = partDAO.getAll();
        ResponseUtil.sendSuccess(resp, list);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        JsonNode body = ResponseUtil.getMapper().readTree(req.getInputStream());

        Part p = new Part();
        p.setPartCode(body.has("part_code") ? body.get("part_code").asText() : "PART-" + System.currentTimeMillis() % 10000);
        p.setPartName(body.has("part_name") ? body.get("part_name").asText() : "Phụ tùng mới");
        p.setCategory(body.has("category") ? body.get("category").asText() : "LUBRICANT");
        p.setUnit(body.has("unit") ? body.get("unit").asText() : "Cái");
        p.setPrice(body.has("price") ? BigDecimal.valueOf(body.get("price").asDouble()) : BigDecimal.ZERO);
        p.setStockQuantity(body.has("stock_quantity") ? body.get("stock_quantity").asInt() : 10);
        p.setLocationBin(body.has("location_bin") ? body.get("location_bin").asText() : "KHO-A1");

        boolean ok = partDAO.create(p);
        if (ok) {
            ResponseUtil.sendSuccess(resp, p, "Thêm phụ tùng mới thành công", HttpServletResponse.SC_CREATED);
        } else {
            ResponseUtil.sendError(resp, "Thêm phụ tùng thất bại (Trùng mã phụ tùng)", HttpServletResponse.SC_BAD_REQUEST);
        }
    }
}
