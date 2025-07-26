package com.codearena.backend.config;

import com.codearena.backend.entity.Role;
import com.codearena.backend.repository.RoleRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test for DataInitializer to ensure all required roles are created.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DataInitializerTest {

    @Autowired
    private RoleRepository roleRepository;

    @Test
    void testDataInitializerCreatesAllRequiredRoles() {
        // Define expected roles
        List<String> expectedRoles = Arrays.asList(
            "USER",
            "ADMIN", 
            "PROBLEM_SETTER",
            "TESTER",
            "CONTEST_MANAGER",
            "MODERATOR"
        );

        // Verify all expected roles exist
        for (String roleName : expectedRoles) {
            Optional<Role> role = roleRepository.findByName(roleName);
            assertTrue(role.isPresent(), "Role " + roleName + " should exist");
            assertEquals(roleName, role.get().getName(), "Role name should match");
        }

        // Verify no extra roles were created
        List<Role> allRoles = roleRepository.findAll();
        assertEquals(expectedRoles.size(), allRoles.size(), 
            "Should have exactly " + expectedRoles.size() + " roles");
    }

    @Test
    void testDataInitializerIsIdempotent() {
        // Get initial count
        long initialCount = roleRepository.count();
        
        // Create a new DataInitializer and run it again
        DataInitializer dataInitializer = new DataInitializer(roleRepository);
        try {
            dataInitializer.run();
        } catch (Exception e) {
            fail("DataInitializer should not throw exception: " + e.getMessage());
        }
        
        // Count should remain the same (no duplicate roles created)
        long finalCount = roleRepository.count();
        assertEquals(initialCount, finalCount, 
            "Running DataInitializer again should not create duplicate roles");
    }
} 