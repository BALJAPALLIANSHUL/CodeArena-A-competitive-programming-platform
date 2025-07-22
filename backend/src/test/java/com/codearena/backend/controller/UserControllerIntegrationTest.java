package com.codearena.backend.controller;

import com.codearena.backend.entity.Role;
import com.codearena.backend.entity.User;
import com.codearena.backend.repository.RoleRepository;
import com.codearena.backend.repository.UserRepository;
import com.codearena.backend.service.FirebaseAuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
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

import java.util.HashSet;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for UserController (new user-role model)
 */
@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
class UserControllerIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;

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
        userRepository.deleteAll();
        roleRepository.deleteAll();
    }

    @Test
    void verifyToken_ValidToken_ReturnsUserInfo() throws Exception {
        String validToken = "valid-firebase-token";
        var mockToken = mock(FirebaseToken.class);
        when(mockToken.getUid()).thenReturn("test-uid-123");
        when(mockToken.getEmail()).thenReturn("test@example.com");
        when(mockToken.getName()).thenReturn("Test User");
        when(mockToken.isEmailVerified()).thenReturn(true);
        when(firebaseAuthService.verifyIdToken(validToken)).thenReturn(mockToken);

        // Create user in DB
        Role userRole = roleRepository.save(new Role(null, "USER"));
        User user = new User("test-uid-123", "test@example.com", "Test User", true, new HashSet<>());
        user.getRoles().add(userRole);
        userRepository.save(user);

        mockMvc.perform(post("/api/auth/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"idToken\": \"" + validToken + "\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.uid").value("test-uid-123"))
            .andExpect(jsonPath("$.email").value("test@example.com"))
            .andExpect(jsonPath("$.displayName").value("Test User"))
            .andExpect(jsonPath("$.emailVerified").value(true))
            .andExpect(jsonPath("$.role").exists()); // role is now a set
    }

    @Test
    void verifyToken_InvalidToken_ReturnsUnauthorized() throws Exception {
        String invalidToken = "invalid-token";
        when(firebaseAuthService.verifyIdToken(invalidToken))
            .thenThrow(new IllegalArgumentException("Invalid token"));

        mockMvc.perform(post("/api/auth/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"idToken\": \"" + invalidToken + "\"}"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void registerUser_ValidData_ReturnsSuccess() throws Exception {
        var payload = new java.util.HashMap<String, Object>();
        payload.put("firebaseUid", "new-uid-123");
        payload.put("email", "newuser@example.com");
        payload.put("displayName", "New User");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.firebaseUid").value("new-uid-123"))
            .andExpect(jsonPath("$.email").value("newuser@example.com"))
            .andExpect(jsonPath("$.displayName").value("New User"));
    }

    @Test
    void registerUser_InvalidData_ReturnsBadRequest() throws Exception {
        var payload = new java.util.HashMap<String, Object>();
        payload.put("firebaseUid", "");
        payload.put("email", "invalid-email");
        payload.put("displayName", "");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void registerUser_DuplicateUid_ReturnsBadRequest() throws Exception {
        // Create existing user
        Role userRole = roleRepository.save(new Role(null, "USER"));
        User user = new User("existing-uid", "existing@example.com", "Existing User", true, new HashSet<>());
        user.getRoles().add(userRole);
        userRepository.save(user);

        var payload = new java.util.HashMap<String, Object>();
        payload.put("firebaseUid", "existing-uid");
        payload.put("email", "existing@example.com");
        payload.put("displayName", "Existing User");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "test-uid-123")
    void getUser_AuthenticatedUser_ReturnsUserInfo() throws Exception {
        // Create user in DB
        Role userRole = roleRepository.save(new Role(null, "USER"));
        User user = new User("test-uid-123", "test@example.com", "Test User", true, new HashSet<>());
        user.getRoles().add(userRole);
        userRepository.save(user);

        mockMvc.perform(get("/api/users/test-uid-123"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.firebaseUid").value("test-uid-123"))
            .andExpect(jsonPath("$.email").value("test@example.com"))
            .andExpect(jsonPath("$.displayName").value("Test User"))
            .andExpect(jsonPath("$.roles").isArray());
    }

    @Test
    void getUser_NonexistentUser_ReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/users/nonexistent-uid"))
            .andExpect(status().isNotFound());
    }

    @Test
    void healthCheck_ReturnsOk() throws Exception {
        mockMvc.perform(get("/api/test/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP"))
            .andExpect(jsonPath("$.message").value("CodeArena Backend is running"));
    }
} 