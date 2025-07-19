package com.codearena.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * Firebase configuration for server-side operations.
 * Initializes Firebase Admin SDK for authentication and other Firebase services.
 */
@Configuration
public class FirebaseConfig {

    @Value("${firebase.service-account-path:firebase-service-account.json}")
    private String serviceAccountPath;

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        if (FirebaseApp.getApps().isEmpty()) {
            InputStream serviceAccount = getServiceAccountInputStream();
            
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            return FirebaseApp.initializeApp(options);
        } else {
            return FirebaseApp.getInstance();
        }
    }

    @Bean
    public FirebaseAuth firebaseAuth() throws IOException {
        return FirebaseAuth.getInstance(firebaseApp());
    }

    private InputStream getServiceAccountInputStream() throws IOException {
        // Try to load from classpath first (for production)
        try {
            return new ClassPathResource(serviceAccountPath).getInputStream();
        } catch (IOException e) {
            // If not found in classpath, try to load from file system
            try {
                return new FileInputStream(serviceAccountPath);
            } catch (IOException fileException) {
                throw new IOException("Firebase service account file not found. Please ensure the file exists at: " + serviceAccountPath, fileException);
            }
        }
    }
} 