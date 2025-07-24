import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import firebaseAuthService from "../services/firebaseAuthService";
import { toast } from "react-toastify";
import apiClient from "../services/apiClient";
import { auth } from "../config/firebase";

/**
 * AuthContext provides Firebase authentication state and actions to the app.
 * Includes user info, authentication state, and auth functions.
 *
 * @typedef {Object} AuthContextValue
 * @property {Object|null} user - The current user object or null if not signed in
 * @property {boolean} loading - Whether authentication state is loading
 * @property {function} signIn - Function to sign in a user
 * @property {function} signOut - Function to sign out the current user
 * @property {function} register - Function to register a new user
 * @property {function} resetPassword - Function to send password reset email
 * @property {boolean} isAuthenticated - Whether a user is authenticated
 */
const AuthContext = createContext();

/**
 * Custom hook to access authentication context.
 * @returns {AuthContextValue} Auth context value
 */
export const useAuth = () => useContext(AuthContext);

/**
 * AuthProvider component to wrap the app and provide Firebase authentication state.
 * Handles persistent login, sign-in, sign-out, and registration using Firebase Auth.
 *
 * @param {object} props - React children
 * @returns {JSX.Element} Auth context provider
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingBackendRegistration, setPendingBackendRegistration] =
    useState(null); // For retry flow
  const navigate = useNavigate();

  // Helper to fetch backend user info (including roles)
  const fetchBackendUser = async (uid, idToken) => {
    const res = await apiClient.get(`/users/${uid}`, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    return res.data && res.data.roles
      ? { ...res.data, roles: res.data.roles.map((r) => r.name || r) }
      : { ...res.data, roles: [] };
  };

  // Listen to Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChange(
      async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const idToken = await firebaseUser.getIdToken();
            const backendUser = await fetchBackendUser(
              firebaseUser.uid,
              idToken
            );
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              emailVerified: firebaseUser.emailVerified,
              photoURL: firebaseUser.photoURL,
              roles: backendUser.roles || [],
            });
          } catch {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              emailVerified: firebaseUser.emailVerified,
              photoURL: firebaseUser.photoURL,
              roles: [],
            });
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  /**
   * Sign in a user using Firebase authentication.
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<void>}
   */
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const result = await firebaseAuthService.signInUser(email, password);
      if (result.success) {
        const idToken = await result.user.getIdToken();
        const backendUser = await fetchBackendUser(result.user.uid, idToken);
        setUser({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          emailVerified: result.user.emailVerified,
          photoURL: result.user.photoURL,
          roles: backendUser.roles || [],
        });
        toast.success(result.message);
        navigate("/");
      } else {
        throw new Error(mapAuthError(result.error));
      }
    } catch (err) {
      setUser(null);
      throw new Error(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new user using Firebase authentication and backend.
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @param {string} displayName - User's display name
   * @returns {Promise<void>}
   */
  const register = async (email, password, displayName) => {
    setLoading(true);
    try {
      const result = await firebaseAuthService.registerUser(
        email,
        password,
        displayName
      );
      if (result.success) {
        const firebaseUser = result.user;
        const payload = {
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || displayName,
        };
        await apiClient.post("/auth/register", payload);
        toast.success(
          "Registration successful! Please check your email to verify your account before signing in."
        );
        setPendingBackendRegistration(null);
        navigate("/signin");
      } else {
        throw new Error(mapAuthError(result.error));
      }
    } catch (err) {
      setUser(null);
      throw new Error(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Retry backend registration if Firebase user exists but backend failed.
   * @returns {Promise<void>}
   */
  const retryBackendRegistration = async () => {
    if (!pendingBackendRegistration) return;
    const { firebaseUser, displayName } = pendingBackendRegistration;
    const payload = {
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || displayName,
    };
    try {
      await apiClient.post("/auth/register", payload);
      toast.success(
        "Registration completed! Please check your email to verify your account before signing in."
      );
      setPendingBackendRegistration(null);
      navigate("/signin");
    } catch (backendError) {
      let errorMsg = "Registration failed. Please try again.";
      let errorCode = backendError.code || backendError.status || "";
      if (
        backendError.data &&
        (backendError.data.error || backendError.data.message)
      ) {
        errorMsg = backendError.data.error || backendError.data.message;
      } else if (backendError.message) {
        errorMsg = backendError.message;
      }
      toast.error(mapAuthError(errorMsg));
      throw new Error(mapAuthError(errorMsg));
    }
  };

  /**
   * On login, if backend returns USER_NOT_FOUND, offer to complete registration.
   * @param {Object} firebaseUser - The Firebase user object
   * @returns {Promise<void>}
   */
  const completeBackendRegistration = async (firebaseUser) => {
    const payload = {
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || firebaseUser.email,
    };
    try {
      await apiClient.post("/auth/register", payload);
      toast.success(
        "Registration completed! Please check your email to verify your account before signing in."
      );
      setPendingBackendRegistration(null);
      navigate("/signin");
    } catch (backendError) {
      let errorMsg = "Registration failed. Please try again.";
      let errorCode = backendError.code || backendError.status || "";
      if (
        backendError.data &&
        (backendError.data.error || backendError.data.message)
      ) {
        errorMsg = backendError.data.error || backendError.data.message;
      } else if (backendError.message) {
        errorMsg = backendError.message;
      }
      toast.error(mapAuthError(errorMsg));
      throw new Error(mapAuthError(errorMsg));
    }
  };

  /**
   * Sign out the current user using Firebase authentication.
   * @returns {Promise<void>}
   */
  const signOut = async () => {
    setLoading(true);
    try {
      const result = await firebaseAuthService.signOutUser();
      setUser(null);
      if (result.success) {
        toast.info(result.message);
        navigate("/signin");
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("Sign out failed");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send password reset email.
   * @param {string} email - User's email address
   * @returns {Promise<void>}
   */
  const resetPassword = async (email) => {
    try {
      const result = await firebaseAuthService.resetPassword(email);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
        throw new Error(result.error);
      }
    } catch (err) {
      toast.error(err.message || "Password reset failed");
      throw err;
    }
  };

  /**
   * Check if the current user has a specific role.
   * @param {string} role
   * @returns {boolean}
   */
  const hasRole = (role) => {
    return user && Array.isArray(user.roles) && user.roles.includes(role);
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    register,
    resetPassword,
    retryBackendRegistration,
    completeBackendRegistration,
    pendingBackendRegistration,
    isAuthenticated: !!user,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Utility to map error codes/messages to user-friendly messages
function mapAuthError(error) {
  if (!error) return "An unknown error occurred.";
  const msg = error.message || error;
  // Firebase Auth errors
  if (msg.includes("invalid-email")) {
    return "The email address is invalid. Please check for typos.";
  }
  if (msg.includes("user-not-found") || msg.includes("No account found")) {
    return "No account exists for this email. Please check for typos or register for a new account.";
  }
  if (msg.includes("wrong-password") || msg.includes("Incorrect password")) {
    return "The password you entered is incorrect. Please check your password and try again, or use 'Forgot your password?' to reset it.";
  }
  if (
    msg.includes("email-already-in-use") ||
    msg.includes("email already exists")
  ) {
    return "An account with this email already exists. Try signing in or resetting your password.";
  }
  if (msg.includes("weak-password")) {
    return "Your password is too weak. Please use at least 6 characters, including numbers and letters.";
  }
  if (msg.includes("verify your email")) {
    return "Your email address is not verified. Please check your inbox (and spam folder) for a verification link, or click here to resend the verification email.";
  }
  if (msg.includes("disabled")) {
    return "Your account has been disabled. Please contact support for more information.";
  }
  if (msg.includes("too many failed attempts")) {
    return "Too many failed login attempts. Please wait a few minutes and try again.";
  }
  if (msg.toLowerCase().includes("network")) {
    return "We couldn't connect to the server. Please check your internet connection, or try again in a few minutes. If the problem persists, contact support.";
  }
  if (
    msg.includes("Internal Server Error") ||
    msg.includes("HTTP 500") ||
    msg.includes("Server Error") ||
    msg.includes("Failed to fetch")
  ) {
    return "Our servers are temporarily unavailable. Please try again later. If the problem persists, contact support.";
  }
  if (msg.includes("FIREBASE_USER_NOT_FOUND")) {
    return "Your registration session has expired. Please register again.";
  }
  if (msg.includes("UID already exists")) {
    return "A user with this account already exists. Please try signing in.";
  }
  if (msg.includes("Passwords do not match")) {
    return "The passwords you entered do not match. Please re-enter them.";
  }
  if (msg.includes("Password must be at least")) {
    return "Password must be at least 6 characters long.";
  }
  // Fallback
  return msg;
}
