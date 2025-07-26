package com.codearena.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * DTO for updating an existing test case.
 */
@Data
public class TestCaseUpdateDTO {
    @NotBlank(message = "Test case name is required")
    @Size(min = 1, max = 100, message = "Test case name must be between 1 and 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    private String inputContent; // Optional - only update if provided

    private String outputContent; // Optional - only update if provided

    @NotNull(message = "Hidden flag is required")
    private Boolean isHidden;

    @NotNull(message = "Sample flag is required")
    private Boolean isSample;
} 