import apiClient, { ApiError } from './apiClient';

/**
 * Authentication API service for CodeArena.
 * Handles all authentication-related API calls with proper error handling.
 */
class AuthApiService {
    /**
     * Verify Firebase ID token with backend
     * @param {string} idToken - Firebase ID token
     * @returns {Promise<Object>} User information
     */
    async verifyToken(idToken) {
        try {
            const response = await apiClient.post('/auth/verify', { idToken });
            return {
                success: true,
                data: response,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: error.code,
            };
        }
    }

    /**
     * Register user role in backend
     * @param {Object} userData - User registration data
     * @param {string} userData.email - User email
     * @param {string} userData.role - User role
     * @param {string} userData.displayName - User display name
     * @returns {Promise<Object>} Registration result
     */
    async registerUser(userData) {
        try {
            const response = await apiClient.post('/auth/register', userData);
            return {
                success: true,
                data: response,
                message: response.message || 'User registered successfully',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: error.code,
            };
        }
    }

    /**
     * Get current user information from backend
     * @returns {Promise<Object>} Current user data
     */
    async getCurrentUser() {
        try {
            const response = await apiClient.get('/auth/me');
            return {
                success: true,
                data: response,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: error.code,
            };
        }
    }

    /**
     * Update user profile
     * @param {Object} profileData - Profile update data
     * @returns {Promise<Object>} Update result
     */
    async updateProfile(profileData) {
        try {
            const response = await apiClient.put('/auth/profile', profileData);
            return {
                success: true,
                data: response,
                message: response.message || 'Profile updated successfully',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: error.code,
            };
        }
    }

    /**
     * Change user password
     * @param {Object} passwordData - Password change data
     * @param {string} passwordData.currentPassword - Current password
     * @param {string} passwordData.newPassword - New password
     * @returns {Promise<Object>} Password change result
     */
    async changePassword(passwordData) {
        try {
            const response = await apiClient.post('/auth/change-password', passwordData);
            return {
                success: true,
                data: response,
                message: response.message || 'Password changed successfully',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: error.code,
            };
        }
    }

    /**
     * Delete user account
     * @returns {Promise<Object>} Account deletion result
     */
    async deleteAccount() {
        try {
            const response = await apiClient.delete('/auth/account');
            return {
                success: true,
                data: response,
                message: response.message || 'Account deleted successfully',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: error.code,
            };
        }
    }

    /**
     * Get user statistics
     * @returns {Promise<Object>} User statistics
     */
    async getUserStats() {
        try {
            const response = await apiClient.get('/auth/stats');
            return {
                success: true,
                data: response,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: error.code,
            };
        }
    }

    /**
     * Handle API errors with user-friendly messages
     * @param {ApiError} error - API error
     * @returns {string} User-friendly error message
     */
    getErrorMessage(error) {
        if (error instanceof ApiError) {
            switch (error.code) {
                case 'UNAUTHORIZED':
                    return 'Please sign in to continue.';
                case 'FORBIDDEN':
                    return 'You do not have permission to perform this action.';
                case 'NOT_FOUND':
                    return 'The requested resource was not found.';
                case 'VALIDATION_ERROR':
                    return 'Please check your input and try again.';
                case 'CONFLICT':
                    return 'This resource already exists.';
                case 'TIMEOUT':
                    return 'Request timed out. Please try again.';
                case 'NETWORK_ERROR':
                    return 'Network error. Please check your connection.';
                default:
                    return error.message || 'An unexpected error occurred.';
            }
        }
        return error.message || 'An unexpected error occurred.';
    }
}

// Create singleton instance
const authApi = new AuthApiService();

export default authApi; 