// Firebase Authentication Service for CodeArena
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendEmailVerification,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Firebase Authentication Service for CodeArena.
 * Provides methods for user authentication using Firebase Auth.
 *
 * @class
 */
class FirebaseAuthService {
    /**
     * Register a new user with email and password
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @param {string} displayName - User's display name
     * @returns {Promise<Object>} User credential object
     */
    async registerUser(email, password, displayName) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Update user profile with display name
            await updateProfile(userCredential.user, {
                displayName: displayName
            });

            // Send email verification
            await sendEmailVerification(userCredential.user);

            return {
                success: true,
                user: userCredential.user,
                message: 'Registration successful! Please check your email for verification.'
            };
        } catch (error) {
            return {
                success: false,
                error: this.getErrorMessage(error.code),
                code: error.code
            };
        }
    }

    /**
     * Sign in user with email and password
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @returns {Promise<Object>} User credential object
     */
    async signInUser(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            return {
                success: true,
                user: userCredential.user,
                message: 'Sign in successful!'
            };
        } catch (error) {
            return {
                success: false,
                error: this.getErrorMessage(error.code),
                code: error.code
            };
        }
    }

    /**
     * Sign out the current user
     * @returns {Promise<Object>} Result object
     */
    async signOutUser() {
        try {
            await signOut(auth);
            return {
                success: true,
                message: 'Signed out successfully!'
            };
        } catch (error) {
            return {
                success: false,
                error: this.getErrorMessage(error.code),
                code: error.code
            };
        }
    }

    /**
     * Send password reset email
     * @param {string} email - User's email address
     * @returns {Promise<Object>} Result object
     */
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            return {
                success: true,
                message: 'Password reset email sent! Please check your inbox.'
            };
        } catch (error) {
            return {
                success: false,
                error: this.getErrorMessage(error.code),
                code: error.code
            };
        }
    }

    /**
     * Get current user
     * @returns {Object|null} Current user object or null
     */
    getCurrentUser() {
        return auth.currentUser;
    }

    /**
     * Listen to authentication state changes
     * @param {Function} callback - Callback function to handle auth state changes
     * @returns {Function} Unsubscribe function
     */
    onAuthStateChange(callback) {
        return onAuthStateChanged(auth, callback);
    }

    /**
     * Convert Firebase error codes to user-friendly messages
     * @param {string} errorCode - Firebase error code
     * @returns {string} User-friendly error message
     */
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/weak-password': 'Password should be at least 6 characters long.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/operation-not-allowed': 'This operation is not allowed.',
            'auth/invalid-credential': 'Invalid credentials. Please try again.',
            'default': 'An error occurred. Please try again.'
        };

        return errorMessages[errorCode] || errorMessages.default;
    }
}

// Export singleton instance
export default new FirebaseAuthService(); 