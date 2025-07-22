package com.codearena.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Custom API exception for handling application-specific errors.
 * Provides structured error information with HTTP status codes.
 */
@Getter
public class ApiException extends RuntimeException {
    /**
     * HTTP status code for the error.
     */
    private final HttpStatus status;
    /**
     * Custom error code for the error.
     */
    private final String errorCode;
    /**
     * User-friendly error message.
     */
    private final String userMessage;

    /**
     * Creates an API exception with default error details.
     * @param message Error message
     * @param status HTTP status code
     */
    public ApiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
        this.errorCode = "API_ERROR";
        this.userMessage = message;
    }

    /**
     * Creates an API exception with custom error code and user message.
     * @param message Technical error message
     * @param status HTTP status code
     * @param errorCode Custom error code
     * @param userMessage User-friendly error message
     */
    public ApiException(String message, HttpStatus status, String errorCode, String userMessage) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
        this.userMessage = userMessage;
    }

    /**
     * Creates an API exception with cause.
     * @param message Error message
     * @param status HTTP status code
     * @param cause Original exception
     */
    public ApiException(String message, HttpStatus status, Throwable cause) {
        super(message, cause);
        this.status = status;
        this.errorCode = "API_ERROR";
        this.userMessage = message;
    }

    // Predefined exceptions for common scenarios
    public static ApiException notFound(String message) {
        return new ApiException(message, HttpStatus.NOT_FOUND, "NOT_FOUND", message);
    }

    public static ApiException badRequest(String message) {
        return new ApiException(message, HttpStatus.BAD_REQUEST, "BAD_REQUEST", message);
    }

    public static ApiException unauthorized(String message) {
        return new ApiException(message, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", message);
    }

    public static ApiException forbidden(String message) {
        return new ApiException(message, HttpStatus.FORBIDDEN, "FORBIDDEN", message);
    }

    public static ApiException conflict(String message) {
        return new ApiException(message, HttpStatus.CONFLICT, "CONFLICT", message);
    }

    public static ApiException internalServerError(String message) {
        return new ApiException(message, HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", 
            "An internal server error occurred. Please try again later.");
    }
} 