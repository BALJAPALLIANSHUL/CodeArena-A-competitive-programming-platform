package com.codearena.backend.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.stereotype.Service;

/**
 * Service for Firebase authentication operations.
 * Handles token verification and user information retrieval.
 */
@Service
public class FirebaseAuthService {
    
    private final FirebaseAuth firebaseAuth;

    public FirebaseAuthService(FirebaseAuth firebaseAuth) {
        this.firebaseAuth = firebaseAuth;
    }

    /**
     * Verifies a Firebase ID token and returns the decoded token.
     * @param idToken The Firebase ID token to verify
     * @return Decoded Firebase token containing user information
     * @throws FirebaseAuthException if token is invalid
     */
    public FirebaseToken verifyIdToken(String idToken) throws FirebaseAuthException {
        return firebaseAuth.verifyIdToken(idToken);
    }

    /**
     * Gets user information from Firebase using UID.
     * @param uid Firebase user UID
     * @return Firebase user record
     * @throws FirebaseAuthException if user not found
     */
    public com.google.firebase.auth.UserRecord getUserByUid(String uid) throws FirebaseAuthException {
        return firebaseAuth.getUser(uid);
    }

    /**
     * Gets user information from Firebase using email.
     * @param email User's email address
     * @return Firebase user record
     * @throws FirebaseAuthException if user not found
     */
    public com.google.firebase.auth.UserRecord getUserByEmail(String email) throws FirebaseAuthException {
        return firebaseAuth.getUserByEmail(email);
    }

    /**
     * Checks if a Firebase ID token is valid.
     * @param idToken The Firebase ID token to check
     * @return true if token is valid, false otherwise
     */
    public boolean isTokenValid(String idToken) {
        try {
            firebaseAuth.verifyIdToken(idToken);
            return true;
        } catch (FirebaseAuthException e) {
            return false;
        }
    }

    /**
     * Extracts user UID from a valid Firebase ID token.
     * @param idToken The Firebase ID token
     * @return User UID if token is valid, null otherwise
     */
    public String getUidFromToken(String idToken) {
        try {
            FirebaseToken decodedToken = firebaseAuth.verifyIdToken(idToken);
            return decodedToken.getUid();
        } catch (FirebaseAuthException e) {
            return null;
        }
    }
} 