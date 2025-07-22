package com.codearena.backend.repository;

import com.codearena.backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * Repository interface for Role entity.
 * Provides methods for role data access and lookup.
 */
public interface RoleRepository extends JpaRepository<Role, Long> {
    /**
     * Finds a role by its name.
     * @param name Role name
     * @return Optional of Role
     */
    Optional<Role> findByName(String name);
} 