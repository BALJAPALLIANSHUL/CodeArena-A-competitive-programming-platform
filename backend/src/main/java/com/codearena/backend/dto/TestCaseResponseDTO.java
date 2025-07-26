package com.codearena.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO for returning test case data to the frontend.
 */
@Data
public class TestCaseResponseDTO {
    private Long id;
    private String name;
    private String description;
    private String inputFileName;
    private String outputFileName;
    private Long fileSize;
    private Boolean isHidden;
    private Boolean isSample;
    private String createdBy;
    private String createdAt;
    private String updatedAt;
    
    // Optional: Include actual content for sample test cases
    private String inputContent;
    private String outputContent;
} 