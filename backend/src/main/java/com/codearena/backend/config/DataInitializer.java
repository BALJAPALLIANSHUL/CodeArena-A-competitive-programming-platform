package com.codearena.backend.config;

import com.codearena.backend.entity.Role;
import com.codearena.backend.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Data initializer to ensure all required roles are available in the database.
 * Runs on application startup to create missing roles.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Autowired
    public DataInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        initializeRoles();
    }

    /**
     * Initializes all required roles in the system.
     * Creates roles if they don't exist.
     */
    private void initializeRoles() {
        List<String> requiredRoles = Arrays.asList(
            "USER",           // Basic user role
            "ADMIN",          // System administrator
            "PROBLEM_SETTER", // Can create and manage problems
            "TESTER",         // Can test problems and test cases
            "CONTEST_MANAGER", // Can create and manage contests
            "MODERATOR"       // Can moderate content and resolve disputes
        );

        for (String roleName : requiredRoles) {
            if (!roleRepository.findByName(roleName).isPresent()) {
                Role role = new Role();
                role.setName(roleName);
                roleRepository.save(role);
                System.out.println("Created role: " + roleName);
            }
        }
    }
} 