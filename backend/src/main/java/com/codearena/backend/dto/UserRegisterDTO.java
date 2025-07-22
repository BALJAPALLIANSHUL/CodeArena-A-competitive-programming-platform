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
     * Firebase UID of the user (from Firebase Auth).
     */
    private String firebaseUid;

    /**
     * User's email address.
     */
    private String email;

    /**
     * User's display name.
     */
    private String displayName;
} 