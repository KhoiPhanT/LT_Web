package com.hihihaha.gara.servlet;

import com.hihihaha.gara.dao.WorkshopBayDAO;
import com.hihihaha.gara.model.WorkshopBay;
import com.hihihaha.gara.util.ResponseUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

@WebServlet("/api/v1/bays/*")
public class WorkshopBayServlet extends HttpServlet {
    private final WorkshopBayDAO bayDAO = new WorkshopBayDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        List<WorkshopBay> list = bayDAO.getAll();
        ResponseUtil.sendSuccess(resp, list);
    }
}
