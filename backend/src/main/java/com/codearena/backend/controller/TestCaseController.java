package com.codearena.backend.controller;

import com.codearena.backend.dto.*;
import com.codearena.backend.entity.User;
import com.codearena.backend.service.TestCaseService;
import com.codearena.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;

/**
 * REST controller for test case management endpoints.
 * Handles creation, updating, deletion, and retrieval of test cases for competitive programming problems.
 * Supports both individual and bulk operations with proper RBAC (Role-Based Access Control).
 * 
 * Test cases are stored with metadata in the database and actual input/output files in Google Cloud Storage.
 * Access control ensures that only authorized users (problem creators, testers, admins) can manage test cases.
 */
@RestController
@RequestMapping("/api/testcases")
public class TestCaseController {
    private final TestCaseService testCaseService;
    private final UserService userService;

    public TestCaseController(TestCaseService testCaseService, UserService userService) {
        this.testCaseService = testCaseService;
        this.userService = userService;
    }

    /**
     * Creates a new test case for a problem.
     * 
     * @param problemId The ID of the problem to create the test case for
     * @param dto The test case creation data including input/output content
     * @param principal The authenticated user making the request
     * @return The created test case with metadata (content excluded for security)
     * 
     * Access: PROBLEM_SETTER, TESTER, or ADMIN only
     */
    @PostMapping("/problems/{problemId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROBLEM_SETTER', 'TESTER')")
    public ResponseEntity<ApiResponse<TestCaseResponseDTO>> createTestCase(
            @PathVariable Long problemId,
            @Valid @RequestBody TestCaseCreateDTO dto,
            Principal principal) {
        User creator = userService.findByUid(principal.getName()).orElseThrow();
        TestCaseResponseDTO created = testCaseService.createTestCase(problemId, dto, creator);
        return ResponseEntity.ok(ApiResponse.success(created, "Test case created successfully."));
    }

    /**
     * Creates multiple test cases for a problem in a single operation.
     * 
     * @param problemId The ID of the problem to create test cases for
     * @param dto The bulk test case creation data containing multiple test cases
     * @param principal The authenticated user making the request
     * @return List of created test cases with metadata
     * 
     * Access: PROBLEM_SETTER, TESTER, or ADMIN only
     */
    @PostMapping("/problems/{problemId}/bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROBLEM_SETTER', 'TESTER')")
    public ResponseEntity<ApiResponse<List<TestCaseResponseDTO>>> createTestCasesBulk(
            @PathVariable Long problemId,
            @Valid @RequestBody TestCaseBulkCreateDTO dto,
            Principal principal) {
        User creator = userService.findByUid(principal.getName()).orElseThrow();
        List<TestCaseResponseDTO> created = dto.getTestCases().stream()
                .map(tcDto -> testCaseService.createTestCase(problemId, tcDto, creator))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(created, "Test cases created successfully."));
    }

    /**
     * Updates an existing test case.
     * 
     * @param testCaseId The ID of the test case to update
     * @param dto The test case update data (only provided fields will be updated)
     * @param principal The authenticated user making the request
     * @return The updated test case with metadata
     * 
     * Access: Test case creator, problem creator, TESTER, or ADMIN only
     */
    @PutMapping("/{testCaseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROBLEM_SETTER', 'TESTER')")
    public ResponseEntity<ApiResponse<TestCaseResponseDTO>> updateTestCase(
            @PathVariable Long testCaseId,
            @Valid @RequestBody TestCaseUpdateDTO dto,
            Principal principal) {
        User updater = userService.findByUid(principal.getName()).orElseThrow();
        TestCaseResponseDTO updated = testCaseService.updateTestCase(testCaseId, dto, updater);
        return ResponseEntity.ok(ApiResponse.success(updated, "Test case updated successfully."));
    }

    /**
     * Deletes a test case and its associated files from Cloud Storage.
     * 
     * @param testCaseId The ID of the test case to delete
     * @param principal The authenticated user making the request
     * @return Success response with confirmation message
     * 
     * Access: Test case creator, problem creator, TESTER, or ADMIN only
     */
    @DeleteMapping("/{testCaseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROBLEM_SETTER', 'TESTER')")
    public ResponseEntity<ApiResponse<Void>> deleteTestCase(
            @PathVariable Long testCaseId,
            Principal principal) {
        User deleter = userService.findByUid(principal.getName()).orElseThrow();
        testCaseService.deleteTestCase(testCaseId, deleter);
        return ResponseEntity.ok(ApiResponse.success("Test case deleted successfully."));
    }

    /**
     * Retrieves a test case by ID with appropriate content access based on user permissions.
     * 
     * @param testCaseId The ID of the test case to retrieve
     * @param principal The authenticated user making the request
     * @return The test case with metadata and content (if user has appropriate permissions)
     * 
     * Access: Any authenticated user (content visibility depends on user role and test case settings)
     */
    @GetMapping("/{testCaseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TestCaseResponseDTO>> getTestCase(
            @PathVariable Long testCaseId,
            Principal principal) {
        User user = userService.findByUid(principal.getName()).orElseThrow();
        TestCaseResponseDTO dto = testCaseService.getTestCase(testCaseId, user);
        return ResponseEntity.ok(ApiResponse.success(dto, "Test case retrieved successfully."));
    }

    /**
     * Lists all test cases for a problem with appropriate content access based on user permissions.
     * 
     * @param problemId The ID of the problem to list test cases for
     * @param principal The authenticated user making the request
     * @return List of test cases with metadata and content (if user has appropriate permissions)
     * 
     * Access: Any authenticated user (content visibility depends on user role and test case settings)
     */
    @GetMapping("/problems/{problemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<TestCaseResponseDTO>>> listTestCases(
            @PathVariable Long problemId,
            Principal principal) {
        User user = userService.findByUid(principal.getName()).orElseThrow();
        List<TestCaseResponseDTO> list = testCaseService.listTestCases(problemId, user);
        return ResponseEntity.ok(ApiResponse.success(list, "Test cases listed successfully."));
    }

    /**
     * Retrieves sample test cases for a problem that are publicly accessible to all users.
     * 
     * @param problemId The ID of the problem to get sample test cases for
     * @return List of sample test cases with content (publicly accessible)
     * 
     * Access: Public (no authentication required)
     */
    @GetMapping("/problems/{problemId}/samples")
    public ResponseEntity<ApiResponse<List<TestCaseResponseDTO>>> getSampleTestCases(
            @PathVariable Long problemId) {
        List<TestCaseResponseDTO> samples = testCaseService.getSampleTestCases(problemId);
        return ResponseEntity.ok(ApiResponse.success(samples, "Sample test cases retrieved successfully."));
    }
} 