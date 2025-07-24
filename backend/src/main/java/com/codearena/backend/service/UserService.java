package com.codearena.backend.service;

import com.codearena.backend.entity.Role;
import com.codearena.backend.entity.User;
import com.codearena.backend.repository.UserRepository;
import com.codearena.backend.repository.RoleRepository;
import org.springframework.stereotype.Service;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.List;

/**
 * Service for user management operations.
 * Handles registration, role assignment, and user retrieval.
 */
@Service
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    /**
     * Registers a new user with the default USER role.
     * Ensures user is saved before assigning roles to avoid SQL constraint issues.
     * @param firebaseUid Firebase UID
     * @param email User email
     * @param displayName User display name
     * @return The created User entity
     */
    public User registerUser(String firebaseUid, String email, String displayName) {
        if (firebaseUid == null || firebaseUid.isEmpty()) {
            throw new IllegalArgumentException("firebaseUid must not be null or empty");
        }
        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException("email must not be null or empty");
        }
        if (displayName == null || displayName.isEmpty()) {
            throw new IllegalArgumentException("displayName must not be null or empty");
        }
        if (userRepository.existsById(firebaseUid)) {
            throw new IllegalArgumentException("User already exists");
        }
        // Step 1: Save user without roles
        User user = new User(firebaseUid, email, displayName, true, new HashSet<>());
        user = userRepository.save(user);

        // Step 2: Assign default USER role
        Role userRole = roleRepository.findByName("USER")
                .orElseGet(() -> roleRepository.save(new Role(null, "USER")));
        user.getRoles().add(userRole);

        // Step 3: Save user again with roles
        return userRepository.save(user);
    }

    /**
     * Finds a user by Firebase UID.
     * @param firebaseUid Firebase UID
     * @return Optional of User
     */
    public Optional<User> findByUid(String firebaseUid) {
        return userRepository.findById(firebaseUid);
    }

    /**
     * Finds a user by email.
     * @param email User email
     * @return Optional of User
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Assigns a role to a user.
     * @param firebaseUid Firebase UID
     * @param roleName Role name
     * @return Updated User
     */
    public User assignRole(String firebaseUid, String roleName) {
        User user = userRepository.findById(firebaseUid)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(null, roleName)));
        user.getRoles().add(role);
        return userRepository.save(user);
    }

    /**
     * Removes a role from a user.
     * @param firebaseUid Firebase UID
     * @param roleName Role name
     * @return Updated User
     */
    public User removeRole(String firebaseUid, String roleName) {
        User user = userRepository.findById(firebaseUid)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        // Prevent removing ADMIN from the last admin
        if ("ADMIN".equals(roleName)) {
            // Count number of admins
            long adminCount = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> "ADMIN".equals(r.getName())))
                .count();
            if (adminCount <= 1 && user.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN"))) {
                throw new IllegalStateException("Cannot remove ADMIN role from the last admin user.");
            }
        }
        user.getRoles().removeIf(r -> r.getName().equals(roleName));
        return userRepository.save(user);
    }

    /**
     * Gets all roles for a user.
     * @param firebaseUid Firebase UID
     * @return Set of roles
     */
    public Set<Role> getUserRoles(String firebaseUid) {
        User user = userRepository.findById(firebaseUid)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return user.getRoles();
    }

    /**
     * Returns all users in the system.
     * @return List of all users
     */
    public List<User> findAll() {
        return userRepository.findAll();
    }
} 