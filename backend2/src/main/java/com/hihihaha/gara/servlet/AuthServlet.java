package com.hihihaha.gara.servlet;

import com.fasterxml.jackson.databind.JsonNode;
import com.hihihaha.gara.dao.CustomerDAO;
import com.hihihaha.gara.dao.UserDAO;
import com.hihihaha.gara.dao.VehicleDAO;
import com.hihihaha.gara.model.Customer;
import com.hihihaha.gara.model.User;
import com.hihihaha.gara.model.Vehicle;
import com.hihihaha.gara.util.ResponseUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/v1/auth/*")
public class AuthServlet extends HttpServlet {
    private final UserDAO userDAO = new UserDAO();
    private final CustomerDAO customerDAO = new CustomerDAO();
    private final VehicleDAO vehicleDAO = new VehicleDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();
        if (pathInfo == null) pathInfo = "";

        if (pathInfo.equals("/customer-lookup")) {
            String plate = req.getParameter("license_plate");
            String phone = req.getParameter("phone_number");
            if (plate == null || phone == null) {
                ResponseUtil.sendError(resp, "Thiếu biển số xe hoặc số điện thoại", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            Vehicle v = vehicleDAO.findByPlate(plate);
            Customer c = customerDAO.findByPhone(phone);
            if (v != null && c != null && v.getCustomerId() == c.getId()) {
                Map<String, Object> data = new HashMap<>();
                data.put("found", true);
                data.put("full_name", c.getFullName());
                data.put("email", c.getEmail());
                data.put("has_email", c.getEmail() != null);
                data.put("vehicle_model", v.getBrand() + " " + v.getModel());
                ResponseUtil.sendSuccess(resp, data, "Tìm thấy hồ sơ khách hàng", HttpServletResponse.SC_OK);
            } else {
                Map<String, Object> data = new HashMap<>();
                data.put("found", false);
                data.put("message", "Không tìm thấy hồ sơ xe gắn với số điện thoại này");
                ResponseUtil.sendSuccess(resp, data, "Không tìm thấy hồ sơ", HttpServletResponse.SC_OK);
            }
            return;
        }

        ResponseUtil.sendError(resp, "Endpoint không hợp lệ", HttpServletResponse.SC_NOT_FOUND);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();
        if (pathInfo == null) pathInfo = "";

        JsonNode body = ResponseUtil.getMapper().readTree(req.getInputStream());

        if (pathInfo.equals("/login")) {
            String username = body.has("username") ? body.get("username").asText() : "";
            String password = body.has("password") ? body.get("password").asText() : "";

            User user = userDAO.login(username, password);
            if (user != null) {
                sendUserToken(resp, user);
            } else {
                ResponseUtil.sendError(resp, "Tên đăng nhập hoặc mật khẩu không chính xác", HttpServletResponse.SC_UNAUTHORIZED);
            }
            return;
        }

        if (pathInfo.equals("/pin-login")) {
            String pinCode = body.has("pin_code") ? body.get("pin_code").asText() : "";
            User user = userDAO.loginByPin(pinCode);
            if (user != null) {
                sendUserToken(resp, user);
            } else {
                ResponseUtil.sendError(resp, "Mã PIN không chính xác", HttpServletResponse.SC_UNAUTHORIZED);
            }
            return;
        }

        // OTP Request (Khách hàng)
        if (pathInfo.equals("/otp/request") || pathInfo.equals("/request-otp")) {
            String plate = body.has("license_plate") ? body.get("license_plate").asText() : "";
            String phone = body.has("phone_number") ? body.get("phone_number").asText() : "";

            Vehicle v = vehicleDAO.findByPlate(plate);
            Customer c = customerDAO.findByPhone(phone);
            if (v != null && c != null) {
                Map<String, Object> data = new HashMap<>();
                data.put("message", "Mã OTP đã được gửi về email của bạn (Mã test: 123456)");
                data.put("otp_preview", "123456");
                ResponseUtil.sendSuccess(resp, data, "Gửi OTP thành công", HttpServletResponse.SC_OK);
            } else {
                ResponseUtil.sendError(resp, "Không tìm thấy hồ sơ xe gắn với số điện thoại này", HttpServletResponse.SC_NOT_FOUND);
            }
            return;
        }

        // OTP Verify (Khách hàng)
        if (pathInfo.equals("/otp/verify") || pathInfo.equals("/verify-otp")) {
            String plate = body.has("license_plate") ? body.get("license_plate").asText() : "";
            String phone = body.has("phone_number") ? body.get("phone_number").asText() : "";
            String otp = body.has("otp_code") ? body.get("otp_code").asText() : "";

            // Chấp nhận mã OTP '123456' hoặc bất kỳ cho mô hình đơn giản
            if ("123456".equals(otp) || otp.length() == 6) {
                Customer c = customerDAO.findByPhone(phone);
                if (c == null) {
                    c = new Customer(1, "Khách hàng", phone, "customer@hihihaha.vn", "");
                }
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", c.getId());
                userData.put("full_name", c.getFullName());
                userData.put("phone_number", c.getPhoneNumber());
                userData.put("email", c.getEmail());
                userData.put("role", "CUSTOMER");
                userData.put("license_plate", plate);

                Map<String, Object> result = new HashMap<>();
                result.put("token", "cust_jwt_" + System.currentTimeMillis());
                result.put("user", userData);

                ResponseUtil.sendSuccess(resp, result, "Đăng nhập khách hàng thành công", HttpServletResponse.SC_OK);
            } else {
                ResponseUtil.sendError(resp, "Mã OTP không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
            }
            return;
        }

        ResponseUtil.sendError(resp, "Endpoint không hợp lệ", HttpServletResponse.SC_NOT_FOUND);
    }

    private void sendUserToken(HttpServletResponse resp, User user) throws IOException {
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("username", user.getUsername());
        userData.put("full_name", user.getFullName());
        userData.put("phone_number", user.getPhoneNumber());
        userData.put("email", user.getEmail());
        userData.put("role", user.getRole());

        Map<String, Object> result = new HashMap<>();
        result.put("token", "staff_jwt_" + user.getId() + "_" + System.currentTimeMillis());
        result.put("user", userData);

        ResponseUtil.sendSuccess(resp, result, "Đăng nhập thành công", HttpServletResponse.SC_OK);
    }
}
