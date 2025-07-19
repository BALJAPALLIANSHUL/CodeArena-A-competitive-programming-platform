package com.codearena.backend.service;

import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Firebase authentication filter for verifying Firebase ID tokens.
 * Replaces JWT-based authentication with Firebase token verification.
 */
@Component
public class FirebaseAuthFilter extends OncePerRequestFilter {

    private final FirebaseAuthService firebaseAuthService;
    private final UserDetailsService userDetailsService;

    public FirebaseAuthFilter(FirebaseAuthService firebaseAuthService, UserDetailsService userDetailsService) {
        this.firebaseAuthService = firebaseAuthService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String idToken = authHeader.substring(7); // Remove "Bearer " prefix
            
            try {
                // Verify the Firebase ID token
                FirebaseToken decodedToken = firebaseAuthService.verifyIdToken(idToken);
                String uid = decodedToken.getUid();
                
                // Load user details from our database using Firebase UID
                UserDetails userDetails = userDetailsService.loadUserByUsername(uid);
                
                // Create authentication token
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                
                // Set authentication in security context
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
            } catch (FirebaseAuthException e) {
                // Token is invalid, continue without authentication
                logger.warn("Invalid Firebase token: " + e.getMessage());
            } catch (Exception e) {
                // Other errors, continue without authentication
                logger.error("Error processing Firebase token: " + e.getMessage());
            }
        }
        
        filterChain.doFilter(request, response);
    }
} 