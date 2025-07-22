package com.codearena.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * JPA entity representing a user role in the system.
 * Used for role-based access control (RBAC).
 */
@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    /**
     * Role ID (primary key).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Name of the role (e.g., ADMIN, USER, etc.).
     */
    @Column(unique = true, nullable = false)
    private String name; // e.g., ADMIN, USER, CONTEST_MANAGER, PROBLEM_SETTER, TESTER, MODERATOR
} 