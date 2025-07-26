package com.codearena.backend.controller;

import com.codearena.backend.dto.TestCaseCreateDTO;
import com.codearena.backend.dto.TestCaseResponseDTO;
import com.codearena.backend.entity.Role;
import com.codearena.backend.entity.User;
import com.codearena.backend.config.TestConfig;
import com.codearena.backend.service.TestCaseService;
import com.codearena.backend.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashSet;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for TestCaseController.
 */
@WebMvcTest(TestCaseController.class)
@Import(TestConfig.class)
class TestCaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TestCaseService testCaseService;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private TestCaseCreateDTO testCaseCreateDTO;
    private TestCaseResponseDTO testCaseResponseDTO;

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

        // Create test case DTO
        testCaseCreateDTO = new TestCaseCreateDTO();
        testCaseCreateDTO.setName("Test Case 1");
        testCaseCreateDTO.setDescription("Test case description");
        testCaseCreateDTO.setInputContent("1 2 3");
        testCaseCreateDTO.setOutputContent("6");
        testCaseCreateDTO.setIsHidden(false);
        testCaseCreateDTO.setIsSample(true);

        // Create test case response DTO
        testCaseResponseDTO = new TestCaseResponseDTO();
        testCaseResponseDTO.setId(1L);
        testCaseResponseDTO.setName("Test Case 1");
        testCaseResponseDTO.setDescription("Test case description");
        testCaseResponseDTO.setIsHidden(false);
        testCaseResponseDTO.setIsSample(true);
        testCaseResponseDTO.setCreatedBy("Test User");
    }

    @Test
    @WithMockUser(username = "test-user-uid", roles = {"PROBLEM_SETTER"})
    void createTestCase_ValidData_ReturnsSuccess() throws Exception {
        // Arrange
        when(userService.findByUid("test-user-uid")).thenReturn(java.util.Optional.of(testUser));
        when(testCaseService.createTestCase(anyLong(), any(TestCaseCreateDTO.class), any(User.class)))
                .thenReturn(testCaseResponseDTO);

        // Act & Assert
        mockMvc.perform(post("/api/testcases/problems/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCaseCreateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Test Case 1"))
                .andExpect(jsonPath("$.data.description").value("Test case description"))
                .andExpect(jsonPath("$.data.isHidden").value(false))
                .andExpect(jsonPath("$.data.isSample").value(true));
    }

    @Test
    @WithMockUser(username = "test-user-uid", roles = {"USER"})
    void createTestCase_UnauthorizedUser_ReturnsForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/testcases/problems/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCaseCreateDTO)))
                .andExpect(status().isForbidden());
    }
} 