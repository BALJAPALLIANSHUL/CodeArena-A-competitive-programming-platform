package com.codearena.backend.service;

import com.codearena.backend.dto.ProblemCreateDTO;
import com.codearena.backend.dto.ProblemUpdateDTO;
import com.codearena.backend.dto.ProblemResponseDTO;
import com.codearena.backend.entity.Problem;
import com.codearena.backend.entity.User;
import com.codearena.backend.repository.ProblemRepository;
import com.codearena.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for problem management operations.
 * Handles business logic and role checks for problems.
 */
@Service
public class ProblemService {
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;

    @Autowired
    public ProblemService(ProblemRepository problemRepository, UserRepository userRepository) {
        this.problemRepository = problemRepository;
        this.userRepository = userRepository;
    }

    /**
     * Creates a new problem.
     * @param dto Problem creation data
     * @param creator The user creating the problem
     * @return The created problem as DTO
     */
    public ProblemResponseDTO createProblem(ProblemCreateDTO dto, User creator) {
        Problem problem = Problem.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .difficulty(dto.getDifficulty())
                .timeLimitMillis(dto.getTimeLimitMillis())
                .memoryLimitMB(dto.getMemoryLimitMB())
                .tags(dto.getTags() != null ? dto.getTags() : Set.of())
                .isPublic(Boolean.TRUE.equals(dto.getIsPublic()))
                .createdBy(creator)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        problem = problemRepository.save(problem);
        return toResponseDTO(problem);
    }

    /**
     * Updates an existing problem.
     * @param id Problem ID
     * @param dto Problem update data
     * @param updater The user updating the problem
     * @return The updated problem as DTO
     */
    public ProblemResponseDTO updateProblem(Long id, ProblemUpdateDTO dto, User updater) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Problem not found"));
        // Only creator or admin can update
        if (!problem.getCreatedBy().getFirebaseUid().equals(updater.getFirebaseUid()) && !isAdmin(updater)) {
            throw new AccessDeniedException("You do not have permission to update this problem");
        }
        problem.setTitle(dto.getTitle());
        problem.setDescription(dto.getDescription());
        problem.setDifficulty(dto.getDifficulty());
        problem.setTimeLimitMillis(dto.getTimeLimitMillis());
        problem.setMemoryLimitMB(dto.getMemoryLimitMB());
        problem.setTags(dto.getTags() != null ? dto.getTags() : Set.of());
        if (dto.getIsPublic() != null) problem.setIsPublic(dto.getIsPublic());
        problem.setUpdatedAt(LocalDateTime.now());
        problem = problemRepository.save(problem);
        return toResponseDTO(problem);
    }

    /**
     * Deletes a problem by ID.
     * @param id Problem ID
     * @param deleter The user deleting the problem
     */
    public void deleteProblem(Long id, User deleter) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Problem not found"));
        // Only creator or admin can delete
        if (!problem.getCreatedBy().getFirebaseUid().equals(deleter.getFirebaseUid()) && !isAdmin(deleter)) {
            throw new AccessDeniedException("You do not have permission to delete this problem");
        }
        problemRepository.delete(problem);
    }

    /**
     * Gets a problem by ID.
     * @param id Problem ID
     * @param user The user requesting the problem
     * @return The problem as DTO
     */
    public ProblemResponseDTO getProblem(Long id, User user) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Problem not found"));
        // Only public problems or those created by/for testers/admins
        if (!problem.getIsPublic() && !problem.getCreatedBy().getFirebaseUid().equals(user.getFirebaseUid()) && !isAdmin(user) && !isTester(user)) {
            throw new AccessDeniedException("You do not have permission to view this problem");
        }
        return toResponseDTO(problem);
    }

    /**
     * Lists all problems visible to the user.
     * @param user The user requesting the list
     * @return List of problem DTOs
     */
    public List<ProblemResponseDTO> listProblems(User user) {
        List<Problem> problems;
        if (isAdmin(user) || isTester(user)) {
            problems = problemRepository.findAll();
        } else {
            problems = problemRepository.findAll().stream()
                .filter(p -> p.getIsPublic() || (p.getCreatedBy() != null && p.getCreatedBy().getFirebaseUid().equals(user.getFirebaseUid())))
                .collect(Collectors.toList());
        }
        return problems.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    private boolean isAdmin(User user) {
        return user.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN"));
    }

    private boolean isTester(User user) {
        return user.getRoles().stream().anyMatch(r -> r.getName().equals("TESTER"));
    }

    private ProblemResponseDTO toResponseDTO(Problem problem) {
        ProblemResponseDTO dto = new ProblemResponseDTO();
        dto.setId(problem.getId());
        dto.setTitle(problem.getTitle());
        dto.setDescription(problem.getDescription());
        dto.setDifficulty(problem.getDifficulty());
        dto.setTimeLimitMillis(problem.getTimeLimitMillis());
        dto.setMemoryLimitMB(problem.getMemoryLimitMB());
        dto.setTags(problem.getTags());
        dto.setIsPublic(problem.getIsPublic());
        dto.setCreatedBy(problem.getCreatedBy() != null ? problem.getCreatedBy().getDisplayName() : null);
        dto.setCreatedAt(problem.getCreatedAt() != null ? problem.getCreatedAt().toString() : null);
        dto.setUpdatedAt(problem.getUpdatedAt() != null ? problem.getUpdatedAt().toString() : null);
        dto.setTestCaseCount((long) problem.getTestCases().size());
        return dto;
    }
} 