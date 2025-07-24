package com.codearena.backend.repository;

import com.codearena.backend.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * Repository interface for Problem entity.
 * Provides CRUD and query methods for problems.
 */
public interface ProblemRepository extends JpaRepository<Problem, Long> {
    Optional<Problem> findByTitle(String title);
} 