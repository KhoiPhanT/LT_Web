package com.hihihaha.gara.servlet;

import com.fasterxml.jackson.databind.JsonNode;
import com.hihihaha.gara.dao.CustomerDAO;
import com.hihihaha.gara.dao.VehicleDAO;
import com.hihihaha.gara.model.Customer;
import com.hihihaha.gara.model.Vehicle;
import com.hihihaha.gara.util.ResponseUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

@WebServlet("/api/v1/vehicles/*")
public class VehicleServlet extends HttpServlet {
    private final VehicleDAO vehicleDAO = new VehicleDAO();
    private final CustomerDAO customerDAO = new CustomerDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();
        String plateQuery = req.getParameter("license_plate");

        if (plateQuery != null && !plateQuery.trim().isEmpty()) {
            Vehicle v = vehicleDAO.findByPlate(plateQuery);
            if (v != null) {
                ResponseUtil.sendSuccess(resp, v);
            } else {
                ResponseUtil.sendError(resp, "Không tìm thấy xe với biển số này", HttpServletResponse.SC_NOT_FOUND);
            }
            return;
        }

        if (pathInfo != null && pathInfo.length() > 1) {
            String plate = pathInfo.substring(1);
            Vehicle v = vehicleDAO.findByPlate(plate);
            if (v != null) {
                ResponseUtil.sendSuccess(resp, v);
                return;
            }
        }

        // Mặc định lấy tất cả xe
        List<Vehicle> list = vehicleDAO.getAll();
        ResponseUtil.sendSuccess(resp, list);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        JsonNode body = ResponseUtil.getMapper().readTree(req.getInputStream());

        String plate = body.has("license_plate") ? body.get("license_plate").asText() : "";
        String brand = body.has("brand") ? body.get("brand").asText() : "Khác";
        String model = body.has("model") ? body.get("model").asText() : "Xe du lịch";
        String phone = body.has("phone_number") ? body.get("phone_number").asText() : "";
        String fullName = body.has("customer_name") ? body.get("customer_name").asText() : "Khách vãng lai";

        if (plate.isEmpty() || phone.isEmpty()) {
            ResponseUtil.sendError(resp, "Vui lòng nhập biển số xe và số điện thoại chủ xe", HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        // Tìm hoặc tạo khách hàng
        Customer c = customerDAO.findByPhone(phone);
        int customerId;
        if (c == null) {
            Customer newC = new Customer(0, fullName, phone, "", "");
            customerId = customerDAO.create(newC);
        } else {
            customerId = c.getId();
        }

        // Tạo xe
        Vehicle v = new Vehicle();
        v.setLicensePlate(plate);
        v.setCustomerId(customerId);
        v.setBrand(brand);
        v.setModel(model);
        v.setManufactureYear(body.has("manufacture_year") ? body.get("manufacture_year").asInt() : 2022);
        v.setOdoKm(body.has("odo_km") ? body.get("odo_km").asInt() : 0);

        int vehicleId = vehicleDAO.create(v);
        v.setId(vehicleId);
        ResponseUtil.sendSuccess(resp, v, "Tạo thông tin xe thành công", HttpServletResponse.SC_CREATED);
    }
}
