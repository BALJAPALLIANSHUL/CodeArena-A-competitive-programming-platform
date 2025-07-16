import { useState } from "react";
import { register } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-toastify";

/**
 * Registration page for new users.
 * Allows users to register with username, email, password, and role.
 */
export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "USER",
  });
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
      const user = await register(form);
      login(user);
      toast.success("Registration successful! Redirecting...");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      toast.error(err.error || Object.values(err)[0] || "Registration failed");
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
            Register
          </h2>
        </div>
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-5 border border-purple-400 p-4"
        >
          <div className="border border-gray-400 p-2">
            <label className="block text-sm font-medium mb-1 border border-gray-300">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-400 rounded focus:outline-none"
              placeholder="Enter your username"
            />
          </div>
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
          </div>
          <div className="border border-gray-400 p-2">
            <label className="block text-sm font-medium mb-1 border border-gray-300">
              Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-400 rounded focus:outline-none"
            >
              <option value="USER">User</option>
              <option value="PROBLEM_SETTER">Problem Setter</option>
              <option value="MODERATOR">Moderator</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded transition disabled:opacity-50 font-bold shadow border border-pink-400 bg-transparent text-inherit"
          >
            {loading ? <span className="loader mr-2"></span> : null}
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="flex items-center w-full my-6 border border-gray-400">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-3 text-gray-400 text-xs">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <div className="w-full text-center mt-2 border border-gray-400">
          <span className="text-sm">Already have an account? </span>
          <a
            href="/signin"
            className="hover:underline font-medium border border-gray-300 px-1"
          >
            Sign In
          </a>
        </div>
        <style>{`.loader{border:2px solid #e0e0e0;border-top:2px solid #007bff;border-radius:50%;width:16px;height:16px;animation:spin 1s linear infinite;}@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`}</style>
      </div>
    </div>
  );
}
