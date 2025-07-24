package com.codearena.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO for user registration requests.
 */
@Data
public class UserRegisterDTO {
    /**
     * Firebase UID of the user (from Firebase Auth). Must not be blank.
     */
    @NotBlank(message = "firebaseUid must not be blank")
    private String firebaseUid;

    /**
     * User's email address. Must not be blank and must be a valid email.
     */
    @NotBlank(message = "email must not be blank")
    @Email(message = "email must be a valid email address")
    private String email;

    /**
     * User's display name. Must not be blank.
     */
    @NotBlank(message = "displayName must not be blank")
    private String displayName;
} 