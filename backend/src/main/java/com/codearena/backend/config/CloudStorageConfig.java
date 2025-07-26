package com.codearena.backend.config;

import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for Google Cloud Storage.
 * Provides the Storage bean required by CloudStorageService.
 */
@Configuration
public class CloudStorageConfig {

    /**
     * Creates and configures the Google Cloud Storage client.
     * Uses Application Default Credentials from GOOGLE_APPLICATION_CREDENTIALS environment variable.
     * 
     * @return Configured Storage client
     */
    @Bean
    public Storage storage() {
        return StorageOptions.getDefaultInstance().getService();
    }
} 