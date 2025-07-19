package com.codearena.backend.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for FirebaseAuthService
 */
@ExtendWith(MockitoExtension.class)
class FirebaseAuthServiceTest {

    @Mock
    private FirebaseAuth firebaseAuth;

    @InjectMocks
    private FirebaseAuthService firebaseAuthService;

    private FirebaseToken mockToken;
    private UserRecord mockUserRecord;

    @BeforeEach
    void setUp() {
        // Mock FirebaseToken
        mockToken = mock(FirebaseToken.class);
        when(mockToken.getUid()).thenReturn("test-uid-123");
        when(mockToken.getEmail()).thenReturn("test@example.com");
        when(mockToken.getName()).thenReturn("Test User");
        when(mockToken.isEmailVerified()).thenReturn(true);

        // Mock UserRecord
        mockUserRecord = mock(UserRecord.class);
        when(mockUserRecord.getUid()).thenReturn("test-uid-123");
        when(mockUserRecord.getEmail()).thenReturn("test@example.com");
        when(mockUserRecord.getDisplayName()).thenReturn("Test User");
        when(mockUserRecord.isEmailVerified()).thenReturn(true);
    }

    @Test
    void verifyIdToken_ValidToken_ReturnsUserInfo() throws Exception {
        // Arrange
        String validToken = "valid-firebase-token";
        when(firebaseAuth.verifyIdToken(validToken)).thenReturn(mockToken);

        // Act
        var result = firebaseAuthService.verifyIdToken(validToken);

        // Assert
        assertNotNull(result);
        assertEquals("test-uid-123", result.getUid());
        assertEquals("test@example.com", result.getEmail());
        assertEquals("Test User", result.getName());
        assertTrue(result.isEmailVerified());
        verify(firebaseAuth).verifyIdToken(validToken);
    }

    @Test
    void verifyIdToken_InvalidToken_ThrowsException() throws FirebaseAuthException {
        // Arrange
        String invalidToken = "invalid-token";
        when(firebaseAuth.verifyIdToken(invalidToken))
            .thenThrow(new RuntimeException("Invalid token"));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            firebaseAuthService.verifyIdToken(invalidToken);
        });
        verify(firebaseAuth).verifyIdToken(invalidToken);
    }

    @Test
    void verifyIdToken_NullToken_ThrowsException() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            firebaseAuthService.verifyIdToken(null);
        });
    }

    @Test
    void verifyIdToken_EmptyToken_ThrowsException() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            firebaseAuthService.verifyIdToken("");
        });
    }

    @Test
    void getUserByUid_ValidUid_ReturnsUserRecord() throws Exception {
        // Arrange
        String validUid = "test-uid-123";
        when(firebaseAuth.getUser(validUid)).thenReturn(mockUserRecord);

        // Act
        var result = firebaseAuthService.getUserByUid(validUid);

        // Assert
        assertNotNull(result);
        assertEquals("test-uid-123", result.getUid());
        assertEquals("test@example.com", result.getEmail());
        assertEquals("Test User", result.getDisplayName());
        assertTrue(result.isEmailVerified());
        verify(firebaseAuth).getUser(validUid);
    }

    @Test
    void getUserByUid_InvalidUid_ThrowsException() throws FirebaseAuthException {
        // Arrange
        String invalidUid = "invalid-uid";
        when(firebaseAuth.getUser(invalidUid))
            .thenThrow(new RuntimeException("User not found"));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            firebaseAuthService.getUserByUid(invalidUid);
        });
        verify(firebaseAuth).getUser(invalidUid);
    }

    @Test
    void getUserByUid_NullUid_ThrowsException() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            firebaseAuthService.getUserByUid(null);
        });
    }
} 