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
import com.codearena.backend.dto.ApiResponse;
import com.google.firebase.auth.FirebaseAuthException;
import com.codearena.backend.service.FirebaseAuthService;
import java.util.List;
import com.codearena.backend.dto.UserResponseDTO;
import java.util.stream.Collectors;

/**
 * REST controller for user and role management endpoints.
 * Handles user registration, role assignment, and user info retrieval.
 */
@RestController
@RequestMapping("/api")
public class UserController {
    private final UserService userService;
    private final RoleService roleService;
    private final FirebaseAuthService firebaseAuthService;

    public UserController(UserService userService, RoleService roleService, FirebaseAuthService firebaseAuthService) {
        this.userService = userService;
        this.roleService = roleService;
        this.firebaseAuthService = firebaseAuthService;
    }

    /**
     * Registers a new user and assigns the default USER role.
     * @param dto User registration data
     * @return The created user or error response
     */
    @PostMapping("/auth/register")
    public ResponseEntity<ApiResponse<User>> registerUser(@Valid @RequestBody UserRegisterDTO dto) {
        // Guard: Check if Firebase UID exists in Firebase Auth
        try {
            firebaseAuthService.getUserByUid(dto.getFirebaseUid());
        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(400).body(ApiResponse.error(
                "Firebase user does not exist. Please register via the frontend.",
                "FIREBASE_USER_NOT_FOUND"
            ));
        }
        User created = userService.registerUser(dto.getFirebaseUid(), dto.getEmail(), dto.getDisplayName());
        return ResponseEntity.ok(ApiResponse.success(created, "User registered successfully."));
    }

    /**
     * Assigns a role to a user (admin only).
     * @param uid The user's Firebase UID
     * @param role The role to assign
     * @return The updated user
     */
    @PostMapping("/admin/users/{uid}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> assignRole(@PathVariable String uid, @RequestParam String role) {
        User updated = userService.assignRole(uid, role);
        return ResponseEntity.ok(ApiResponse.success(updated, "Role '" + role + "' assigned to user."));
    }

    /**
     * Removes a role from a user (admin only).
     * @param uid The user's Firebase UID
     * @param role The role to remove
     * @return The updated user
     */
    @DeleteMapping("/admin/users/{uid}/roles/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> removeRole(@PathVariable String uid, @PathVariable String role) {
        User updated = userService.removeRole(uid, role);
        return ResponseEntity.ok(ApiResponse.success(updated, "Role '" + role + "' removed from user."));
    }

    /**
     * Retrieves user info and roles by UID.
     * @param uid The user's Firebase UID
     * @return The user info or 404 if not found
     */
    @GetMapping("/users/{uid}")
    public ResponseEntity<ApiResponse<User>> getUser(@PathVariable String uid) {
        return userService.findByUid(uid)
                .map(user -> ResponseEntity.ok(ApiResponse.success(user, "User found.")))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("User not found in backend. Please complete registration.", "USER_NOT_FOUND")));
    }

    /**
     * Retrieves all roles in the system.
     * @return Set of all roles
     */
    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<Set<Role>>> getAllRoles() {
        Set<Role> roles = Set.copyOf(roleService.findAll());
        return ResponseEntity.ok(ApiResponse.success(roles, "All roles retrieved successfully."));
    }

    /**
     * Retrieves all users (admin only).
     * @return List of all users
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getAllUsers() {
        List<User> users = userService.findAll();
        List<UserResponseDTO> dtos = users.stream().map(user -> {
            System.out.println("Mapping user: " + user.getFirebaseUid());
            UserResponseDTO dto = new UserResponseDTO();
            dto.setFirebaseUid(user.getFirebaseUid());
            dto.setEmail(user.getEmail());
            dto.setDisplayName(user.getDisplayName());
            dto.setRoles(user.getRoles() != null
                ? user.getRoles().stream().map(Role::getName).collect(Collectors.toList())
                : List.of());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "All users retrieved successfully."));
    }
} 