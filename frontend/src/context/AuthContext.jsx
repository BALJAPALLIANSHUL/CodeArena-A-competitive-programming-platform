import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import firebaseAuthService from "../services/firebaseAuthService";
import { toast } from "react-toastify";
import apiClient from "../services/apiClient";

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

  useEffect(() => {
    // Listen to Firebase authentication state changes
    const unsubscribe = firebaseAuthService.onAuthStateChange(
      (firebaseUser) => {
        if (firebaseUser) {
          // User is signed in
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            emailVerified: firebaseUser.emailVerified,
            photoURL: firebaseUser.photoURL,
          });
        } else {
          // User is signed out
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Sign in a user using Firebase authentication.
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<void>}
   */
  const signIn = async (email, password) => {
    try {
      const result = await firebaseAuthService.signInUser(email, password);

      if (result.success) {
        // Try to fetch user info from backend
        let backendUser = null;
        try {
          const res = await apiClient.get(`/users/${result.user.uid}`, {
            headers: {
              Authorization: `Bearer ${await result.user.getIdToken()}`,
            },
          });
          backendUser = res.data;
        } catch (err) {
          // Only propagate the error to the page
          throw new Error(
            "Our servers are temporarily unavailable. Please try again later."
          );
        }
        // Only check email verification if backend call succeeded
        toast.success(result.message);
        navigate("/");
      } else {
        // Show specific error messages for common Firebase errors
        if (result.code === "auth/user-not-found") {
          throw new Error("No account found with this email address.");
        } else if (result.code === "auth/wrong-password") {
          throw new Error("Incorrect password. Please try again.");
        } else if (result.code === "auth/user-disabled") {
          throw new Error("This account has been disabled.");
        } else if (result.code === "auth/too-many-requests") {
          throw new Error("Too many failed attempts. Please try again later.");
        } else {
          // Only show toast for backend/network/internal errors
        }
        throw new Error(result.error);
      }
    } catch (err) {
      if (
        err.message ===
          "Please verify your email before logging in. Check your inbox for a verification link." ||
        err.message === "No account found with this email address." ||
        err.message === "Incorrect password. Please try again." ||
        err.message === "This account has been disabled." ||
        err.message === "Too many failed attempts. Please try again later."
      ) {
        // Do not show toast here; page will handle inline error
        throw err;
        // Ensure no further error handling occurs
        return;
      }
      // Only show toast for backend/network/internal errors
      throw err;
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
    try {
      // Step 1: Register in Firebase Auth
      const result = await firebaseAuthService.registerUser(
        email,
        password,
        displayName
      );

      if (result.success) {
        // Step 2: Register in backend with Firebase UID
        const firebaseUser = result.user;
        const payload = {
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || displayName,
        };

        try {
          await apiClient.post("/auth/register", payload);
        } catch (backendError) {
          setPendingBackendRegistration({ firebaseUser, displayName });
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
          if (window.firebase?.auth?.currentUser) {
            await window.firebase.auth.currentUser.delete();
          }
          // Only show toast for backend/network/internal errors
          if (
            errorMsg.includes("email already exists") ||
            errorMsg.includes("UID already exists") ||
            errorCode === "NETWORK_ERROR" ||
            errorMsg.toLowerCase().includes("network") ||
            errorCode === "TIMEOUT"
          ) {
            toast.error(errorMsg);
          }
          throw new Error(errorMsg);
        }
        toast.success(
          "Registration successful! Please check your email to verify your account before signing in."
        );
        setPendingBackendRegistration(null);
        navigate("/signin");
      } else {
        // Show specific error messages for common Firebase errors
        if (
          result.code === "auth/email-already-in-use" ||
          result.code === "auth/weak-password" ||
          result.code === "auth/invalid-email" ||
          result.code === "auth/network-request-failed"
        ) {
          // Do not show toast here; page will handle inline error
          throw new Error(result.error);
        } else {
          toast.error(result.error || "Registration failed");
        }
        setPendingBackendRegistration(null);
        throw new Error(result.error);
      }
    } catch (err) {
      if (
        err.message.includes("Passwords do not match") ||
        err.message.includes("Password must be at least") ||
        err.message.includes("email already exists") ||
        err.message.includes("weak password") ||
        err.message.includes("invalid email")
      ) {
        // Do not show toast here; page will handle inline error
        throw err;
      }
      toast.error(err.message || "Registration failed");
      throw err;
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
      if (
        errorMsg.includes("Firebase user does not exist") ||
        errorMsg.includes("FIREBASE_USER_NOT_FOUND")
      ) {
        toast.error(
          "Your registration session has expired. Please register again."
        );
        setPendingBackendRegistration(null);
        navigate("/register");
        return;
      }
      if (errorMsg.includes("email already exists")) {
        toast.error(
          "An account with this email already exists. Try signing in or resetting your password."
        );
      } else if (errorMsg.includes("UID already exists")) {
        toast.error(
          "A user with this account already exists. Please try signing in."
        );
      } else if (
        errorCode === "NETWORK_ERROR" ||
        errorMsg.toLowerCase().includes("network")
      ) {
        toast.error(
          "Network error. Please check your connection and try again."
        );
      } else if (errorCode === "TIMEOUT") {
        toast.error(
          "Our servers are temporarily unavailable. Please try again later."
        );
      } else {
        toast.error(errorMsg);
      }
      throw new Error(errorMsg);
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
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  /**
   * Sign out the current user using Firebase authentication.
   * @returns {Promise<void>}
   */
  const signOut = async () => {
    try {
      const result = await firebaseAuthService.signOutUser();

      if (result.success) {
        toast.info(result.message);
        navigate("/signin");
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("Sign out failed");
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
