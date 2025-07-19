package com.codearena.backend.service;

import com.codearena.backend.entity.UserRole;
import com.codearena.backend.repository.UserRoleRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Custom UserDetailsService for Firebase authentication.
 * Loads user details from our database using Firebase UID.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRoleRepository userRoleRepository;

    public CustomUserDetailsService(UserRoleRepository userRoleRepository) {
        this.userRoleRepository = userRoleRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String firebaseUid) throws UsernameNotFoundException {
        UserRole userRole = userRoleRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with Firebase UID: " + firebaseUid));

        if (!userRole.getIsActive()) {
            throw new UsernameNotFoundException("User is deactivated: " + firebaseUid);
        }

        return new User(
                userRole.getFirebaseUid(),
                "", // No password needed for Firebase authentication
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + userRole.getRole()))
        );
    }
} 