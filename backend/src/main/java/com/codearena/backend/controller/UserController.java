package com.codearena.backend.controller;

import com.codearena.backend.dto.UserRegisterDTO;
import com.codearena.backend.entity.UserRole;
import com.codearena.backend.exception.ApiException;
import com.codearena.backend.service.FirebaseAuthService;
import com.codearena.backend.service.UserService;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for user authentication endpoints.
 * Handles Firebase token verification and user role management.
 */
@RestController
@RequestMapping("/api/auth")
public class UserController {
    private final UserService userService;
    private final FirebaseAuthService firebaseAuthService;

    public UserController(UserService userService, FirebaseAuthService firebaseAuthService) {
        this.userService = userService;
        this.firebaseAuthService = firebaseAuthService;
    }

    /**
     * Verifies a Firebase ID token and returns user information.
     * @param request Map containing the Firebase ID token
     * @return User information if token is valid
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestBody Map<String, String> request) {
        String idToken = request.get("idToken");
        
        if (idToken == null || idToken.isEmpty()) {
            throw ApiException.badRequest("ID token is required");
        }

        try {
            // Verify the Firebase ID token
            FirebaseToken decodedToken = firebaseAuthService.verifyIdToken(idToken);
            String uid = decodedToken.getUid();
            String email = decodedToken.getEmail();
            
            // Check if user role exists in our database
            UserRole userRole = userService.findByFirebaseUid(uid);
            
            Map<String, Object> response = new HashMap<>();
            response.put("uid", uid);
            response.put("email", email);
            response.put("emailVerified", decodedToken.isEmailVerified());
            
            if (userRole != null) {
                response.put("role", userRole.getRole());
                response.put("displayName", userRole.getDisplayName());
                response.put("isActive", userRole.getIsActive());
            } else {
                response.put("role", null);
                response.put("displayName", null);
                response.put("isActive", false);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (FirebaseAuthException e) {
            throw ApiException.unauthorized("Invalid ID token");
        }
    }

    /**
     * Creates a user role entry for a Firebase user.
     * @param registerDTO Registration data (email, role, displayName)
     * @return The created user role entity
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegisterDTO registerDTO) {
        try {
            // Check if user already exists in Firebase
            var firebaseUser = firebaseAuthService.getUserByEmail(registerDTO.getEmail());
            
            // Check if user role already exists in our database
            if (userService.existsByEmail(registerDTO.getEmail())) {
                throw ApiException.badRequest("User already exists");
            }
            
            // Create user role entry
            UserRole userRole = userService.createUserRole(registerDTO, firebaseUser.getUid());
            
            return ResponseEntity.ok(userRole);
            
        } catch (FirebaseAuthException e) {
            throw ApiException.badRequest("User not found in Firebase");
        }
    }

    /**
     * Gets current user information from the security context.
     * @return Current user information
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw ApiException.unauthorized("Not authenticated");
        }
        
        String uid = authentication.getName();
        UserRole userRole = userService.findByFirebaseUid(uid);
        
        if (userRole == null) {
            throw ApiException.notFound("User role not found");
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("uid", userRole.getFirebaseUid());
        response.put("email", userRole.getEmail());
        response.put("role", userRole.getRole());
        response.put("displayName", userRole.getDisplayName());
        response.put("isActive", userRole.getIsActive());
        
        return ResponseEntity.ok(response);
    }
} 