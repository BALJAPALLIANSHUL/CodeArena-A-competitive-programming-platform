package com.codearena.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * JPA entity representing a test case for a competitive programming problem.
 * 
 * Test cases are stored with metadata in the database and actual input/output files
 * in Google Cloud Storage for scalability and cost-effectiveness.
 * 
 * Key features:
 * - Links to a specific problem via ManyToOne relationship
 * - Tracks file metadata (names, sizes) while storing content in Cloud Storage
 * - Supports hidden and sample test case flags for access control
 * - Maintains audit trail with creation and update timestamps
 * - Uses lazy loading for performance optimization
 * 
 * File storage strategy:
 * - Input files: testcases/{problemId}/{testCaseId}/input.txt
 * - Output files: testcases/{problemId}/{testCaseId}/output.txt
 * - File sizes tracked for storage monitoring and billing
 */
@Entity
@Table(name = "test_cases")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String inputFileName;

    @Column(nullable = false)
    private String outputFileName;

    @Column(nullable = false)
    private Long fileSize; // Size in bytes

    @Column(nullable = false)
    @Builder.Default
    private Boolean isHidden = false; // Hidden test cases are not shown to users

    @Column(nullable = false)
    @Builder.Default
    private Boolean isSample = false; // Sample test cases are shown to users

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
} 