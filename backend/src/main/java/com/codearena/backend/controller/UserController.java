package com.codearena.backend.controller;

import com.codearena.backend.dto.UserRegisterDTO;
import com.codearena.backend.dto.UserSignInDTO;
import com.codearena.backend.entity.User;
import com.codearena.backend.repository.UserRepository;
import com.codearena.backend.service.CustomUserDetailsService;
import com.codearena.backend.service.JwtUtil;
import com.codearena.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for user authentication endpoints.
 * Handles registration and sign-in, returning JWT tokens and user info.
 */
@RestController
@RequestMapping("/api/auth")
public class UserController {
    private final UserService userService;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    public UserController(UserService userService, CustomUserDetailsService userDetailsService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Registers a new user.
     * @param registerDTO Registration data (email, password, role)
     * @return The registered user entity
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegisterDTO registerDTO) {
        User user = userService.registerUser(registerDTO);
        return ResponseEntity.ok(user);
    }

    /**
     * Authenticates a user and returns a JWT token, email, and role.
     * @param signInDTO Sign-in credentials (email, password)
     * @return JWT token, email, and role if authentication is successful
     */
    @PostMapping("/signin")
    public ResponseEntity<?> signIn(@Valid @RequestBody UserSignInDTO signInDTO) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(signInDTO.getEmail());
        if (!userService.checkPassword(signInDTO.getPassword(), userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        String token = jwtUtil.generateToken(userDetails);
        // Fetch the User entity to get the role
        User user = userService.findByEmail(signInDTO.getEmail());
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        return ResponseEntity.ok(response);
    }
} 