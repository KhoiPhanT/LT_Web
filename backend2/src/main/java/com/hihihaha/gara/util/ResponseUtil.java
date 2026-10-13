package com.hihihaha.gara.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

public class ResponseUtil {
    private static final ObjectMapper mapper = new ObjectMapper();

    static {
        mapper.registerModule(new JavaTimeModule());
    }

    public static void sendSuccess(HttpServletResponse response, Object data, String message, int statusCode) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(statusCode);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("statusCode", statusCode);
        result.put("message", message);
        result.put("data", data);

        PrintWriter out = response.getWriter();
        mapper.writeValue(out, result);
        out.flush();
    }

    public static void sendSuccess(HttpServletResponse response, Object data) throws IOException {
        sendSuccess(response, data, "Thao tác thành công", HttpServletResponse.SC_OK);
    }

    public static void sendError(HttpServletResponse response, String message, int statusCode) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(statusCode);

        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("statusCode", statusCode);
        result.put("message", message);

        PrintWriter out = response.getWriter();
        mapper.writeValue(out, result);
        out.flush();
    }

    public static ObjectMapper getMapper() {
        return mapper;
    }
}
