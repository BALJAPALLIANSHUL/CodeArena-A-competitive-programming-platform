package com.codearena.backend.service;

import com.codearena.backend.dto.UserRegisterDTO;
import com.codearena.backend.entity.UserRole;
import com.codearena.backend.repository.UserRoleRepository;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import org.springframework.stereotype.Service;

/**
 * Service class for user-related business logic.
 * Handles user role management with Firebase authentication.
 */
@Service
public class UserService {
    private final UserRoleRepository userRoleRepository;
    private final FirebaseAuthService firebaseAuthService;

    public UserService(UserRoleRepository userRoleRepository, FirebaseAuthService firebaseAuthService) {
        this.userRoleRepository = userRoleRepository;
        this.firebaseAuthService = firebaseAuthService;
    }

    /**
     * Creates a user role entry for a Firebase user.
     * @param registerDTO Registration data
     * @param firebaseUid Firebase user UID
     * @return Created UserRole entity
     */
    public UserRole createUserRole(UserRegisterDTO registerDTO, String firebaseUid) {
        UserRole userRole = new UserRole(
            firebaseUid,
            registerDTO.getEmail(),
            registerDTO.getRole(),
            registerDTO.getDisplayName()
        );
        return userRoleRepository.save(userRole);
    }

    /**
     * Finds a user role by Firebase UID.
     * @param firebaseUid Firebase user UID
     * @return UserRole entity or null if not found
     */
    public UserRole findByFirebaseUid(String firebaseUid) {
        return userRoleRepository.findByFirebaseUid(firebaseUid).orElse(null);
    }

    /**
     * Finds a user role by email.
     * @param email User's email address
     * @return UserRole entity or null if not found
     */
    public UserRole findByEmail(String email) {
        return userRoleRepository.findByEmail(email).orElse(null);
    }

    /**
     * Gets Firebase user information by UID.
     * @param firebaseUid Firebase user UID
     * @return Firebase UserRecord or null if not found
     */
    public UserRecord getFirebaseUserByUid(String firebaseUid) {
        try {
            return firebaseAuthService.getUserByUid(firebaseUid);
        } catch (FirebaseAuthException e) {
            return null;
        }
    }

    /**
     * Gets Firebase user information by email.
     * @param email User's email address
     * @return Firebase UserRecord or null if not found
     */
    public UserRecord getFirebaseUserByEmail(String email) {
        try {
            return firebaseAuthService.getUserByEmail(email);
        } catch (FirebaseAuthException e) {
            return null;
        }
    }

    /**
     * Checks if a user role exists by Firebase UID.
     * @param firebaseUid Firebase user UID
     * @return true if exists, false otherwise
     */
    public boolean existsByFirebaseUid(String firebaseUid) {
        return userRoleRepository.existsByFirebaseUid(firebaseUid);
    }

    /**
     * Checks if a user role exists by email.
     * @param email User's email address
     * @return true if exists, false otherwise
     */
    public boolean existsByEmail(String email) {
        return userRoleRepository.existsByEmail(email);
    }

    /**
     * Updates user role information.
     * @param userRole UserRole entity to update
     * @return Updated UserRole entity
     */
    public UserRole updateUserRole(UserRole userRole) {
        return userRoleRepository.save(userRole);
    }

    /**
     * Deactivates a user role.
     * @param firebaseUid Firebase user UID
     * @return Updated UserRole entity or null if not found
     */
    public UserRole deactivateUser(String firebaseUid) {
        UserRole userRole = findByFirebaseUid(firebaseUid);
        if (userRole != null) {
            userRole.setIsActive(false);
            return userRoleRepository.save(userRole);
        }
        return null;
    }
} 