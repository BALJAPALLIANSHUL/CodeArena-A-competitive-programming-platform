package com.codearena.backend.controller;

import com.codearena.backend.dto.*;
import com.codearena.backend.entity.User;
import com.codearena.backend.service.ProblemService;
import com.codearena.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;

/**
 * REST controller for problem management endpoints.
 * Handles CRUD for problems with role-based access control.
 */
@RestController
@RequestMapping("/api/problems")
public class ProblemController {
    private final ProblemService problemService;
    private final UserService userService;

    public ProblemController(ProblemService problemService, UserService userService) {
        this.problemService = problemService;
        this.userService = userService;
    }

    /**
     * Creates a new problem (PROBLEM_SETTER or ADMIN only).
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROBLEM_SETTER')")
    public ResponseEntity<ApiResponse<ProblemResponseDTO>> createProblem(@Valid @RequestBody ProblemCreateDTO dto, Principal principal) {
        User creator = userService.findByUid(principal.getName()).orElseThrow();
        ProblemResponseDTO created = problemService.createProblem(dto, creator);
        if (created == null || created.getId() == null) {
            // This should never happen; if it does, it's a server bug
            throw new RuntimeException("Failed to create problem: DTO or ID is null after save");
        }
        return ResponseEntity.ok(ApiResponse.success(created, "Problem created successfully."));
    }

    /**
     * Updates an existing problem (creator or ADMIN only).
     */
    @PutMapping("/{id}")
    @PreAuthorize("@permissionService.canEditProblem(#id, authentication)")
    public ResponseEntity<ApiResponse<ProblemResponseDTO>> updateProblem(@PathVariable Long id, @Valid @RequestBody ProblemUpdateDTO dto, Principal principal) {
        User updater = userService.findByUid(principal.getName()).orElseThrow();
        ProblemResponseDTO updated = problemService.updateProblem(id, dto, updater);
        if (updated == null || updated.getId() == null) {
            throw new RuntimeException("Failed to update problem: DTO or ID is null after save");
        }
        return ResponseEntity.ok(ApiResponse.success(updated, "Problem updated successfully."));
    }

    /**
     * Deletes a problem (creator or ADMIN only).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("@permissionService.canEditProblem(#id, authentication)")
    public ResponseEntity<ApiResponse<Void>> deleteProblem(@PathVariable Long id, Principal principal) {
        User deleter = userService.findByUid(principal.getName()).orElseThrow();
        problemService.deleteProblem(id, deleter);
        return ResponseEntity.ok(ApiResponse.success("Problem deleted successfully."));
    }

    /**
     * Gets a problem by ID (public, creator, ADMIN, or TESTER).
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ProblemResponseDTO>> getProblem(@PathVariable Long id, Principal principal) {
        User user = userService.findByUid(principal.getName()).orElseThrow();
        ProblemResponseDTO dto = problemService.getProblem(id, user);
        if (dto == null || dto.getId() == null) {
            throw new RuntimeException("Problem not found or DTO/ID is null");
        }
        return ResponseEntity.ok(ApiResponse.success(dto, "Problem retrieved successfully."));
    }

    /**
     * Lists all problems visible to the user.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ProblemResponseDTO>>> listProblems(Principal principal) {
        User user = userService.findByUid(principal.getName()).orElseThrow();
        List<ProblemResponseDTO> list = problemService.listProblems(user);
        if (list == null) {
            throw new RuntimeException("Problem list is null");
        }
        return ResponseEntity.ok(ApiResponse.success(list, "Problems listed successfully."));
    }
} 