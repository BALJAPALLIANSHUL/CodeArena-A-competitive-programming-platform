package com.codearena.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.Set;

/**
 * DTO for creating a new problem.
 */
@Data
public class ProblemCreateDTO {
    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String difficulty;

    @NotNull
    @Min(500)
    @Max(10000)
    private Integer timeLimitMillis;

    @NotNull
    @Min(16)
    @Max(2048)
    private Integer memoryLimitMB;

    private Set<@NotBlank String> tags;

    private Boolean isPublic = false;
} 