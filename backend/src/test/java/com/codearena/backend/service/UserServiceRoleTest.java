package com.codearena.backend.service;

import com.codearena.backend.entity.Role;
import com.codearena.backend.entity.User;
import com.codearena.backend.repository.RoleRepository;
import com.codearena.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Comprehensive test for role assignment functionality.
 * Tests assignment and removal of all available roles.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UserServiceRoleTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private User testUser;
    private List<String> allRoles;

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = new User();
        testUser.setFirebaseUid("test-user-uid");
        testUser.setEmail("test@example.com");
        testUser.setDisplayName("Test User");
        testUser.setIsActive(true);
        testUser.setRoles(Set.of());
        testUser = userRepository.save(testUser);

        // Define all available roles
        allRoles = Arrays.asList(
            "USER",
            "ADMIN",
            "PROBLEM_SETTER", 
            "TESTER",
            "CONTEST_MANAGER",
            "MODERATOR"
        );
    }

    @Test
    void testAssignAllRoles() {
        // Test assigning each role
        for (String roleName : allRoles) {
            User updatedUser = userService.assignRole(testUser.getFirebaseUid(), roleName);
            
            // Verify role was assigned
            Set<Role> userRoles = updatedUser.getRoles();
            assertTrue(userRoles.stream().anyMatch(r -> r.getName().equals(roleName)),
                "Role " + roleName + " should be assigned");
        }

        // Verify all roles are assigned
        User finalUser = userService.findByUid(testUser.getFirebaseUid()).orElseThrow();
        assertEquals(allRoles.size(), finalUser.getRoles().size(),
            "User should have all " + allRoles.size() + " roles");
    }

    @Test
    void testRemoveAllRoles() {
        // First assign all roles
        for (String roleName : allRoles) {
            userService.assignRole(testUser.getFirebaseUid(), roleName);
        }

        // Then remove each role (except USER which is typically required)
        List<String> removableRoles = Arrays.asList(
            "ADMIN", "PROBLEM_SETTER", "TESTER", "CONTEST_MANAGER", "MODERATOR"
        );

        for (String roleName : removableRoles) {
            User updatedUser = userService.removeRole(testUser.getFirebaseUid(), roleName);
            
            // Verify role was removed
            Set<Role> userRoles = updatedUser.getRoles();
            assertFalse(userRoles.stream().anyMatch(r -> r.getName().equals(roleName)),
                "Role " + roleName + " should be removed");
        }

        // Verify only USER role remains
        User finalUser = userService.findByUid(testUser.getFirebaseUid()).orElseThrow();
        assertEquals(1, finalUser.getRoles().size(), "Only USER role should remain");
        assertTrue(finalUser.getRoles().stream().anyMatch(r -> r.getName().equals("USER")),
            "USER role should remain");
    }

    @Test
    void testAssignNonExistentRole() {
        // Test assigning a role that doesn't exist in the predefined list
        String customRole = "CUSTOM_ROLE";
        User updatedUser = userService.assignRole(testUser.getFirebaseUid(), customRole);
        
        // Verify custom role was created and assigned
        Set<Role> userRoles = updatedUser.getRoles();
        assertTrue(userRoles.stream().anyMatch(r -> r.getName().equals(customRole)),
            "Custom role should be created and assigned");
        
        // Verify role exists in database
        Optional<Role> roleInDb = roleRepository.findByName(customRole);
        assertTrue(roleInDb.isPresent(), "Custom role should be saved to database");
    }

    @Test
    void testRemoveNonExistentRole() {
        // Try to remove a role that user doesn't have
        assertThrows(IllegalArgumentException.class, () -> {
            userService.removeRole(testUser.getFirebaseUid(), "NON_EXISTENT_ROLE");
        }, "Should throw exception when trying to remove non-existent role");
    }

    @Test
    void testAssignRoleToNonExistentUser() {
        assertThrows(IllegalArgumentException.class, () -> {
            userService.assignRole("non-existent-uid", "ADMIN");
        }, "Should throw exception when trying to assign role to non-existent user");
    }

    @Test
    void testRemoveRoleFromNonExistentUser() {
        assertThrows(IllegalArgumentException.class, () -> {
            userService.removeRole("non-existent-uid", "ADMIN");
        }, "Should throw exception when trying to remove role from non-existent user");
    }

    @Test
    void testRoleAssignmentIsIdempotent() {
        // Assign the same role twice
        User firstAssignment = userService.assignRole(testUser.getFirebaseUid(), "ADMIN");
        User secondAssignment = userService.assignRole(testUser.getFirebaseUid(), "ADMIN");
        
        // Both should have the same number of roles
        assertEquals(firstAssignment.getRoles().size(), secondAssignment.getRoles().size(),
            "Assigning the same role twice should not create duplicates");
        
        // Both should have the ADMIN role
        assertTrue(firstAssignment.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN")));
        assertTrue(secondAssignment.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN")));
    }

    @Test
    void testGetUserRoles() {
        // Assign multiple roles
        userService.assignRole(testUser.getFirebaseUid(), "ADMIN");
        userService.assignRole(testUser.getFirebaseUid(), "PROBLEM_SETTER");
        
        // Get user roles
        Set<Role> userRoles = userService.getUserRoles(testUser.getFirebaseUid());
        
        // Verify roles are returned
        assertTrue(userRoles.stream().anyMatch(r -> r.getName().equals("ADMIN")));
        assertTrue(userRoles.stream().anyMatch(r -> r.getName().equals("PROBLEM_SETTER")));
        assertEquals(3, userRoles.size(), "Should have USER, ADMIN, and PROBLEM_SETTER roles");
    }
} 