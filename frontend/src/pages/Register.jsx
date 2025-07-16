import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password, role);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center border mx-auto">
      <span className="text-3xl font-extrabold tracking-tight mb-2 text-center text-gray-800 font-condensed">
        CodeArena
      </span>
      <h2 className="text-xl font-bold mb-6 text-center text-gray-700 font-condensed">
        Register
      </h2>
      <form onSubmit={handleSubmit} className="w-full space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring"
            placeholder="Enter your password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring"
          >
            <option value="USER">User</option>
            <option value="SETTER">Setter</option>
            <option value="MOD">Mod</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 rounded transition disabled:opacity-50 font-bold shadow bg-gray-800 text-white hover:bg-gray-900"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <div className="w-full text-center mt-4">
        <span className="text-sm">Already have an account? </span>
        <a href="/signin" className="hover:underline font-medium text-gray-800">
          Sign In
        </a>
      </div>
    </div>
  );
};

export default Register;
