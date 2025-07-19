package com.codearena.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * UserRole entity for storing user roles separately from Firebase authentication.
 * This allows us to manage roles in our database while using Firebase for authentication.
 */
@Entity
@Table(name = "user_roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true, nullable = false)
    private String firebaseUid; // Firebase user UID

    @NotBlank
    @Column(nullable = false)
    private String email; // User's email for reference

    @NotBlank
    @Column(nullable = false)
    private String role; // e.g., USER, SETTER, MOD, ADMIN

    @Column(name = "display_name")
    private String displayName; // User's display name

    @Column(name = "is_active")
    private Boolean isActive = true; // Whether the user is active

    // Constructor for creating user roles
    public UserRole(String firebaseUid, String email, String role, String displayName) {
        this.firebaseUid = firebaseUid;
        this.email = email;
        this.role = role;
        this.displayName = displayName;
        this.isActive = true;
    }
} 