package com.codearena.backend.repository;

import com.codearena.backend.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * Repository for UserRole entity.
 * Handles database operations for user roles stored separately from Firebase authentication.
 */
public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    
    /**
     * Find user role by Firebase UID.
     * @param firebaseUid Firebase user UID
     * @return Optional containing UserRole if found
     */
    Optional<UserRole> findByFirebaseUid(String firebaseUid);
    
    /**
     * Find user role by email.
     * @param email User's email address
     * @return Optional containing UserRole if found
     */
    Optional<UserRole> findByEmail(String email);
    
    /**
     * Check if user role exists by Firebase UID.
     * @param firebaseUid Firebase user UID
     * @return true if exists, false otherwise
     */
    boolean existsByFirebaseUid(String firebaseUid);
    
    /**
     * Check if user role exists by email.
     * @param email User's email address
     * @return true if exists, false otherwise
     */
    boolean existsByEmail(String email);
} 