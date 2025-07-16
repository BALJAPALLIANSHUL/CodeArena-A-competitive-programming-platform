/**
 * Authentication service for API calls related to user registration and sign-in.
 */
const API_BASE = "/api/auth";

export async function signIn(email, password) {
    const res = await fetch(`${API_BASE}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Sign in failed");
    }
    return await res.json();
}

export async function register(email, password, role) {
    const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Registration failed");
    }
    return await res.json();
} 