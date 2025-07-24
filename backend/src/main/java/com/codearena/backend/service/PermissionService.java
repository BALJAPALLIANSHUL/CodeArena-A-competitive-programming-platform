package com.codearena.backend.service;

import com.codearena.backend.entity.Problem;
import com.codearena.backend.repository.ProblemRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class PermissionService {
    private final ProblemRepository problemRepository;

    public PermissionService(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    public boolean canEditProblem(Long problemId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        Object principal = authentication.getPrincipal();
        String uid = null;
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (principal instanceof org.springframework.security.core.userdetails.User userDetails) {
            uid = userDetails.getUsername();
        } else if (principal instanceof String s) {
            uid = s;
        }
        Problem problem = problemRepository.findById(problemId).orElse(null);
        if (problem == null) return false;
        return isAdmin || (problem.getCreatedBy() != null && problem.getCreatedBy().getFirebaseUid().equals(uid));
    }
} 