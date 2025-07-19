package com.codearena.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Test controller for basic backend functionality verification.
 * Used to test if the backend is running correctly.
 */
@RestController
@RequestMapping("/api/test")
public class TestController {

    /**
     * Basic health check endpoint.
     * @return Simple status message
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "CodeArena Backend is running");
        response.put("timestamp", System.currentTimeMillis());
        response.put("version", "1.0.0");
        return ResponseEntity.ok(response);
    }

    /**
     * Test endpoint that requires authentication.
     * @return Protected resource message
     */
    @GetMapping("/protected")
    public ResponseEntity<Map<String, Object>> protectedEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "This is a protected endpoint");
        response.put("status", "authenticated");
        return ResponseEntity.ok(response);
    }

    /**
     * Test endpoint for checking Firebase configuration.
     * @return Firebase configuration status
     */
    @GetMapping("/firebase-status")
    public ResponseEntity<Map<String, Object>> firebaseStatus() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Try to get Firebase app instance
            com.google.firebase.FirebaseApp app = com.google.firebase.FirebaseApp.getInstance();
            response.put("firebaseStatus", "CONFIGURED");
            response.put("projectId", app.getOptions().getProjectId());
            response.put("message", "Firebase is properly configured");
        } catch (Exception e) {
            response.put("firebaseStatus", "NOT_CONFIGURED");
            response.put("error", e.getMessage());
            response.put("message", "Firebase configuration issue");
        }
        
        return ResponseEntity.ok(response);
    }
} 