package com.onlinecourses.OnlineCourseSystem.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@RestController
public class TestController {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Test basic database connection
    @GetMapping("/api/db-test")
    public String testDatabaseConnection() {
        try {
            // Test if we can get a connection
            try (Connection connection = dataSource.getConnection()) {
                if (connection.isValid(2)) {
                    return "✅ Database connection successful! MySQL is connected!";
                } else {
                    return "❌ Database connection is invalid";
                }
            }
        } catch (SQLException e) {
            return "❌ Database connection failed: " + e.getMessage();
        }
    }

    // Get database information
    @GetMapping("/api/db-info")
    public String getDatabaseInfo() {
        try {
            // Get MySQL version
            String version = jdbcTemplate.queryForObject("SELECT VERSION()", String.class);
            // Get current database name
            String database = jdbcTemplate.queryForObject("SELECT DATABASE()", String.class);
            
            return String.format("""
                ✅ Database Information:
                - MySQL Version: %s
                - Database Name: %s
                - Connection: Active
                """, version, database);
                
        } catch (Exception e) {
            return "❌ Error getting database info: " + e.getMessage();
        }
    }

    // Test simple SQL query
    @GetMapping("/api/db-query")
    public String testQuery() {
        try {
            String result = jdbcTemplate.queryForObject("SELECT CONCAT('Hello from MySQL! ', NOW())", String.class);
            return "✅ Query executed: " + result;
        } catch (Exception e) {
            return "❌ Query failed: " + e.getMessage();
        }
    }

    // Simple home endpoint
    @GetMapping("/")
    public String home() {
        return """
            <html>
            <body>
                <h1>🚀 Online Course System - Backend Running!</h1>
                <p>Spring Boot + MySQL + Java 21</p>
                <ul>
                    <li><a href="/api/db-test">Test Database Connection</a></li>
                    <li><a href="/api/db-info">Database Information</a></li>
                    <li><a href="/api/db-query">Test SQL Query</a></li>
                    <li><a href="/api/users/test">Test User Controller</a></li>
                </ul>
            </body>
            </html>
            """;
    }
}