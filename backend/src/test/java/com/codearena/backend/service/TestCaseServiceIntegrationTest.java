package com.codearena.backend.service;

import com.codearena.backend.dto.TestCaseCreateDTO;
import com.codearena.backend.dto.TestCaseResponseDTO;
import com.codearena.backend.entity.Problem;
import com.codearena.backend.entity.Role;
import com.codearena.backend.entity.User;
import com.codearena.backend.repository.ProblemRepository;
import com.codearena.backend.repository.TestCaseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

/**
 * Integration test for TestCaseService with mocked dependencies.
 */
@SpringBootTest
@ActiveProfiles("test")
class TestCaseServiceIntegrationTest {

    @Autowired
    private TestCaseService testCaseService;

    @MockBean
    private TestCaseRepository testCaseRepository;

    @MockBean
    private ProblemRepository problemRepository;

    @MockBean
    private CloudStorageService cloudStorageService;

    private User testUser;
    private Problem testProblem;
    private TestCaseCreateDTO testCaseCreateDTO;

    @BeforeEach
    void setUp() {
        // Create test user with PROBLEM_SETTER role
        Set<Role> roles = new HashSet<>();
        Role problemSetterRole = new Role();
        problemSetterRole.setName("PROBLEM_SETTER");
        roles.add(problemSetterRole);

        testUser = new User();
        testUser.setFirebaseUid("test-user-uid");
        testUser.setEmail("test@example.com");
        testUser.setDisplayName("Test User");
        testUser.setRoles(roles);

        // Create test problem
        testProblem = new Problem();
        testProblem.setId(1L);
        testProblem.setTitle("Test Problem");
        testProblem.setDescription("Test Description");
        testProblem.setCreatedBy(testUser);

        // Create test case DTO
        testCaseCreateDTO = new TestCaseCreateDTO();
        testCaseCreateDTO.setName("Test Case 1");
        testCaseCreateDTO.setDescription("Test case description");
        testCaseCreateDTO.setInputContent("1 2 3");
        testCaseCreateDTO.setOutputContent("6");
        testCaseCreateDTO.setIsHidden(false);
        testCaseCreateDTO.setIsSample(true);
    }

    @Test
    void createTestCase_ValidData_ReturnsSuccess() {
        // Arrange
        when(problemRepository.findById(1L)).thenReturn(Optional.of(testProblem));
        when(testCaseRepository.existsByProblemIdAndName(1L, "Test Case 1")).thenReturn(false);
        when(testCaseRepository.save(any())).thenAnswer(invocation -> {
            com.codearena.backend.entity.TestCase testCase = invocation.getArgument(0);
            testCase.setId(1L);
            return testCase;
        });
        when(cloudStorageService.getTestCaseFileSize(anyLong(), anyLong(), any())).thenReturn(10L);

        // Act
        TestCaseResponseDTO result = testCaseService.createTestCase(1L, testCaseCreateDTO, testUser);

        // Assert
        assertNotNull(result);
        assertEquals("Test Case 1", result.getName());
        assertEquals("Test case description", result.getDescription());
        assertFalse(result.getIsHidden());
        assertTrue(result.getIsSample());
        assertEquals("Test User", result.getCreatedBy());
    }

    @Test
    void createTestCase_ProblemNotFound_ThrowsException() {
        // Arrange
        when(problemRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(jakarta.persistence.EntityNotFoundException.class, () -> {
            testCaseService.createTestCase(1L, testCaseCreateDTO, testUser);
        });
    }

    @Test
    void createTestCase_DuplicateName_ThrowsException() {
        // Arrange
        when(problemRepository.findById(1L)).thenReturn(Optional.of(testProblem));
        when(testCaseRepository.existsByProblemIdAndName(1L, "Test Case 1")).thenReturn(true);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            testCaseService.createTestCase(1L, testCaseCreateDTO, testUser);
        });
    }
} 