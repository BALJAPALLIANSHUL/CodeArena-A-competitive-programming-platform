package com.codearena.backend.service;

import com.codearena.backend.entity.Role;
import com.codearena.backend.entity.User;
import com.codearena.backend.repository.RoleRepository;
import com.codearena.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void registerUser_success() {
        String uid = "testUid";
        String email = "test@example.com";
        String displayName = "Test User";
        Role userRole = new Role(1L, "USER");

        when(userRepository.existsById(uid)).thenReturn(false);
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(userRole));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User user = userService.registerUser(uid, email, displayName);

        assertEquals(uid, user.getFirebaseUid());
        assertEquals(email, user.getEmail());
        assertEquals(displayName, user.getDisplayName());
        assertTrue(user.getIsActive());
        assertTrue(user.getRoles().stream().anyMatch(r -> r.getName().equals("USER")));
    }

    @Test
    void registerUser_nullUid_throws() {
        Exception ex = assertThrows(IllegalArgumentException.class, () ->
            userService.registerUser(null, "test@example.com", "Test User")
        );
        assertTrue(ex.getMessage().contains("firebaseUid"));
    }

    @Test
    void registerUser_emptyEmail_throws() {
        Exception ex = assertThrows(IllegalArgumentException.class, () ->
            userService.registerUser("testUid", "", "Test User")
        );
        assertTrue(ex.getMessage().contains("email"));
    }

    @Test
    void registerUser_emptyDisplayName_throws() {
        Exception ex = assertThrows(IllegalArgumentException.class, () ->
            userService.registerUser("testUid", "test@example.com", "")
        );
        assertTrue(ex.getMessage().contains("displayName"));
    }

    @Test
    void registerUser_alreadyExists_throws() {
        when(userRepository.existsById("testUid")).thenReturn(true);
        Exception ex = assertThrows(IllegalArgumentException.class, () ->
            userService.registerUser("testUid", "test@example.com", "Test User")
        );
        assertTrue(ex.getMessage().contains("already exists"));
    }

    @Test
    void registerUser_createsRoleIfNotExists() {
        String uid = "testUid";
        String email = "test@example.com";
        String displayName = "Test User";
        Role userRole = new Role(1L, "USER");

        when(userRepository.existsById(uid)).thenReturn(false);
        when(roleRepository.findByName("USER")).thenReturn(Optional.empty());
        when(roleRepository.save(any(Role.class))).thenReturn(userRole);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User user = userService.registerUser(uid, email, displayName);
        assertTrue(user.getRoles().stream().anyMatch(r -> r.getName().equals("USER")));
        verify(roleRepository, times(1)).save(any(Role.class));
    }
} 