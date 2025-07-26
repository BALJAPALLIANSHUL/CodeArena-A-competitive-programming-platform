package com.codearena.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.HashSet;
import java.util.Set;

/**
 * JPA entity representing a user in the system.
 * Stores Firebase UID, email, display name, active status, and roles.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    /**
     * Firebase UID (primary key, unique).
     */
    @Id
    @Column(name = "firebase_uid", unique = true, nullable = false)
    private String firebaseUid;

    /**
     * User's email address (unique).
     */
    @Column(nullable = false, unique = true)
    private String email;

    /**
     * User's display name.
     */
    @Column(name = "display_name")
    private String displayName;

    /**
     * Whether the user is active.
     */
    @Column(name = "is_active")
    private Boolean isActive = true;

    /**
     * Roles assigned to the user.
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id", referencedColumnName = "firebase_uid"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
} 