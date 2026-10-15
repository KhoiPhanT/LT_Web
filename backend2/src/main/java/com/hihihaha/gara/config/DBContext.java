package com.hihihaha.gara.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/** Phụ trách phần mới: Khởi. Kết nối JDBC đến CSDL demo quan hệ. */
public final class DBContext {
    private DBContext() {}
    public static Connection getConnection() throws SQLException {
        // Khởi: Tomcat cô lập classloader của WAR; đăng ký JDBC driver trong classloader ứng dụng.
        try { Class.forName("com.mysql.cj.jdbc.Driver"); }
        catch (ClassNotFoundException e) { throw new SQLException("Thiếu MySQL Connector/J trong WAR", e); }
        String host = System.getenv().getOrDefault("DB_HOST", "127.0.0.1");
        String port = System.getenv().getOrDefault("DB_PORT", "3307");
        String name = System.getenv().getOrDefault("DB_NAME", "hihihaha_simple_db");
        String user = System.getenv().getOrDefault("DB_USER", "root");
        String pass = System.getenv().getOrDefault("DB_PASSWORD", "");
        String url = "jdbc:mysql://" + host + ":" + port + "/" + name + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8";
        return DriverManager.getConnection(url, user, pass);
    }
}
