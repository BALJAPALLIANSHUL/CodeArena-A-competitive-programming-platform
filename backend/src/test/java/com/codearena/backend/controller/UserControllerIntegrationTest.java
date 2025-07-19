package com.codearena.backend.controller;

import com.codearena.backend.dto.UserRegisterDTO;
import com.codearena.backend.entity.UserRole;
import com.codearena.backend.repository.UserRoleRepository;
import com.codearena.backend.service.FirebaseAuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for UserController
 */
@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
class UserControllerIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @MockBean
    private FirebaseAuthService firebaseAuthService;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
            .webAppContextSetup(context)
            .apply(springSecurity())
            .build();
        
        // Clear test data
        userRoleRepository.deleteAll();
    }

    @Test
    void verifyToken_ValidToken_ReturnsUserInfo() throws Exception {
        // Arrange
        String validToken = "valid-firebase-token";
        var mockToken = mock(FirebaseToken.class);
        when(mockToken.getUid()).thenReturn("test-uid-123");
        when(mockToken.getEmail()).thenReturn("test@example.com");
        when(mockToken.getName()).thenReturn("Test User");
        when(mockToken.isEmailVerified()).thenReturn(true);
        
        when(firebaseAuthService.verifyIdToken(validToken)).thenReturn(mockToken);

        // Act & Assert
        mockMvc.perform(post("/api/auth/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"idToken\": \"" + validToken + "\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.uid").value("test-uid-123"))
            .andExpect(jsonPath("$.email").value("test@example.com"))
            .andExpect(jsonPath("$.displayName").value("Test User"))
            .andExpect(jsonPath("$.emailVerified").value(true));
    }

    @Test
    void verifyToken_InvalidToken_ReturnsUnauthorized() throws Exception {
        // Arrange
        String invalidToken = "invalid-token";
        when(firebaseAuthService.verifyIdToken(invalidToken))
            .thenThrow(new IllegalArgumentException("Invalid token"));

        // Act & Assert
        mockMvc.perform(post("/api/auth/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"idToken\": \"" + invalidToken + "\"}"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void registerUser_ValidData_ReturnsSuccess() throws Exception {
        // Arrange
        UserRegisterDTO registerDTO = new UserRegisterDTO();
        registerDTO.setEmail("newuser@example.com");
        registerDTO.setRole("USER");
        registerDTO.setDisplayName("New User");

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerDTO)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("User registered successfully"));
    }

    @Test
    void registerUser_InvalidData_ReturnsBadRequest() throws Exception {
        // Arrange
        UserRegisterDTO registerDTO = new UserRegisterDTO();
        registerDTO.setEmail("invalid-email");
        registerDTO.setRole("USER");
        registerDTO.setDisplayName("");

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerDTO)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void registerUser_DuplicateEmail_ReturnsConflict() throws Exception {
        // Arrange
        UserRegisterDTO registerDTO = new UserRegisterDTO();
        registerDTO.setEmail("existing@example.com");
        registerDTO.setRole("USER");
        registerDTO.setDisplayName("Existing User");

        // Create existing user
        UserRole existingUser = new UserRole("existing-uid", "existing@example.com", "USER", "Existing User");
        userRoleRepository.save(existingUser);

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerDTO)))
            .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(username = "test-uid-123")
    void getCurrentUser_AuthenticatedUser_ReturnsUserInfo() throws Exception {
        // Arrange
        UserRole userRole = new UserRole("test-uid-123", "test@example.com", "USER", "Test User");
        userRoleRepository.save(userRole);

        var mockUserRecord = mock(UserRecord.class);
        when(mockUserRecord.getUid()).thenReturn("test-uid-123");
        when(mockUserRecord.getEmail()).thenReturn("test@example.com");
        when(mockUserRecord.getDisplayName()).thenReturn("Test User");
        when(mockUserRecord.isEmailVerified()).thenReturn(true);
        
        when(firebaseAuthService.getUserByUid("test-uid-123")).thenReturn(mockUserRecord);

        // Act & Assert
        mockMvc.perform(get("/api/auth/me"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.uid").value("test-uid-123"))
            .andExpect(jsonPath("$.email").value("test@example.com"))
            .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void getCurrentUser_UnauthenticatedUser_ReturnsUnauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/auth/me"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void healthCheck_ReturnsOk() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/test/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP"))
            .andExpect(jsonPath("$.message").value("CodeArena Backend is running"));
    }
} 