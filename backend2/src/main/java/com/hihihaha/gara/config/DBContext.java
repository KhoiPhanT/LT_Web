package com.hihihaha.gara.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBContext {
    private static final String HOST = System.getenv("DB_HOST") != null ? System.getenv("DB_HOST") : "localhost";
    private static final String PORT = System.getenv("DB_PORT") != null ? System.getenv("DB_PORT") : "3306";
    private static final String DBNAME = System.getenv("DB_NAME") != null ? System.getenv("DB_NAME") : "hihihaha_db";
    private static final String USER = System.getenv("DB_USER") != null ? System.getenv("DB_USER") : "root";
    private static final String PASS = System.getenv("DB_PASSWORD") != null ? System.getenv("DB_PASSWORD") : "root";

    private static final String URL = "jdbc:mysql://" + HOST + ":" + PORT + "/" + DBNAME + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8";

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASS);
    }
}
