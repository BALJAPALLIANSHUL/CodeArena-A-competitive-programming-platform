package com.codearena.backend.controller;

import com.codearena.backend.entity.User;
import com.codearena.backend.entity.Role;
import com.codearena.backend.service.UserService;
import com.codearena.backend.service.RoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Set;
import org.springframework.security.access.prepost.PreAuthorize;
import com.codearena.backend.dto.UserRegisterDTO;
import jakarta.validation.Valid;

/**
 * REST controller for user and role management endpoints.
 * Handles user registration, role assignment, and user info retrieval.
 */
@RestController
@RequestMapping("/api")
public class UserController {
    private final UserService userService;
    private final RoleService roleService;

    public UserController(UserService userService, RoleService roleService) {
        this.userService = userService;
        this.roleService = roleService;
    }

    /**
     * Registers a new user and assigns the default USER role.
     * @param dto User registration data
     * @return The created user or error response
     */
    @PostMapping("/auth/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRegisterDTO dto) {
        if (dto.getFirebaseUid() == null || dto.getFirebaseUid().isEmpty()) {
            return ResponseEntity.badRequest().body("firebaseUid must not be null or empty");
        }
        if (dto.getEmail() == null || dto.getEmail().isEmpty()) {
            return ResponseEntity.badRequest().body("email must not be null or empty");
        }
        if (dto.getDisplayName() == null || dto.getDisplayName().isEmpty()) {
            return ResponseEntity.badRequest().body("displayName must not be null or empty");
        }
        User created = userService.registerUser(dto.getFirebaseUid(), dto.getEmail(), dto.getDisplayName());
        return ResponseEntity.ok(created);
    }

    /**
     * Assigns a role to a user (admin only).
     * @param uid The user's Firebase UID
     * @param role The role to assign
     * @return The updated user
     */
    @PostMapping("/admin/users/{uid}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> assignRole(@PathVariable String uid, @RequestParam String role) {
        User updated = userService.assignRole(uid, role);
        return ResponseEntity.ok(updated);
    }

    /**
     * Removes a role from a user (admin only).
     * @param uid The user's Firebase UID
     * @param role The role to remove
     * @return The updated user
     */
    @DeleteMapping("/admin/users/{uid}/roles/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> removeRole(@PathVariable String uid, @PathVariable String role) {
        User updated = userService.removeRole(uid, role);
        return ResponseEntity.ok(updated);
    }

    /**
     * Retrieves user info and roles by UID.
     * @param uid The user's Firebase UID
     * @return The user info or 404 if not found
     */
    @GetMapping("/users/{uid}")
    public ResponseEntity<User> getUser(@PathVariable String uid) {
        return userService.findByUid(uid)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Retrieves all roles in the system.
     * @return Set of all roles
     */
    @GetMapping("/roles")
    public ResponseEntity<Set<Role>> getAllRoles() {
        return ResponseEntity.ok(Set.copyOf(roleService.findAll()));
    }
} 