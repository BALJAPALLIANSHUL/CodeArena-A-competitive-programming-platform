import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Register from "./pages/Register.jsx";
import SignIn from "./pages/SignIn.jsx";
import { useAuth } from "./context/AuthContext";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

// ProtectedRoute component: Only renders children if user is authenticated
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/signin" replace />;
}

function App() {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    // Persist dark mode preference in localStorage
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Header */}
      <header className="border-4 border-blue-400 p-4 w-full">
        <div className="flex justify-between items-center border-2 border-green-400 p-2 w-full">
          <h1 className="text-2xl font-bold border border-red-400 p-2">
            CodeArena
          </h1>
          <nav className="flex items-center gap-4 border border-yellow-400 p-2">
            <Link to="/" className="border border-purple-400 px-2 py-1">
              Home
            </Link>
            <Link to="/register" className="border border-purple-400 px-2 py-1">
              Register
            </Link>
            <Link to="/signin" className="border border-purple-400 px-2 py-1">
              Sign In
            </Link>
            {user && (
              <button
                className="border border-pink-400 px-2 py-1"
                onClick={logout}
              >
                Logout
              </button>
            )}
            <button
              className="border border-pink-400 px-2 py-1"
              onClick={() => setDarkMode((d) => !d)}
            >
              {darkMode ? "\ud83c\udf19 Dark" : "\u2600\ufe0f Light"}
            </button>
          </nav>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center border-4 border-orange-400 w-full">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <div className="my-8 p-8 border-4 border-cyan-400 rounded-lg w-full max-w-xl shadow text-center">
                  <h2 className="text-2xl font-bold mb-2">
                    Welcome, {user.username}!
                  </h2>
                  <p className="mb-1">
                    Your role:{" "}
                    <span className="font-semibold">{user.role}</span>
                  </p>
                  <p>You are now logged in.</p>
                </div>
              ) : (
                <div className="my-8 p-8 border-4 border-cyan-400 rounded-lg w-full max-w-xl shadow text-center">
                  <h1 className="text-3xl font-extrabold mb-4">
                    Welcome to CodeArena
                  </h1>
                  <p className="mb-4">
                    Sign in or register to get started with competitive
                    programming!
                  </p>
                  <div className="flex justify-center gap-4 border border-gray-400 p-2">
                    <Link
                      to="/signin"
                      className="border border-purple-400 px-2 py-1"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="border border-purple-400 px-2 py-1"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              )
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/signin" element={<SignIn />} />
          {/* 404 Not Found Route */}
          <Route
            path="*"
            element={
              <div className="text-center text-2xl border-4 border-red-400 mt-16 p-4 w-full">
                404 - Page Not Found
              </div>
            }
          />
        </Routes>
      </main>
      {/* Footer */}
      <footer className="border-4 border-indigo-400 text-center py-6 mt-8 w-full">
        <p className="m-0 text-sm">
          &copy; {new Date().getFullYear()} CodeArena. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;
