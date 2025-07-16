package com.codearena.backend.controller;

import com.codearena.backend.dto.UserRegisterDTO;
import com.codearena.backend.dto.UserSignInDTO;
import com.codearena.backend.entity.User;
import com.codearena.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

/**
 * REST controller for user registration and authentication.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Registers a new user.
     * @param registerDTO Registration data
     * @return Registered user
     */
    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody UserRegisterDTO registerDTO) {
        // TODO: Add validation, error handling, and DTO usage
        User registered = userService.registerUser(registerDTO);
        return ResponseEntity.ok(registered);
    }

    /**
     * Authenticates a user.
     * @param signInDTO Sign-in credentials
     * @return Authenticated user or error
     */
    @PostMapping("/signin")
    public ResponseEntity<User> signIn(@Valid @RequestBody UserSignInDTO signInDTO) {
        // TODO: Implement authentication logic and return JWT
        return ResponseEntity.ok().build();
    }
} 