package com.codearena.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Global exception handler for validation and custom errors.
 * Uses a standard error response format for all errors.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    /**
     * Standard error response structure.
     */
    private Map<String, Object> errorBody(HttpStatus status, String message, String path) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        body.put("path", path);
        return body;
    }

    /**
     * Handles validation errors.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );
        return new ResponseEntity<>(errorBody(HttpStatus.BAD_REQUEST, errors.toString(), request.getRequestURI()), HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles authentication failures (bad credentials).
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
        return new ResponseEntity<>(errorBody(HttpStatus.UNAUTHORIZED, "Invalid username or password", request.getRequestURI()), HttpStatus.UNAUTHORIZED);
    }

    /**
     * Handles access denied (forbidden) errors.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        return new ResponseEntity<>(errorBody(HttpStatus.FORBIDDEN, "Access denied", request.getRequestURI()), HttpStatus.FORBIDDEN);
    }

    /**
     * Handles 404 not found errors.
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NoHandlerFoundException ex, HttpServletRequest request) {
        return new ResponseEntity<>(errorBody(HttpStatus.NOT_FOUND, "Resource not found", request.getRequestURI()), HttpStatus.NOT_FOUND);
    }

    /**
     * Handles all other exceptions.
     * Logs the exception for debugging.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex, HttpServletRequest request) {
        ex.printStackTrace(); // Log stack trace for debugging
        return new ResponseEntity<>(errorBody(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), request.getRequestURI()), HttpStatus.INTERNAL_SERVER_ERROR);
    }
} 