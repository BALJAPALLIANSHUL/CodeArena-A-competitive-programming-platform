package com.codearena.backend.repository;

import com.codearena.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

/**
 * Repository interface for User entity.
 * Provides methods for user data access and lookup.
 */
public interface UserRepository extends JpaRepository<User, String> {
    /**
     * Finds a user by email address.
     * @param email User email
     * @return Optional of User
     */
    Optional<User> findByEmail(String email);

    /**
     * Finds a user by Firebase UID with roles eagerly loaded.
     * @param firebaseUid Firebase UID
     * @return Optional of User with roles
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.firebaseUid = :firebaseUid")
    Optional<User> findByIdWithRoles(@Param("firebaseUid") String firebaseUid);
} 