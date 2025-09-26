package com.onlinecourses.OnlineCourseSystem;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class OnlineCourseSystemApplicationTests {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void contextLoads() {
        // This test will pass if the application context loads successfully
        assertNotNull(dataSource, "DataSource should be loaded");
        assertNotNull(jdbcTemplate, "JdbcTemplate should be loaded");
    }

    @Test
    void testDatabaseConnection() {
        try (Connection connection = dataSource.getConnection()) {
            assertTrue(connection.isValid(2), "Database connection should be valid");
            assertFalse(connection.isClosed(), "Database connection should be open");
            
            // Test a simple query
            String result = jdbcTemplate.queryForObject("SELECT 'Database Connected!'", String.class);
            assertEquals("Database Connected!", result);
            
        } catch (SQLException e) {
            fail("Database connection failed: " + e.getMessage());
        }
    }

    @Test
    void testDatabaseProperties() {
        try {
            String url = jdbcTemplate.queryForObject("SELECT DATABASE()", String.class);
            String version = jdbcTemplate.queryForObject("SELECT VERSION()", String.class);
            
            assertNotNull(url, "Database name should not be null");
            assertNotNull(version, "MySQL version should not be null");
            
            System.out.println("Connected to database: " + url);
            System.out.println("MySQL Version: " + version);
            
        } catch (Exception e) {
            fail("Error getting database properties: " + e.getMessage());
        }
    }
}