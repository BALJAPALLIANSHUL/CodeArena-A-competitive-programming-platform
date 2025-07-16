package com.codearena.backend.service;

import com.codearena.backend.dto.UserRegisterDTO;
import com.codearena.backend.entity.User;
import com.codearena.backend.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service class for user-related business logic.
 * Handles registration, authentication, password checking, and user lookup.
 */
@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Registers a new user from a DTO.
     * @param registerDTO Registration data
     * @return Registered user
     */
    public User registerUser(UserRegisterDTO registerDTO) {
        User user = new User();
        user.setEmail(registerDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword())); // Hash password
        user.setRole(registerDTO.getRole());
        return userRepository.save(user);
    }

    /**
     * Authenticates a user by email and password.
     * @param email User email
     * @param password User password
     * @return Authenticated user or null
     */
    public User authenticateUser(String email, String password) {
        // TODO: Implement authentication logic
        return null;
    }

    /**
     * Checks if the raw password matches the encoded password.
     * @param rawPassword Plain text password
     * @param encodedPassword Hashed password
     * @return True if passwords match, false otherwise
     */
    public boolean checkPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    /**
     * Finds a user by email.
     * @param email User email
     * @return User entity or null if not found
     */
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
} 