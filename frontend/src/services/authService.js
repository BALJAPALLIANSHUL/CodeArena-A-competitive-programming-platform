/**
 * Authentication service for API calls related to user registration and sign-in.
 */
const API_BASE = (import.meta.env.VITE_API_URL || '/api') + '/users';

/**
 * Helper to parse JSON or fallback to text
 */
async function parseResponse(res) {
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch {
        return { error: text };
    }
}

/**
 * Registers a new user.
 * @param {Object} data - Registration data
 * @returns {Promise<Object>} Response data
 */
export async function register(data) {
    const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const responseBody = await parseResponse(res);
    if (!res.ok) throw responseBody;
    return responseBody;
}

/**
 * Signs in a user.
 * @param {Object} data - Sign-in data
 * @returns {Promise<Object>} Response data
 */
export async function signIn(data) {
    const res = await fetch(`${API_BASE}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const responseBody = await parseResponse(res);
    if (!res.ok) throw responseBody;
    return responseBody;
} 