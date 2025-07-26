package com.codearena.backend.service;

import com.codearena.backend.entity.User;
import com.codearena.backend.entity.Role;
import com.codearena.backend.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Custom UserDetailsService for Firebase authentication.
 * Loads user details from our database using Firebase UID and maps all roles to authorities.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Loads user details by Firebase UID.
     * @param firebaseUid Firebase UID
     * @return UserDetails for Spring Security
     * @throws UsernameNotFoundException if user not found or deactivated
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String firebaseUid) throws UsernameNotFoundException {
        User user = userRepository.findByIdWithRoles(firebaseUid)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with Firebase UID: " + firebaseUid));

        if (!user.getIsActive()) {
            throw new UsernameNotFoundException("User is deactivated: " + firebaseUid);
        }

        Set<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
                .collect(Collectors.toSet());

        return new org.springframework.security.core.userdetails.User(
                user.getFirebaseUid(),
                "", // No password needed for Firebase authentication
                authorities
        );
    }
} 