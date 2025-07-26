package com.codearena.backend.service;

import com.codearena.backend.dto.TestCaseCreateDTO;
import com.codearena.backend.dto.TestCaseUpdateDTO;
import com.codearena.backend.dto.TestCaseResponseDTO;
import com.codearena.backend.entity.TestCase;
import com.codearena.backend.entity.Problem;
import com.codearena.backend.entity.User;
import com.codearena.backend.repository.TestCaseRepository;
import com.codearena.backend.repository.ProblemRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for test case management operations.
 * 
 * Handles business logic, permission checks, and file storage operations for test cases.
 * Implements role-based access control (RBAC) for test case operations:
 * - Problem creators can manage test cases for their problems
 * - Testers can manage test cases for any problem
 * - Admins have full access to all test cases
 * - Regular users can view test cases based on visibility settings
 * 
 * Test cases are stored with metadata in the database and actual input/output files
 * in Google Cloud Storage for scalability and cost-effectiveness.
 */
@Service
public class TestCaseService {
    private final TestCaseRepository testCaseRepository;
    private final ProblemRepository problemRepository;
    private final CloudStorageService cloudStorageService;

    @Autowired
    public TestCaseService(TestCaseRepository testCaseRepository, 
                          ProblemRepository problemRepository,
                          CloudStorageService cloudStorageService) {
        this.testCaseRepository = testCaseRepository;
        this.problemRepository = problemRepository;
        this.cloudStorageService = cloudStorageService;
    }

    /**
     * Creates a new test case.
     * @param problemId The problem ID
     * @param dto Test case creation data
     * @param creator The user creating the test case
     * @return The created test case as DTO
     */
    public TestCaseResponseDTO createTestCase(Long problemId, TestCaseCreateDTO dto, User creator) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new EntityNotFoundException("Problem not found"));
        
        // Check permissions: only problem creator or TESTER can create test cases
        if (!canManageTestCases(problem, creator)) {
            throw new AccessDeniedException("You do not have permission to create test cases for this problem");
        }
        
        // Check if test case name already exists for this problem
        if (testCaseRepository.existsByProblemIdAndName(problemId, dto.getName())) {
            throw new IllegalArgumentException("Test case name already exists for this problem");
        }
        
        // Create test case entity
        TestCase testCase = TestCase.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .inputFileName("input.txt")
                .outputFileName("output.txt")
                .fileSize(0L) // Will be updated after file upload
                .isHidden(dto.getIsHidden())
                .isSample(dto.getIsSample())
                .problem(problem)
                .createdBy(creator)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        testCase = testCaseRepository.save(testCase);
        
        // Upload files to Cloud Storage
        cloudStorageService.uploadTestCaseFile(problemId, testCase.getId(), "input.txt", dto.getInputContent());
        cloudStorageService.uploadTestCaseFile(problemId, testCase.getId(), "output.txt", dto.getOutputContent());
        
        // Update file size
        long inputSize = cloudStorageService.getTestCaseFileSize(problemId, testCase.getId(), "input.txt");
        long outputSize = cloudStorageService.getTestCaseFileSize(problemId, testCase.getId(), "output.txt");
        testCase.setFileSize(inputSize + outputSize);
        testCase = testCaseRepository.save(testCase);
        
        return toResponseDTO(testCase, false); // Don't include content for regular users
    }

    /**
     * Updates an existing test case.
     * @param testCaseId Test case ID
     * @param dto Test case update data
     * @param updater The user updating the test case
     * @return The updated test case as DTO
     */
    public TestCaseResponseDTO updateTestCase(Long testCaseId, TestCaseUpdateDTO dto, User updater) {
        TestCase testCase = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new EntityNotFoundException("Test case not found"));
        
        // Check permissions
        if (!canManageTestCases(testCase.getProblem(), updater)) {
            throw new AccessDeniedException("You do not have permission to update this test case");
        }
        
        // Check if new name conflicts with existing test case
        if (!testCase.getName().equals(dto.getName()) && 
            testCaseRepository.existsByProblemIdAndName(testCase.getProblem().getId(), dto.getName())) {
            throw new IllegalArgumentException("Test case name already exists for this problem");
        }
        
        // Update fields
        testCase.setName(dto.getName());
        testCase.setDescription(dto.getDescription());
        testCase.setIsHidden(dto.getIsHidden());
        testCase.setIsSample(dto.getIsSample());
        testCase.setUpdatedAt(LocalDateTime.now());
        
        // Update files if provided
        if (dto.getInputContent() != null) {
            cloudStorageService.updateTestCaseFile(testCase.getProblem().getId(), testCaseId, "input.txt", dto.getInputContent());
        }
        if (dto.getOutputContent() != null) {
            cloudStorageService.updateTestCaseFile(testCase.getProblem().getId(), testCaseId, "output.txt", dto.getOutputContent());
        }
        
        // Update file size
        long inputSize = cloudStorageService.getTestCaseFileSize(testCase.getProblem().getId(), testCaseId, "input.txt");
        long outputSize = cloudStorageService.getTestCaseFileSize(testCase.getProblem().getId(), testCaseId, "output.txt");
        testCase.setFileSize(inputSize + outputSize);
        
        testCase = testCaseRepository.save(testCase);
        return toResponseDTO(testCase, false);
    }

    /**
     * Deletes a test case.
     * @param testCaseId Test case ID
     * @param deleter The user deleting the test case
     */
    public void deleteTestCase(Long testCaseId, User deleter) {
        TestCase testCase = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new EntityNotFoundException("Test case not found"));
        
        // Check permissions
        if (!canManageTestCases(testCase.getProblem(), deleter)) {
            throw new AccessDeniedException("You do not have permission to delete this test case");
        }
        
        // Delete files from Cloud Storage
        cloudStorageService.deleteTestCaseFiles(testCase.getProblem().getId(), testCaseId);
        
        // Delete from database
        testCaseRepository.delete(testCase);
    }

    /**
     * Gets a test case by ID.
     * @param testCaseId Test case ID
     * @param user The user requesting the test case
     * @return The test case as DTO
     */
    public TestCaseResponseDTO getTestCase(Long testCaseId, User user) {
        TestCase testCase = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new EntityNotFoundException("Test case not found"));
        
        // Check permissions
        if (!canViewTestCases(testCase.getProblem(), user)) {
            throw new AccessDeniedException("You do not have permission to view this test case");
        }
        
        boolean includeContent = testCase.getIsSample() || canManageTestCases(testCase.getProblem(), user);
        return toResponseDTO(testCase, includeContent);
    }

    /**
     * Lists test cases for a problem.
     * @param problemId Problem ID
     * @param user The user requesting the test cases
     * @return List of test case DTOs
     */
    public List<TestCaseResponseDTO> listTestCases(Long problemId, User user) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new EntityNotFoundException("Problem not found"));
        
        // Check permissions
        if (!canViewTestCases(problem, user)) {
            throw new AccessDeniedException("You do not have permission to view test cases for this problem");
        }
        
        List<TestCase> testCases;
        if (canManageTestCases(problem, user)) {
            // Can see all test cases
            testCases = testCaseRepository.findByProblemId(problemId);
        } else {
            // Can only see visible test cases
            testCases = testCaseRepository.findByProblemIdAndIsHiddenFalse(problemId);
        }
        
        return testCases.stream()
                .map(tc -> toResponseDTO(tc, tc.getIsSample() || canManageTestCases(problem, user)))
                .collect(Collectors.toList());
    }

    /**
     * Gets sample test cases for a problem.
     * @param problemId Problem ID
     * @return List of sample test case DTOs
     */
    public List<TestCaseResponseDTO> getSampleTestCases(Long problemId) {
        List<TestCase> sampleTestCases = testCaseRepository.findByProblemIdAndIsSampleTrue(problemId);
        return sampleTestCases.stream()
                .map(tc -> toResponseDTO(tc, true)) // Always include content for sample test cases
                .collect(Collectors.toList());
    }

    private boolean canManageTestCases(Problem problem, User user) {
        return isAdmin(user) || isTester(user) || 
               (problem.getCreatedBy() != null && problem.getCreatedBy().getFirebaseUid().equals(user.getFirebaseUid()));
    }

    private boolean canViewTestCases(Problem problem, User user) {
        return canManageTestCases(problem, user) || 
               (problem.getIsPublic() && !isHiddenTestCasesOnly(user));
    }

    private boolean isHiddenTestCasesOnly(User user) {
        // Regular users can only see non-hidden test cases
        return user.getRoles().stream().noneMatch(r -> 
            r.getName().equals("ADMIN") || r.getName().equals("TESTER") || r.getName().equals("PROBLEM_SETTER"));
    }

    private boolean isAdmin(User user) {
        return user.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN"));
    }

    private boolean isTester(User user) {
        return user.getRoles().stream().anyMatch(r -> r.getName().equals("TESTER"));
    }

    private TestCaseResponseDTO toResponseDTO(TestCase testCase, boolean includeContent) {
        TestCaseResponseDTO dto = new TestCaseResponseDTO();
        dto.setId(testCase.getId());
        dto.setName(testCase.getName());
        dto.setDescription(testCase.getDescription());
        dto.setInputFileName(testCase.getInputFileName());
        dto.setOutputFileName(testCase.getOutputFileName());
        dto.setFileSize(testCase.getFileSize());
        dto.setIsHidden(testCase.getIsHidden());
        dto.setIsSample(testCase.getIsSample());
        dto.setCreatedBy(testCase.getCreatedBy() != null ? testCase.getCreatedBy().getDisplayName() : null);
        dto.setCreatedAt(testCase.getCreatedAt() != null ? testCase.getCreatedAt().toString() : null);
        dto.setUpdatedAt(testCase.getUpdatedAt() != null ? testCase.getUpdatedAt().toString() : null);
        
        if (includeContent) {
            try {
                dto.setInputContent(cloudStorageService.downloadTestCaseFile(
                    testCase.getProblem().getId(), testCase.getId(), "input.txt"));
                dto.setOutputContent(cloudStorageService.downloadTestCaseFile(
                    testCase.getProblem().getId(), testCase.getId(), "output.txt"));
            } catch (Exception e) {
                // Log error but don't fail the request
                System.err.println("Failed to load test case content: " + e.getMessage());
            }
        }
        
        return dto;
    }
} 