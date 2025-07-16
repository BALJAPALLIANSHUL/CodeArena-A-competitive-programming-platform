package com.codearena.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO for user sign-in requests.
 */
@Data
public class UserSignInDTO {
    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;
} 