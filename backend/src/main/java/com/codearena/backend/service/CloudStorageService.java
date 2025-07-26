package com.codearena.backend.service;

import com.google.cloud.storage.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

/**
 * Service for managing test case files in Google Cloud Storage.
 * 
 * Handles file storage operations for test case input and output files.
 * Uses a structured path format: testcases/{problemId}/{testCaseId}/{fileName}
 * 
 * Features:
 * - Secure file storage with Google Cloud Storage
 * - Automatic file organization by problem and test case
 * - Support for text-based input/output files
 * - File size tracking for storage monitoring
 * - Error handling for missing or corrupted files
 * 
 * This service abstracts Cloud Storage operations and provides a clean interface
 * for the TestCaseService to manage file storage without direct Cloud Storage dependencies.
 */
@Service
public class CloudStorageService {
    
    private final Storage storage;
    
    public CloudStorageService(Storage storage) {
        this.storage = storage;
    }
    
    /**
     * Gets the bucket name from environment variable or uses default.
     * @return The Cloud Storage bucket name
     */
    private String getBucketName() {
        String bucketName = System.getenv("GOOGLE_CLOUD_STORAGE_BUCKET_NAME");
        return bucketName != null ? bucketName : "codearena-testcases";
    }
    
    /**
     * Uploads a test case file to Cloud Storage.
     * @param problemId The problem ID
     * @param testCaseId The test case ID
     * @param fileName The file name (input.txt or output.txt)
     * @param content The file content
     * @return The Cloud Storage blob name
     */
    public String uploadTestCaseFile(Long problemId, Long testCaseId, String fileName, String content) {
        String blobName = String.format("testcases/%d/%d/%s", problemId, testCaseId, fileName);
        
        BlobId blobId = BlobId.of(getBucketName(), blobName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType("text/plain")
                .build();
        
        Blob blob = storage.create(blobInfo, content.getBytes(StandardCharsets.UTF_8));
        return blob.getName();
    }
    
    /**
     * Downloads a test case file from Cloud Storage.
     * @param problemId The problem ID
     * @param testCaseId The test case ID
     * @param fileName The file name (input.txt or output.txt)
     * @return The file content
     */
    public String downloadTestCaseFile(Long problemId, Long testCaseId, String fileName) {
        String blobName = String.format("testcases/%d/%d/%s", problemId, testCaseId, fileName);
        
        Blob blob = storage.get(BlobId.of(getBucketName(), blobName));
        if (blob == null) {
            throw new RuntimeException("Test case file not found: " + blobName);
        }
        
        return new String(blob.getContent(), StandardCharsets.UTF_8);
    }
    
    /**
     * Updates a test case file in Cloud Storage.
     * @param problemId The problem ID
     * @param testCaseId The test case ID
     * @param fileName The file name (input.txt or output.txt)
     * @param content The new file content
     */
    public void updateTestCaseFile(Long problemId, Long testCaseId, String fileName, String content) {
        uploadTestCaseFile(problemId, testCaseId, fileName, content); // Overwrite existing file
    }
    
    /**
     * Deletes a test case file from Cloud Storage.
     * @param problemId The problem ID
     * @param testCaseId The test case ID
     * @param fileName The file name (input.txt or output.txt)
     */
    public void deleteTestCaseFile(Long problemId, Long testCaseId, String fileName) {
        String blobName = String.format("testcases/%d/%d/%s", problemId, testCaseId, fileName);
        
        BlobId blobId = BlobId.of(getBucketName(), blobName);
        boolean deleted = storage.delete(blobId);
        
        if (!deleted) {
            throw new RuntimeException("Failed to delete test case file: " + blobName);
        }
    }
    
    /**
     * Deletes all test case files for a specific test case.
     * @param problemId The problem ID
     * @param testCaseId The test case ID
     */
    public void deleteTestCaseFiles(Long problemId, Long testCaseId) {
        deleteTestCaseFile(problemId, testCaseId, "input.txt");
        deleteTestCaseFile(problemId, testCaseId, "output.txt");
    }
    
    /**
     * Gets the file size of a test case file.
     * @param problemId The problem ID
     * @param testCaseId The test case ID
     * @param fileName The file name (input.txt or output.txt)
     * @return The file size in bytes
     */
    public long getTestCaseFileSize(Long problemId, Long testCaseId, String fileName) {
        String blobName = String.format("testcases/%d/%d/%s", problemId, testCaseId, fileName);
        
        Blob blob = storage.get(BlobId.of(getBucketName(), blobName));
        if (blob == null) {
            return 0;
        }
        
        return blob.getSize();
    }
} 