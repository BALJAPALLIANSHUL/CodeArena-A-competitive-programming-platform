package com.codearena.backend.config;

import com.codearena.backend.service.FirebaseAuthService;
import com.google.cloud.storage.Storage;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

/**
 * Test configuration for mocking external services.
 */
@TestConfiguration
public class TestConfig {

    /**
     * Mock Cloud Storage for testing.
     */
    @Bean
    @Primary
    public Storage mockStorage() {
        return Mockito.mock(Storage.class);
    }

    /**
     * Mock Firebase Auth Service for testing.
     */
    @Bean
    @Primary
    public FirebaseAuthService mockFirebaseAuthService() {
        return Mockito.mock(FirebaseAuthService.class);
    }
} 