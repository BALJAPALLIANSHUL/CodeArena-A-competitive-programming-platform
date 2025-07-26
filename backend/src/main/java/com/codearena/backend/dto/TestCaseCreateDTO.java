package com.codearena.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * DTO for creating a new test case.
 */
@Data
public class TestCaseCreateDTO {
    @NotBlank(message = "Test case name is required")
    @Size(min = 1, max = 100, message = "Test case name must be between 1 and 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Input file is required")
    private String inputContent;

    @NotNull(message = "Output file is required")
    private String outputContent;

    @NotNull(message = "Hidden flag is required")
    private Boolean isHidden = false;

    @NotNull(message = "Sample flag is required")
    private Boolean isSample = false;
} 