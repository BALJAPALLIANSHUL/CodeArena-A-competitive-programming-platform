package com.codearena.backend.service;

import com.codearena.backend.entity.Role;
import com.codearena.backend.repository.RoleRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

/**
 * Service for role management operations.
 * Handles role lookup and creation.
 */
@Service
public class RoleService {
    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    /**
     * Finds a role by name.
     * @param name Role name
     * @return Optional of Role
     */
    public Optional<Role> findByName(String name) {
        return roleRepository.findByName(name);
    }

    /**
     * Creates a role if it does not exist.
     * @param name Role name
     * @return The created or existing Role
     */
    public Role createRoleIfNotExists(String name) {
        return roleRepository.findByName(name)
                .orElseGet(() -> roleRepository.save(new Role(null, name)));
    }

    /**
     * Finds all roles.
     * @return List of all roles
     */
    public List<Role> findAll() {
        return roleRepository.findAll();
    }
} 