import { useState } from "react";
import { signIn } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-toastify";

/**
 * Sign-in page for existing users.
 * Allows users to log in with email and password.
 */
export default function SignIn() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to home
  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await signIn(form);
      login(user);
      toast.success("Sign-in successful! Redirecting...");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      toast.error(err.error || Object.values(err)[0] || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center border-4 border-blue-400">
        <div className="mb-6 flex flex-col items-center border border-green-400 w-full">
          <span className="text-3xl font-extrabold tracking-tight mb-2 border border-yellow-400 w-full text-center">
            CodeArena
          </span>
          <h2 className="text-xl font-bold border border-red-400 w-full text-center">
            Sign In
          </h2>
        </div>
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-5 border border-purple-400 p-4"
        >
          <div className="border border-gray-400 p-2">
            <label className="block text-sm font-medium mb-1 border border-gray-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-400 rounded focus:outline-none"
              placeholder="Enter your email"
            />
          </div>
          <div className="border border-gray-400 p-2">
            <label className="block text-sm font-medium mb-1 border border-gray-300">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-400 rounded focus:outline-none"
              placeholder="Enter your password"
            />
            <div className="flex justify-end mt-1 border border-gray-300">
              <a
                href="#"
                className="text-xs hover:underline border border-gray-300 px-1"
              >
                Forgot password?
              </a>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded transition disabled:opacity-50 font-bold shadow border border-pink-400 bg-transparent text-inherit"
          >
            {loading ? <span className="loader mr-2"></span> : null}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="flex items-center w-full my-6 border border-gray-400">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-3 text-gray-400 text-xs">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <div className="w-full text-center mt-2 border border-gray-400">
          <span className="text-sm">Don't have an account? </span>
          <a
            href="/register"
            className="hover:underline font-medium border border-gray-300 px-1"
          >
            Register
          </a>
        </div>
        <style>{`.loader{border:2px solid #e0e0e0;border-top:2px solid #007bff;border-radius:50%;width:16px;height:16px;animation:spin 1s linear infinite;}@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`}</style>
      </div>
    </div>
  );
}
