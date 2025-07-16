package com.codearena.backend.config;

import com.codearena.backend.entity.User;
import com.codearena.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Loads dummy users for development.
 */
@Configuration
public class DummyUserDataLoader {
    @Bean
    public CommandLineRunner loadDummyUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            createUserIfNotExists(userRepository, passwordEncoder, "user@codearena.com", "password", "USER");
            createUserIfNotExists(userRepository, passwordEncoder, "setter@codearena.com", "password", "SETTER");
            createUserIfNotExists(userRepository, passwordEncoder, "mod@codearena.com", "password", "MOD");
            createUserIfNotExists(userRepository, passwordEncoder, "admin@codearena.com", "password", "ADMIN");
        };
    }

    private void createUserIfNotExists(UserRepository userRepository, PasswordEncoder passwordEncoder, String email, String rawPassword, String role) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setRole(role);
            userRepository.save(user);
        }
    }
} 