package com.codearena.backend.dto;

import lombok.Data;
import java.util.Set;

/**
 * DTO for returning problem data to the frontend.
 */
@Data
public class ProblemResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String difficulty;
    private Integer timeLimitMillis;
    private Integer memoryLimitMB;
    private Set<String> tags;
    private Boolean isPublic;
    private String createdBy;
    private String createdAt;
    private String updatedAt;
    private Long testCaseCount; // Number of test cases for this problem
} 