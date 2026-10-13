package com.hihihaha.gara;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;

public class AppServer {
    private static final int PORT = 8088;

    // Database trong bộ nhớ lưu vết thực
    private static final Map<String, Map<String, Object>> WORK_ORDERS = new ConcurrentHashMap<>();
    private static final List<Map<String, Object>> INVENTORY = new ArrayList<>();
    private static final List<Map<String, Object>> TECHNICIANS = new ArrayList<>();
    private static final List<String> BAYS = new ArrayList<>();

    public static void main(String[] args) throws IOException {
        initSampleData();

        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/", new RootHandler());
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        server.start();

        System.out.println("==================================================");
        System.out.println("  HIHIHAHA AUTO - STANDALONE JAVA BACKEND 2");
        System.out.println("  Port: http://localhost:" + PORT);
        System.out.println("  API Base URL: http://localhost:" + PORT + "/api/v1");
        System.out.println("==================================================");
    }

    private static void initSampleData() {
        // Khoang nâng
        BAYS.addAll(List.of(
            "Khoang Nâng 01 (Cầu 2 trụ - Bảo Dưỡng Nhanh)",
            "Khoang Nâng 02 (Cầu cắt kéo - Máy & Gầm)",
            "Khoang Nâng 03 (Cầu 4 trụ - Cân chỉnh Hunter 3D)",
            "Khoang Nâng 04 (Khu vực chẩn đoán điện & ECU)"
        ));

        // Kỹ thuật viên
        TECHNICIANS.add(createTech("0988888803", "Phạm Thợ Xưởng (THO-01)", "Trưởng nhóm Máy & Gầm - Bậc 4/4", "1357"));
        TECHNICIANS.add(createTech("0988888804", "Trần Văn Cường (THO-02)", "Chuyên gia Điện - CAN-Bus & Lạnh", "1234"));
        TECHNICIANS.add(createTech("0988888805", "Lê Hoàng Long (THO-03)", "Kỹ thuật viên Bảo Dưỡng Nhanh", "1111"));
        TECHNICIANS.add(createTech("0988888806", "Phạm Minh Tuấn (THO-04)", "Kỹ thuật viên Cân Chỉnh Góc Đặt 3D", "2222"));

        // Kho linh kiện phụ tùng
        INVENTORY.add(createPart("OIL-MOBIL-5W30", "Dầu nhớt Mobil 1 5W-30 (Can 4L)", "LUBRICANT", "Can", 850000, 48, "KHO-A1-K1"));
        INVENTORY.add(createPart("FLT-OIL-TY01", "Lọc nhớt Toyota chính hãng", "FILTRATION", "Cái", 180000, 95, "KHO-A1-K2"));
        INVENTORY.add(createPart("BRK-PAD-FR-CAM", "Bộ má phanh trước Toyota Camry", "BRAKE", "Bộ", 1250000, 18, "KHO-B2-K1"));
        INVENTORY.add(createPart("SPK-IRIDIUM-DEN", "Bugi Denso Iridium Tough", "IGNITION", "Cái", 220000, 76, "KHO-B2-K3"));
        INVENTORY.add(createPart("AC-GAS-R134A", "Bơm ga điều hòa R134a", "ELECTRICAL", "Bình", 450000, 12, "KHO-C1-K1"));
        INVENTORY.add(createPart("FLT-AIR-HD02", "Lọc gió động cơ Honda Civic", "FILTRATION", "Cái", 250000, 38, "KHO-A2-K1"));

        // Lệnh sửa chữa mẫu
        addSampleOrder("WO-20261001-0089", "51K-888.88", "Toyota Camry 2.5Q", "Minh Thảo", "0912345678", "IN_PROGRESS", 60, "Phạm Thợ Xưởng (THO-01)", "0988888803", "Khoang Nâng 01 (Cầu 2 trụ - Bảo Dưỡng Nhanh)", 2580000, null);
        addSampleOrder("WO-20261001-0090", "51F-123.45", "Mazda CX-5 2.0", "Trần Thị B", "0903112233", "INSPECTION", 10, "Trần Văn Cường (THO-02)", "0988888804", "Khoang Nâng 02 (Cầu cắt kéo - Máy & Gầm)", 900000, null);
        addSampleOrder("WO-20261001-0088", "30E-999.99", "Mercedes-Benz E300", "Lê Hoàng C", "0977445566", "QUOTE_SENT", 20, "Chưa gán thợ", null, "Chưa xếp khoang", 4500000, null);
        addSampleOrder("WO-20260930-0085", "60A-777.77", "Honda CR-V 1.5 Turbo", "Phạm Văn D", "0938778899", "QUOTE_APPROVED", 30, "Lê Hoàng Long (THO-03)", "0988888805", "Khoang Nâng 03 (Cầu 4 trụ - Cân chỉnh Hunter 3D)", 1750000, null);
        addSampleOrder("WO-20260930-0082", "51H-555.55", "Ford Ranger Wildtrak", "Hoàng Minh E", "0918990011", "QUALITY_CHECK", 85, "Phạm Minh Tuấn (THO-04)", "0988888806", "Khoang Nâng 04 (Khu vực chẩn đoán điện & ECU)", 3200000, null);
        addSampleOrder("WO-20260929-0078", "51A-111.11", "Hyundai Tucson 2.0", "Vũ Đình F", "0988223344", "COMPLETED", 100, "Phạm Thợ Xưởng (THO-01)", "0988888803", "Bãi bàn giao xe", 1200000, null);
    }

    private static Map<String, Object> createTech(String id, String name, String role, String pin) {
        Map<String, Object> t = new HashMap<>();
        t.put("id", id);
        t.put("name", name);
        t.put("full_name", name);
        t.put("role", role);
        t.put("pin", pin);
        t.put("avatar", "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=160&auto=format&fit=crop&q=80");
        return t;
    }

    private static Map<String, Object> createPart(String code, String name, String cat, String unit, double price, int stock, String bin) {
        Map<String, Object> p = new HashMap<>();
        p.put("id", INVENTORY.size() + 1);
        p.put("part_code", code);
        p.put("part_name", name);
        p.put("name", name);
        p.put("category", cat);
        p.put("unit", unit);
        p.put("price", price);
        p.put("retail_price", price);
        p.put("cost_price", price * 0.7);
        p.put("stock_quantity", stock);
        p.put("stock", stock);
        p.put("location_bin", bin);
        p.put("location_rack", bin);
        return p;
    }

    private static void addSampleOrder(String code, String plate, String model, String custName, String custPhone, String status, int progress, String techName, String techId, String bay, double total, List<Map<String, Object>> customItems) {
        Map<String, Object> order = new HashMap<>();
        order.put("id", "db-card-" + code);
        order.put("order_code", code);
        order.put("license_plate", plate);
        order.put("vehicle_model", model);
        order.put("customer_name", custName);
        order.put("customer_phone", custPhone);
        order.put("phone", custPhone);
        order.put("current_status", status);
        order.put("status", status);
        order.put("progress_percent", progress);
        order.put("bay", bay);
        order.put("priority", "normal");
        order.put("estimated_finish_time", "Hôm nay 17:00");
        order.put("total_amount", total);
        order.put("payment_status", "COMPLETED".equals(status) ? "PAID" : "UNPAID");

        Map<String, Object> techObj = new HashMap<>();
        techObj.put("technician_name", techName);
        techObj.put("technician_id", techId);
        order.put("assigned_technicians", List.of(techObj));
        order.put("assigned_technician", Map.of("full_name", techName, "id", techId != null ? techId : ""));

        // Items
        List<Map<String, Object>> items = new ArrayList<>();
        if (customItems != null && !customItems.isEmpty()) {
            items.addAll(customItems);
        } else {
            Map<String, Object> item1 = new HashMap<>();
            item1.put("id", "it-1");
            item1.put("name", "Bảo dưỡng định kỳ & Kiểm tra tổng quát");
            item1.put("item_name", "Bảo dưỡng định kỳ & Kiểm tra tổng quát");
            item1.put("type", "LABOR");
            item1.put("item_type", "LABOR");
            item1.put("quantity", 1);
            item1.put("price", 300000);
            item1.put("unit_price", 300000);
            item1.put("total", 300000);
            item1.put("total_price", 300000);
            item1.put("status", progress >= 50 ? "done" : "pending");
            items.add(item1);

            Map<String, Object> item2 = new HashMap<>();
            item2.put("id", "it-2");
            item2.put("part_code", "OIL-MOBIL-5W30");
            item2.put("name", "Dầu nhớt Mobil 1 5W-30 (Can 4L)");
            item2.put("item_name", "Dầu nhớt Mobil 1 5W-30 (Can 4L)");
            item2.put("type", "PART");
            item2.put("item_type", "PART");
            item2.put("quantity", 1);
            item2.put("price", 850000);
            item2.put("unit_price", 850000);
            item2.put("total", 850000);
            item2.put("total_price", 850000);
            item2.put("status", progress >= 50 ? "done" : "pending");
            items.add(item2);
        }

        order.put("items", items);
        order.put("tasks", items);

        // Trường estimate phục vụ Báo giá & Khách hàng portal
        Map<String, Object> estimate = new HashMap<>();
        estimate.put("total_amount", total);
        estimate.put("pretax_amount", total * 0.92);
        estimate.put("vat_amount", total * 0.08);
        estimate.put("approval_status", ("QUOTE_SENT".equals(status) || "DRAFT".equals(status) || "INSPECTION".equals(status)) ? "PENDING" : "APPROVED");
        estimate.put("items", items);
        order.put("estimate", estimate);

        // Timeline lịch sử trạng thái
        List<Map<String, Object>> timeline = new ArrayList<>();
        timeline.add(Map.of("status", "INSPECTION", "updated_by", "Vũ Quang Tùng (Cố Vấn)", "note", "Tiếp nhận xe và chẩn đoán tổng quát", "updated_at", "08:30"));
        if (!"INSPECTION".equals(status)) {
            timeline.add(Map.of("status", "QUOTE_SENT", "updated_by", "Vũ Quang Tùng (Cố Vấn)", "note", "Gửi báo giá tới khách hàng", "updated_at", "09:00"));
        }
        if (!"INSPECTION".equals(status) && !"QUOTE_SENT".equals(status)) {
            timeline.add(Map.of("status", "QUOTE_APPROVED", "updated_by", custName, "note", "Khách hàng duyệt báo giá trực tuyến", "updated_at", "09:15"));
            timeline.add(Map.of("status", "IN_PROGRESS", "updated_by", techName, "note", "KTV bắt đầu thi công tại khoang", "updated_at", "09:45"));
        }
        if ("COMPLETED".equals(status)) {
            timeline.add(Map.of("status", "COMPLETED", "updated_by", "Lê Quản Đốc", "note", "Nghiệm thu KCS và bàn giao xe", "updated_at", "16:00"));
        }
        order.put("workflow_timeline", timeline);

        // Ảnh chụp nghiệm thu
        List<Map<String, Object>> photos = new ArrayList<>();
        photos.add(Map.of(
            "id", "p1",
            "url", "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80",
            "caption", "Kiểm tra hiện trường má phanh mòn trước khi thay",
            "uploaded_at", "09:30"
        ));
        photos.add(Map.of(
            "id", "p2",
            "url", "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80",
            "caption", "Má phanh mới đã lắp ráp và siết ốc chuẩn lực",
            "uploaded_at", "11:20"
        ));
        order.put("inspection_photos", photos);

        WORK_ORDERS.put(code, order);
    }

    static class RootHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange ex) throws IOException {
            // Cấu hình CORS Header
            ex.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            ex.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
            ex.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Origin, X-Requested-With");

            String method = ex.getRequestMethod().toUpperCase();
            if ("OPTIONS".equals(method)) {
                ex.sendResponseHeaders(204, -1);
                return;
            }

            String path = ex.getRequestURI().getPath();
            String query = ex.getRequestURI().getQuery();
            String body = readBody(ex.getRequestBody());

            System.out.println("[" + method + "] " + path + (query != null ? "?" + query : ""));

            try {
                // 1. HEALTH CHECK
                if (path.equals("/health") || path.equals("/api/v1/health")) {
                    sendJson(ex, 200, "{\"success\":true,\"message\":\"Backend 2 Java is Running!\"}");
                    return;
                }

                // 2. AUTH: DEV LOGIN
                if (path.endsWith("/auth/dev-login")) {
                    String role = extractJsonString(body, "role", "SERVICE_ADVISOR");
                    String phone = extractJsonString(body, "phone_number", "0988888801");
                    String name = "Cán Bộ " + role;
                    if ("CUSTOMER".equals(role)) name = "Khách Hàng Minh Thảo";
                    sendJson(ex, 200, jsonSuccess(
                        "\"accessToken\":\"mock_token_" + role + "\"," +
                        "\"user\":{\"id\":\"1\",\"full_name\":\"" + name + "\",\"phone_number\":\"" + phone + "\",\"role\":\"" + role + "\",\"email\":\"demo@hihihaha.vn\"}"
                    ));
                    return;
                }

                // 3. AUTH: STAFF LOGIN
                if (path.endsWith("/auth/staff-login")) {
                    String phone = extractJsonString(body, "phone_number", "");
                    String role = "SERVICE_ADVISOR";
                    String name = "Vũ Quang Tùng (Cố Vấn)";

                    if ("0797526990".equals(phone)) { role = "OWNER"; name = "Nguyễn Tài Lợi (Giám Đốc)"; }
                    else if ("0988888802".equals(phone)) { role = "WORKSHOP_MANAGER"; name = "Lê Quản Đốc"; }
                    else if ("0988888803".equals(phone)) { role = "TECHNICIAN"; name = "Phạm Thợ Xưởng"; }
                    else if ("0988888804".equals(phone)) { role = "TECHNICIAN"; name = "Trần Văn Cường"; }
                    else if ("0988888805".equals(phone)) { role = "TECHNICIAN"; name = "Lê Hoàng Long"; }
                    else if ("0988888806".equals(phone)) { role = "TECHNICIAN"; name = "Phạm Minh Tuấn"; }

                    sendJson(ex, 200, jsonSuccess(
                        "\"accessToken\":\"staff_jwt_" + phone + "\"," +
                        "\"user\":{\"id\":\"" + phone + "\",\"full_name\":\"" + name + "\",\"phone_number\":\"" + phone + "\",\"role\":\"" + role + "\",\"email\":\"staff@hihihaha.vn\"}"
                    ));
                    return;
                }

                // 4. AUTH: LOOKUP CUSTOMER
                if (path.endsWith("/auth/lookup-customer") || path.endsWith("/auth/customer-lookup")) {
                    sendJson(ex, 200, jsonSuccess(
                        "\"found\":true,\"full_name\":\"Minh Thảo\",\"email\":\"minhthao@gmail.com\",\"has_email\":true,\"vehicle_model\":\"Toyota Camry 2.5Q\""
                    ));
                    return;
                }

                // 5. AUTH: REQUEST OTP & VERIFY OTP
                if (path.endsWith("/auth/request-otp")) {
                    sendJson(ex, 200, jsonSuccess("\"message\":\"Mã OTP 123456 đã được gửi đến email!\""));
                    return;
                }
                if (path.endsWith("/auth/verify-otp")) {
                    String plate = extractJsonString(body, "license_plate", "51K-888.88");
                    String phone = extractJsonString(body, "phone_number", "0912345678");
                    sendJson(ex, 200, jsonSuccess(
                        "\"accessToken\":\"cust_jwt_token\"," +
                        "\"user\":{\"id\":\"cust-01\",\"full_name\":\"Minh Thảo\",\"phone_number\":\"" + phone + "\",\"role\":\"CUSTOMER\",\"license_plate\":\"" + plate + "\"}"
                    ));
                    return;
                }

                // 6. WORK ORDERS: MY ORDERS
                if (path.endsWith("/work-orders/my-orders")) {
                    sendJson(ex, 200, "{\"success\":true,\"data\":" + toJsonArray(new ArrayList<>(WORK_ORDERS.values())) + "}");
                    return;
                }

                // 7. WORK ORDERS: TECHNICIANS WORKLOAD
                if (path.endsWith("/work-orders/technicians-workload")) {
                    List<Map<String, Object>> workloadList = new ArrayList<>();
                    for (Map<String, Object> tech : TECHNICIANS) {
                        Map<String, Object> wl = new HashMap<>(tech);
                        wl.put("current_orders_count", 1);
                        wl.put("max_orders", 3);
                        wl.put("is_full", false);
                        wl.put("orders", List.of());
                        workloadList.add(wl);
                    }
                    sendJson(ex, 200, "{\"success\":true,\"data\":" + toJsonArray(workloadList) + "}");
                    return;
                }

                // 8. WORK ORDERS: TECHNICIAN DASHBOARD
                if (path.contains("/work-orders/technicians/") && path.endsWith("/dashboard")) {
                    List<Map<String, Object>> active = new ArrayList<>(WORK_ORDERS.values().stream().filter(o -> !"COMPLETED".equals(o.get("current_status"))).toList());
                    List<Map<String, Object>> completed = new ArrayList<>(WORK_ORDERS.values().stream().filter(o -> "COMPLETED".equals(o.get("current_status"))).toList());
                    String resp = "{\"success\":true,\"data\":{" +
                        "\"active_orders\":" + toJsonArray(active) + "," +
                        "\"completed_orders\":" + toJsonArray(completed) + "," +
                        "\"waiting_queue\":[]," +
                        "\"stats\":{\"active_count\":" + active.size() + ",\"max_allowed\":3,\"total_completed\":" + completed.size() + ",\"today_completed\":" + completed.size() + "}" +
                        "}}";
                    sendJson(ex, 200, resp);
                    return;
                }

                // 9. WORK ORDERS: APPROVE ESTIMATE & REJECT ESTIMATE
                if (path.contains("/work-orders/") && path.endsWith("/approve-estimate")) {
                    String[] segments = path.split("/");
                    String orderCode = segments[segments.length - 2];
                    Map<String, Object> order = WORK_ORDERS.get(orderCode);
                    if (order != null) {
                        order.put("current_status", "IN_PROGRESS");
                        order.put("status", "IN_PROGRESS");
                        if (order.get("estimate") instanceof Map) {
                            ((Map<String, Object>) order.get("estimate")).put("approval_status", "APPROVED");
                        }
                    }
                    sendJson(ex, 200, "{\"success\":true,\"message\":\"Ký duyệt báo giá thành công! Lệnh đã được chuyển tới xưởng.\",\"data\":" + (order != null ? toJsonObject(order) : "{}") + "}");
                    return;
                }

                if (path.contains("/work-orders/") && path.endsWith("/reject-estimate")) {
                    String[] segments = path.split("/");
                    String orderCode = segments[segments.length - 2];
                    Map<String, Object> order = WORK_ORDERS.get(orderCode);
                    if (order != null) {
                        order.put("current_status", "QUOTE_SENT");
                        if (order.get("estimate") instanceof Map) {
                            ((Map<String, Object>) order.get("estimate")).put("approval_status", "REJECTED");
                        }
                    }
                    sendJson(ex, 200, "{\"success\":true,\"message\":\"Đã ghi nhận yêu cầu điều chỉnh báo giá!\",\"data\":" + (order != null ? toJsonObject(order) : "{}") + "}");
                    return;
                }

                // 10. WORK ORDERS: ESTIMATE UPDATE / PROGRESS / STATUS / ASSIGN / DETAIL
                if (path.contains("/work-orders/")) {
                    String[] segments = path.split("/");
                    String orderCode = segments[segments.length - 1];

                    // UPDATE ESTIMATE: PUT /work-orders/:code/estimate
                    if (path.endsWith("/estimate")) {
                        orderCode = segments[segments.length - 2];
                        Map<String, Object> order = WORK_ORDERS.get(orderCode);
                        if (order != null) {
                            List<Map<String, Object>> parsedItems = parseEstimateItems(body);
                            if (!parsedItems.isEmpty()) {
                                double newTotal = 0;
                                for (Map<String, Object> it : parsedItems) {
                                    Number pr = (Number) it.get("price");
                                    Number qt = (Number) it.get("quantity");
                                    if (pr != null && qt != null) {
                                        newTotal += pr.doubleValue() * qt.doubleValue();
                                    }
                                }
                                order.put("items", parsedItems);
                                order.put("tasks", parsedItems);
                                order.put("total_amount", newTotal);
                                if (order.get("estimate") instanceof Map) {
                                    Map<String, Object> est = (Map<String, Object>) order.get("estimate");
                                    est.put("items", parsedItems);
                                    est.put("total_amount", newTotal);
                                    est.put("pretax_amount", newTotal * 0.92);
                                    est.put("vat_amount", newTotal * 0.08);
                                }
                            }
                        }
                        sendJson(ex, 200, "{\"success\":true,\"message\":\"Cập nhật báo giá thành công\",\"data\":" + (order != null ? toJsonObject(order) : "{}") + "}");
                        return;
                    }

                    // UPDATE PROGRESS: /work-orders/:code/progress
                    if (path.endsWith("/progress")) {
                        orderCode = segments[segments.length - 2];
                        Map<String, Object> order = WORK_ORDERS.get(orderCode);
                        if (order != null) {
                            int pct = extractJsonInt(body, "percent_complete", 75);
                            order.put("progress_percent", pct);
                        }
                        sendJson(ex, 200, "{\"success\":true,\"message\":\"Cập nhật tiến độ thành công\"}");
                        return;
                    }

                    // UPDATE STATUS: /work-orders/:code/status
                    if (path.endsWith("/status")) {
                        orderCode = segments[segments.length - 2];
                        String nextStatus = extractJsonString(body, "next_status", "IN_PROGRESS");
                        Map<String, Object> order = WORK_ORDERS.get(orderCode);
                        if (order != null) {
                            order.put("current_status", nextStatus);
                            order.put("status", nextStatus);
                        }
                        sendJson(ex, 200, "{\"success\":true,\"message\":\"Cập nhật trạng thái thành công\"}");
                        return;
                    }

                    // ASSIGN WORK ORDER: /work-orders/:code/assign
                    if (path.endsWith("/assign")) {
                        orderCode = segments[segments.length - 2];
                        String techName = extractJsonString(body, "technician_name", "Phạm Thợ Xưởng");
                        String bay = extractJsonString(body, "bay", "Khoang Nâng 01");
                        Map<String, Object> order = WORK_ORDERS.get(orderCode);
                        if (order != null) {
                            order.put("bay", bay);
                            order.put("assigned_technician", Map.of("full_name", techName));
                            order.put("assigned_technicians", List.of(Map.of("technician_name", techName)));
                        }
                        sendJson(ex, 200, "{\"success\":true,\"message\":\"Phân công thợ thành công\"}");
                        return;
                    }

                    // GET WORK ORDER DETAIL: /work-orders/:code
                    Map<String, Object> order = WORK_ORDERS.get(orderCode);
                    if (order == null && !WORK_ORDERS.isEmpty()) {
                        order = WORK_ORDERS.values().iterator().next();
                    }
                    if (order != null) {
                        sendJson(ex, 200, "{\"success\":true,\"data\":" + toJsonObject(order) + "}");
                        return;
                    }
                }

                // 11. CREATE WORK ORDER: POST /work-orders
                if (path.endsWith("/work-orders") && "POST".equals(method)) {
                    String code = "WO-" + System.currentTimeMillis() % 100000;
                    String plate = extractJsonString(body, "license_plate", "51K-999.99");
                    String phone = extractJsonString(body, "customer_phone", "0900000000");
                    String custName = extractJsonString(body, "customer_name", "Khách Hàng Mới");
                    String model = extractJsonString(body, "vehicle_model", "Xe Khách Hàng");

                    List<Map<String, Object>> parsedItems = parseEstimateItems(body);
                    double total = 0;
                    for (Map<String, Object> it : parsedItems) {
                        Number pr = (Number) it.get("price");
                        Number qt = (Number) it.get("quantity");
                        if (pr != null && qt != null) total += pr.doubleValue() * qt.doubleValue();
                    }
                    if (total == 0) total = 1000000;

                    addSampleOrder(code, plate, model, custName, phone, "INSPECTION", 10, "Chưa gán thợ", null, "Khu vực tiếp nhận", total, parsedItems);
                    Map<String, Object> created = WORK_ORDERS.get(code);
                    sendJson(ex, 201, "{\"success\":true,\"data\":" + toJsonObject(created) + "}");
                    return;
                }

                // 12. VEHICLES: GET /vehicles
                if (path.contains("/vehicles")) {
                    List<Map<String, Object>> vehicles = new ArrayList<>();
                    for (Map<String, Object> wo : WORK_ORDERS.values()) {
                        vehicles.add(Map.of(
                            "license_plate", wo.get("license_plate"),
                            "model", wo.get("vehicle_model"),
                            "customer_name", wo.get("customer_name"),
                            "customer_phone", wo.get("customer_phone")
                        ));
                    }
                    sendJson(ex, 200, "{\"success\":true,\"data\":" + toJsonArray(vehicles) + "}");
                    return;
                }

                // 13. INVENTORY: ADJUSTMENTS (KIỂM KÊ KHO) & GET/POST INVENTORY
                if (path.contains("/inventory/adjustments") && "POST".equals(method)) {
                    String pCode = extractJsonString(body, "part_code", "");
                    int newQty = extractJsonInt(body, "new_quantity", 50);
                    for (Map<String, Object> p : INVENTORY) {
                        if (pCode.equals(p.get("part_code"))) {
                            p.put("stock_quantity", newQty);
                            p.put("stock", newQty);
                            break;
                        }
                    }
                    sendJson(ex, 200, "{\"success\":true,\"message\":\"Cập nhật kiểm kê tồn kho thành công!\"}");
                    return;
                }

                if (path.contains("/inventory") && "POST".equals(method)) {
                    String code = extractJsonString(body, "part_code", "PART-" + System.currentTimeMillis() % 1000);
                    String name = extractJsonString(body, "part_name", "Phụ tùng mới");
                    String cat = extractJsonString(body, "category", "Linh kiện phụ trợ");
                    String unit = extractJsonString(body, "unit", "Cái");
                    double price = extractJsonDouble(body, "price", 500000);
                    int qty = extractJsonInt(body, "stock_quantity", 10);
                    String bin = extractJsonString(body, "location_rack", "KHO-A1");
                    INVENTORY.add(createPart(code, name, cat, unit, price, qty, bin));
                    sendJson(ex, 201, "{\"success\":true,\"message\":\"Thêm phụ tùng mới thành công!\"}");
                    return;
                }

                if (path.contains("/inventory")) {
                    sendJson(ex, 200, "{\"success\":true,\"data\":{\"items\":" + toJsonArray(INVENTORY) + ",\"total\":" + INVENTORY.size() + ",\"page\":1,\"limit\":15}}");
                    return;
                }

                // 14. BAYS: GET /bays
                if (path.contains("/bays")) {
                    sendJson(ex, 200, "{\"success\":true,\"data\":" + toJsonArrayString(BAYS) + "}");
                    return;
                }

                // 15. PAYMENTS: CONFIRM & CREATE PAYMENT URL
                if (path.contains("/payments/confirm")) {
                    String orderCode = extractJsonString(body, "order_code", "");
                    Map<String, Object> order = WORK_ORDERS.get(orderCode);
                    if (order != null) {
                        order.put("current_status", "COMPLETED");
                        order.put("status", "COMPLETED");
                        order.put("payment_status", "PAID");
                        order.put("progress_percent", 100);
                    }
                    sendJson(ex, 200, "{\"success\":true,\"message\":\"Xác nhận thanh toán thành công!\"}");
                    return;
                }
                if (path.contains("/payments/create-payment-url")) {
                    sendJson(ex, 200, "{\"success\":true,\"data\":{\"payment_url\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?mock=true\",\"amount\":2580000}}");
                    return;
                }

                // 16. AI DIAGNOSE
                if (path.contains("/ai/diagnose")) {
                    sendJson(ex, 200, "{\"success\":true,\"data\":{\"diagnosis\":\"Má phanh bị mòn và đĩa phanh có rãnh xước nhẹ. Cần vệ sinh và thay má phanh mới.\",\"recommended_parts\":[\"BRK-PAD-FR-CAM\",\"OIL-MOBIL-5W30\"]}}");
                    return;
                }

                // DEFAULT FALLBACK
                sendJson(ex, 200, "{\"success\":true,\"message\":\"API Endpoint OK\",\"data\":[]}");
            } catch (Exception e) {
                e.printStackTrace();
                sendJson(ex, 500, "{\"success\":false,\"message\":\"Internal Server Error: " + e.getMessage() + "\"}");
            }
        }

        private void sendJson(HttpExchange ex, int code, String json) throws IOException {
            byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
            ex.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
            ex.sendResponseHeaders(code, bytes.length);
            try (OutputStream os = ex.getResponseBody()) {
                os.write(bytes);
            }
        }

        private String readBody(InputStream is) throws IOException {
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            byte[] data = new byte[1024];
            int nRead;
            while ((nRead = is.read(data, 0, data.length)) != -1) {
                buffer.write(data, 0, nRead);
            }
            return buffer.toString(StandardCharsets.UTF_8);
        }

        private String jsonSuccess(String inner) {
            return "{\"success\":true,\"statusCode\":200,\"message\":\"Thao tác thành công\",\"data\":{" + inner + "}}";
        }

        private String extractJsonString(String json, String key, String def) {
            String search = "\"" + key + "\"";
            int idx = json.indexOf(search);
            if (idx == -1) return def;
            int colon = json.indexOf(":", idx + search.length());
            if (colon == -1) return def;
            int startQuote = json.indexOf("\"", colon + 1);
            if (startQuote == -1) return def;
            int endQuote = json.indexOf("\"", startQuote + 1);
            if (endQuote == -1) return def;
            return json.substring(startQuote + 1, endQuote);
        }

        private int extractJsonInt(String json, String key, int def) {
            String search = "\"" + key + "\"";
            int idx = json.indexOf(search);
            if (idx == -1) return def;
            int colon = json.indexOf(":", idx + search.length());
            if (colon == -1) return def;
            StringBuilder sb = new StringBuilder();
            for (int i = colon + 1; i < json.length(); i++) {
                char c = json.charAt(i);
                if (Character.isDigit(c)) sb.append(c);
                else if (!sb.isEmpty()) break;
            }
            try { return Integer.parseInt(sb.toString()); } catch (Exception e) { return def; }
        }

        private double extractJsonDouble(String json, String key, double def) {
            String search = "\"" + key + "\"";
            int idx = json.indexOf(search);
            if (idx == -1) return def;
            int colon = json.indexOf(":", idx + search.length());
            if (colon == -1) return def;
            StringBuilder sb = new StringBuilder();
            for (int i = colon + 1; i < json.length(); i++) {
                char c = json.charAt(i);
                if (Character.isDigit(c) || c == '.') sb.append(c);
                else if (!sb.isEmpty()) break;
            }
            try { return Double.parseDouble(sb.toString()); } catch (Exception e) { return def; }
        }

        // Trích xuất danh sách items từ JSON body
        private List<Map<String, Object>> parseEstimateItems(String json) {
            List<Map<String, Object>> list = new ArrayList<>();
            int itemsIdx = json.indexOf("\"items\"");
            if (itemsIdx == -1) return list;
            int startBracket = json.indexOf("[", itemsIdx);
            if (startBracket == -1) return list;
            int endBracket = json.lastIndexOf("]");
            if (endBracket == -1 || endBracket <= startBracket) return list;

            String arrayContent = json.substring(startBracket + 1, endBracket);
            String[] objects = arrayContent.split("\\},\\s*\\{");
            int i = 1;
            for (String raw : objects) {
                String clean = raw.replace("{", "").replace("}", "");
                String name = extractJsonString(clean, "name", "Hạng mục " + i);
                String code = extractJsonString(clean, "part_code", "PART-" + i);
                String type = extractJsonString(clean, "type", "PART");
                int qty = extractJsonInt(clean, "quantity", 1);
                double price = extractJsonDouble(clean, "unit_price", 200000);
                if (price == 0) price = extractJsonDouble(clean, "unitPrice", 200000);

                Map<String, Object> item = new HashMap<>();
                item.put("id", "it-" + i);
                item.put("name", name);
                item.put("item_name", name);
                item.put("part_code", code);
                item.put("code", code);
                item.put("type", type);
                item.put("item_type", type);
                item.put("quantity", qty);
                item.put("price", price);
                item.put("unit_price", price);
                item.put("total", price * qty);
                item.put("total_price", price * qty);
                item.put("status", "pending");
                list.add(item);
                i++;
            }
            return list;
        }

        private String toJsonObject(Map<String, Object> map) {
            StringBuilder sb = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<String, Object> e : map.entrySet()) {
                if (!first) sb.append(",");
                first = false;
                sb.append("\"").append(e.getKey()).append("\":");
                Object val = e.getValue();
                if (val == null) sb.append("null");
                else if (val instanceof String) sb.append("\"").append(escapeJson((String) val)).append("\"");
                else if (val instanceof Number || val instanceof Boolean) sb.append(val);
                else if (val instanceof List) sb.append(toJsonArray((List<?>) val));
                else if (val instanceof Map) sb.append(toJsonObject((Map<String, Object>) val));
                else sb.append("\"").append(escapeJson(val.toString())).append("\"");
            }
            sb.append("}");
            return sb.toString();
        }

        private String toJsonArray(List<?> list) {
            StringBuilder sb = new StringBuilder("[");
            boolean first = true;
            for (Object item : list) {
                if (!first) sb.append(",");
                first = false;
                if (item instanceof Map) sb.append(toJsonObject((Map<String, Object>) item));
                else if (item instanceof String) sb.append("\"").append(escapeJson((String) item)).append("\"");
                else sb.append(item);
            }
            sb.append("]");
            return sb.toString();
        }

        private String toJsonArrayString(List<String> list) {
            StringBuilder sb = new StringBuilder("[");
            boolean first = true;
            for (String s : list) {
                if (!first) sb.append(",");
                first = false;
                sb.append("\"").append(escapeJson(s)).append("\"");
            }
            sb.append("]");
            return sb.toString();
        }

        private String escapeJson(String s) {
            if (s == null) return "";
            return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
        }
    }
}
