package com.codearena.backend.exception;

import com.codearena.backend.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;

/**
 * Global exception handler for consistent error responses across the application.
 * Provides standardized error handling and logging for all exceptions.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Handles validation exceptions from @Valid annotations.
     * @param ex Validation exception
     * @param request Web request for context
     * @return Standardized error response
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(
            MethodArgumentNotValidException ex, WebRequest request) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.warn("Validation failed for request: {}", request.getDescription(false));
        
        ApiResponse<Map<String, String>> response = ApiResponse.error(
            "Validation failed", 
            "Please check the provided data and try again"
        );
        response.setData(errors);
        response.setPath(request.getDescription(false));
        
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Handles custom API exceptions.
     * @param ex Custom API exception
     * @param request Web request for context
     * @return Standardized error response
     */
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Void>> handleApiException(ApiException ex, WebRequest request) {
        log.error("API Exception: {} - {}", ex.getErrorCode(), ex.getMessage(), ex);
        
        ApiResponse<Void> response = ApiResponse.error(ex.getUserMessage(), ex.getErrorCode());
        response.setPath(request.getDescription(false));
        
        return ResponseEntity.status(ex.getStatus()).body(response);
    }

    /**
     * Handles authentication exceptions.
     * @param ex Bad credentials exception
     * @param request Web request for context
     * @return Standardized error response
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex, WebRequest request) {
        log.warn("Authentication failed: {}", ex.getMessage());
        
        ApiResponse<Void> response = ApiResponse.error("Invalid credentials", "AUTH_FAILED");
        response.setPath(request.getDescription(false));
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    /**
     * Handles Firebase authentication exceptions.
     * @param ex Firebase auth exception
     * @param request Web request for context
     * @return Standardized error response
     */
    @ExceptionHandler(com.google.firebase.auth.FirebaseAuthException.class)
    public ResponseEntity<ApiResponse<Void>> handleFirebaseAuthException(
            com.google.firebase.auth.FirebaseAuthException ex, WebRequest request) {
        
        log.error("Firebase authentication error: {}", ex.getMessage(), ex);
        
        String userMessage = "Authentication failed. Please try again.";
        if (ex.getAuthErrorCode() != null) {
            switch (ex.getAuthErrorCode().name()) {
                case "USER_NOT_FOUND":
                    userMessage = "User not found. Please check your credentials.";
                    break;
                case "INVALID_ID_TOKEN":
                    userMessage = "Invalid authentication token. Please sign in again.";
                    break;
                case "EXPIRED_ID_TOKEN":
                    userMessage = "Authentication token has expired. Please sign in again.";
                    break;
            }
        }
        
        ApiResponse<Void> response = ApiResponse.error(userMessage, "FIREBASE_AUTH_ERROR");
        response.setPath(request.getDescription(false));
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    /**
     * Handles database integrity violations (e.g., duplicate email or UID).
     * @param ex Data integrity violation exception
     * @param request Web request for context
     * @return Standardized error response
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolation(DataIntegrityViolationException ex, WebRequest request) {
        log.warn("Data integrity violation: {}", ex.getMessage());
        String userMessage = "A database error occurred.";
        String errorCode = "DATA_INTEGRITY_ERROR";
        String msg = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();
        if (msg != null) {
            if (msg.contains("UK6dotkott2kjsp8vw4d0m25fb7") || msg.contains("Duplicate entry") && msg.contains("for key 'users.UK6dotkott2kjsp8vw4d0m25fb7'")) {
                userMessage = "A user with this email already exists.";
                errorCode = "EMAIL_EXISTS";
            } else if (msg.contains("PRIMARY") && msg.contains("Duplicate entry")) {
                userMessage = "A user with this UID already exists.";
                errorCode = "UID_EXISTS";
            }
        }
        ApiResponse<Void> response = ApiResponse.error(userMessage, errorCode);
        response.setPath(request.getDescription(false));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handles all other unhandled exceptions.
     * @param ex Generic exception
     * @param request Web request for context
     * @return Standardized error response
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleOtherExceptions(Exception ex, WebRequest request) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        
        ApiResponse<Void> response = ApiResponse.error(
            "An unexpected error occurred. Please try again later.",
            "INTERNAL_SERVER_ERROR"
        );
        response.setPath(request.getDescription(false));
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
} 