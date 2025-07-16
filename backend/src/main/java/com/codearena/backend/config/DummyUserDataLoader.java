package com.codearena.backend.config;

import com.codearena.backend.entity.User;
import com.codearena.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Loads dummy users for each role at application startup for testing purposes.
 */
@Component
public class DummyUserDataLoader implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DummyUserDataLoader(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        createDummyUser("user", "user@codearena.com", "password", "USER");
        createDummyUser("setter", "setter@codearena.com", "password", "PROBLEM_SETTER");
        createDummyUser("mod", "mod@codearena.com", "password", "MODERATOR");
        createDummyUser("admin", "admin@codearena.com", "password", "SUPER_ADMIN");
    }

    private void createDummyUser(String username, String email, String rawPassword, String role) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setRole(role);
            userRepository.save(user);
        }
    }
} 