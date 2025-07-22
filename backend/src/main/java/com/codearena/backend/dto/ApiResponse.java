package com.codearena.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Standardized API response wrapper for consistent response format.
 * @param <T> Type of the data payload
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    /**
     * Indicates if the response is successful.
     */
    private boolean success;
    /**
     * Success or error message.
     */
    private String message;
    /**
     * Data payload of the response.
     */
    private T data;
    /**
     * Error details if any.
     */
    private String error;
    /**
     * Timestamp of the response.
     */
    private LocalDateTime timestamp;
    /**
     * Request path for the response.
     */
    private String path;

    /**
     * Creates a successful response with data.
     * @param data The response data
     * @param message Success message
     * @param <T> Type of the data
     * @return ApiResponse with success status
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, message, data, null, LocalDateTime.now(), null);
    }

    /**
     * Creates a successful response without data.
     * @param message Success message
     * @return ApiResponse with success status
     */
    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true, message, null, null, LocalDateTime.now(), null);
    }

    /**
     * Creates an error response.
     * @param error Error message
     * @return ApiResponse with error status
     */
    public static <T> ApiResponse<T> error(String error) {
        return new ApiResponse<>(false, null, null, error, LocalDateTime.now(), null);
    }

    /**
     * Creates an error response with custom message.
     * @param message Custom message
     * @param error Error details
     * @return ApiResponse with error status
     */
    public static <T> ApiResponse<T> error(String message, String error) {
        return new ApiResponse<>(false, message, null, error, LocalDateTime.now(), null);
    }
} 