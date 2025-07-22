import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../config/firebase";
import { toast } from "react-toastify";

/**
 * SignIn page component for Firebase authentication.
 * Provides email/password sign-in and password reset functionality.
 *
 * @component
 * @returns {JSX.Element}
 */
const SignIn = () => {
  const { signIn, resetPassword, completeBackendRegistration } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [showCompleteRegistration, setShowCompleteRegistration] =
    useState(false);
  const [firebaseUserForRecovery, setFirebaseUserForRecovery] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  /**
   * Handles sign in form submission.
   * @param {React.FormEvent<HTMLFormElement>} e - Form submit event
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowCompleteRegistration(false);
    setFirebaseUserForRecovery(null);
    setError("");
    try {
      // Use AuthContext signIn for all logic and error handling
      await signIn(email, password);
      setError(""); // Clear error on success
    } catch (err) {
      // Only set inline error for validation/user errors
      if (
        err.message ===
          "Please verify your email before logging in. Check your inbox for a verification link." ||
        err.message === "No account found with this email address." ||
        err.message === "Incorrect password. Please try again." ||
        err.message === "This account has been disabled." ||
        err.message === "Too many failed attempts. Please try again later." ||
        err.message.includes("invalid email")
      ) {
        setError(err.message || "Sign in failed");
      } else {
        setError(""); // Clear inline error for backend/network/internal errors
        toast.error(err.message || "Sign in failed. Please try again.");
      }
    }
    setLoading(false);
  };

  /**
   * Handles password reset form submission.
   * @param {React.FormEvent<HTMLFormElement>} e - Form submit event
   * @returns {Promise<void>}
   */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      await resetPassword(email);
      setShowResetForm(false);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            CodeArena
          </h1>
          <h2 className="text-2xl font-bold text-gray-700">
            {showResetForm ? "Reset Password" : "Sign In"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {showResetForm
              ? "Enter your email to receive a password reset link"
              : "Welcome back! Please sign in to your account"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 border">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          {showCompleteRegistration && firebaseUserForRecovery && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded mb-4 text-sm flex flex-col items-center">
              <span>
                Your account exists in Firebase but is not fully registered in
                CodeArena.
                <br />
                Please click below to complete your registration.
              </span>
              <button
                onClick={async () => {
                  try {
                    await completeBackendRegistration(firebaseUserForRecovery);
                  } catch (err) {
                    // Error toast already shown in context
                  }
                }}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Complete Registration
              </button>
            </div>
          )}
          {!showResetForm ? (
            // Sign In Form
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowResetForm(true)}
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  Forgot your password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
            // Password Reset Form
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowResetForm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resetLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          )}

          {!showResetForm && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Register here
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignIn;
