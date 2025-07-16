package com.codearena.backend.entity;

import jakarta.persistence.*;

/**
 * Entity representing a user in the system for authentication and authorization.
 */
@Entity
@Table(name = "users")
public class User {
    /**
     * Unique identifier for the user.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Username of the user.
     */
    @Column(nullable = false, unique = true)
    private String username;

    /**
     * Email address of the user.
     */
    @Column(nullable = false, unique = true)
    private String email;

    /**
     * Hashed password of the user.
     */
    @Column(nullable = false)
    private String password;

    /**
     * Role of the user (USER, PROBLEM_SETTER, MODERATOR, SUPER_ADMIN).
     */
    @Column(nullable = false)
    private String role;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
} 