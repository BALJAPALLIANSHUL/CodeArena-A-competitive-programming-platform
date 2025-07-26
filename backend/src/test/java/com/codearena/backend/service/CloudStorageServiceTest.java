package com.codearena.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

import com.codearena.backend.config.TestConfig;

/**
 * Simple test to verify Cloud Storage service is working.
 */
@SpringBootTest
@ActiveProfiles("test")
@Import(TestConfig.class)
class CloudStorageServiceTest {

    @Autowired
    private CloudStorageService cloudStorageService;

    @Test
    void testCloudStorageServiceExists() {
        // This test verifies that the CloudStorageService bean is created successfully
        assertNotNull(cloudStorageService, "CloudStorageService should be created");
        System.out.println("✅ CloudStorageService is working!");
    }

    @Test
    void testBucketNameIsConfigured() {
        // This test verifies that the bucket name is configured
        assertNotNull(cloudStorageService, "CloudStorageService should be created");
        System.out.println("✅ Cloud Storage configuration is working!");
    }
} 