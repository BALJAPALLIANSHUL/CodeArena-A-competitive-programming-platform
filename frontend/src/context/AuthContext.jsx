import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../services/authService";
import { toast } from "react-toastify";

/**
 * AuthContext provides authentication state and actions to the app.
 * Includes user info, JWT token, and auth functions.
 */
const AuthContext = createContext();

/**
 * Custom hook to access authentication context.
 * @returns {object} Auth context value
 */
export const useAuth = () => useContext(AuthContext);

/**
 * AuthProvider component to wrap the app and provide authentication state.
 * Handles persistent login, sign-in, sign-out, and registration.
 * @param {object} props - React children
 * @returns {JSX.Element} Auth context provider
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user")) || null
  );
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user, token]);

  /**
   * Sign in a user and store token and user info in context/localStorage.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<void>}
   */
  const signIn = async (email, password) => {
    try {
      const {
        token,
        email: userEmail,
        role,
      } = await authService.signIn(email, password);
      setToken(token);
      setUser({ email: userEmail, role });
      toast.success("Signed in successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Sign in failed");
      throw err;
    }
  };

  /**
   * Register a new user and redirect to sign-in page.
   * @param {string} email
   * @param {string} password
   * @param {string} role
   * @returns {Promise<void>}
   */
  const register = async (email, password, role) => {
    try {
      await authService.register(email, password, role);
      toast.success("Registered successfully! Please sign in.");
      navigate("/signin");
    } catch (err) {
      toast.error(err.message || "Registration failed");
      throw err;
    }
  };

  /**
   * Sign out the current user and clear context/localStorage.
   */
  const signOut = () => {
    setUser(null);
    setToken(null);
    toast.info("Signed out");
    navigate("/signin");
  };

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut, register }}>
      {children}
    </AuthContext.Provider>
  );
};
