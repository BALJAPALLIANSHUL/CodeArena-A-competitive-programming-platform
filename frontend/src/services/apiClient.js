/**
 * Centralized API client for CodeArena frontend.
 * Provides consistent error handling, authentication, and request/response interceptors.
 */

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const API_TIMEOUT = 30000; // 30 seconds

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
    constructor(message, status, code, data = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.data = data;
    }
}

/**
 * API client class with request/response interceptors
 */
class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.timeout = API_TIMEOUT;
    }

    /**
     * Get authentication token from Firebase
     * @returns {Promise<string|null>} Firebase ID token or null
     */
    async getAuthToken() {
        try {
            const { getAuth } = await import('firebase/auth');
            const { auth } = await import('../config/firebase');
            const user = getAuth(auth).currentUser;
            return user ? await user.getIdToken() : null;
        } catch (error) {
            console.warn('Failed to get auth token:', error);
            return null;
        }
    }

    /**
     * Create request headers with authentication
     * @param {Object} customHeaders - Additional headers
     * @returns {Promise<Object>} Headers object
     */
    async createHeaders(customHeaders = {}) {
        const token = await this.getAuthToken();
        const headers = {
            'Content-Type': 'application/json',
            ...customHeaders,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Handle API response and extract data
     * @param {Response} response - Fetch response
     * @returns {Promise<Object>} Parsed response data
     */
    async handleResponse(response) {
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');

        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            let errorCode = 'HTTP_ERROR';
            let errorData = null;

            if (isJson) {
                try {
                    const errorResponse = await response.json();
                    errorMessage = errorResponse.message || errorResponse.error || errorMessage;
                    errorCode = errorResponse.error || errorCode;
                    errorData = errorResponse.data;
                } catch (e) {
                    console.warn('Failed to parse error response:', e);
                }
            }

            throw new ApiError(errorMessage, response.status, errorCode, errorData);
        }

        if (isJson) {
            return await response.json();
        }

        return await response.text();
    }

    /**
     * Make HTTP request with error handling and retries
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @param {number} retries - Number of retry attempts
     * @returns {Promise<Object>} Response data
     */
    async request(endpoint, options = {}, retries = 1) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = await this.createHeaders(options.headers);

        const config = {
            method: 'GET',
            headers,
            timeout: this.timeout,
            ...options,
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                ...config,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            return await this.handleResponse(response);

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new ApiError('Request timeout', 408, 'TIMEOUT');
            }

            if (error instanceof ApiError) {
                throw error;
            }

            // Retry logic for network errors
            if (retries > 0 && (error.name === 'TypeError' || error.message.includes('fetch'))) {
                console.warn(`Retrying request to ${endpoint}, attempts left: ${retries}`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
                return this.request(endpoint, options, retries - 1);
            }

            throw new ApiError(
                error.message || 'Network error',
                0,
                'NETWORK_ERROR'
            );
        }
    }

    // HTTP method shortcuts
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    async post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async patch(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
export { ApiError }; 