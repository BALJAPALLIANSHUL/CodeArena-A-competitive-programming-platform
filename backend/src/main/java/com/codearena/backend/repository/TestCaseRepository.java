package com.codearena.backend.repository;

import com.codearena.backend.entity.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for TestCase entity operations.
 */
@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    
    /**
     * Find all test cases for a specific problem.
     */
    List<TestCase> findByProblemId(Long problemId);
    
    /**
     * Find all visible test cases for a problem (non-hidden).
     */
    List<TestCase> findByProblemIdAndIsHiddenFalse(Long problemId);
    
    /**
     * Find all sample test cases for a problem.
     */
    List<TestCase> findByProblemIdAndIsSampleTrue(Long problemId);
    
    /**
     * Find test case by problem ID and test case name.
     */
    Optional<TestCase> findByProblemIdAndName(Long problemId, String name);
    
    /**
     * Count test cases for a problem.
     */
    long countByProblemId(Long problemId);
    
    /**
     * Find test cases by problem ID and created by user.
     */
    List<TestCase> findByProblemIdAndCreatedByFirebaseUid(Long problemId, String firebaseUid);
    
    /**
     * Check if a test case name exists for a problem.
     */
    boolean existsByProblemIdAndName(Long problemId, String name);
} 