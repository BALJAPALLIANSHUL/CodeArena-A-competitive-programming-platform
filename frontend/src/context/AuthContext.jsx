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
        toast.success(result.message);
        navigate("/");
      } else {
        toast.error(result.error);
        throw new Error(result.error);
      }
    } catch (err) {
      toast.error(err.message || "Sign in failed");
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
      const result = await firebaseAuthService.registerUser(email, password, displayName);

      if (result.success) {
        // Step 2: Register in backend with Firebase UID
        const firebaseUser = result.user;
        const payload = {
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || displayName
        };

        try {
          await apiClient.post("/auth/register", payload);
        } catch (backendError) {
          // Try to extract a clear error message from the backend
          let errorMsg = "Registration failed. Please try again.";
          if (backendError.data && (backendError.data.error || backendError.data.message)) {
            errorMsg = backendError.data.error || backendError.data.message;
          } else if (backendError.message) {
            errorMsg = backendError.message;
          }
          if (window.firebase?.auth?.currentUser) {
            await window.firebase.auth.currentUser.delete();
          }
          toast.error(errorMsg);
          throw new Error(errorMsg);
        }
        toast.success(result.message);
        navigate("/signin");
      } else {
        toast.error(result.error);
        throw new Error(result.error);
      }
    } catch (err) {
      toast.error(err.message || "Registration failed");
      throw err;
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
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
