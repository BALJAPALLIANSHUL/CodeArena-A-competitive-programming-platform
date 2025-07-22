package com.codearena.backend.repository;

import com.codearena.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
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
} 