package com.codearena.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

/**
 * DTO for bulk creation of test cases.
 */
@Data
public class TestCaseBulkCreateDTO {
    @NotEmpty(message = "At least one test case is required")
    @Size(max = 50, message = "Cannot create more than 50 test cases at once")
    private List<@Valid TestCaseCreateDTO> testCases;
} 