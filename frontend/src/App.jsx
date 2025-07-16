import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const roleWelcome = {
  USER: {
    heading: "Welcome, Coder!",
    message:
      "Ready to solve problems and improve your skills? Dive into the arena!",
    accent: "bg-blue-100 text-blue-800",
    button: "bg-blue-600 hover:bg-blue-700",
  },
  SETTER: {
    heading: "Welcome, Problem Setter!",
    message: "Create, edit, and manage problems for the community.",
    accent: "bg-green-100 text-green-800",
    button: "bg-green-600 hover:bg-green-700",
  },
  MOD: {
    heading: "Welcome, Moderator!",
    message: "Monitor submissions, manage contests, and keep the arena fair.",
    accent: "bg-yellow-100 text-yellow-800",
    button: "bg-yellow-500 hover:bg-yellow-600",
  },
  ADMIN: {
    heading: "Welcome, Admin!",
    message: "Full access to all features. Oversee the platform and analytics.",
    accent: "bg-purple-100 text-purple-800",
    button: "bg-purple-600 hover:bg-purple-700",
  },
};

const Home = () => {
  const { user, signOut } = useAuth();
  // Default to USER if no role (for legacy users)
  const role = (user?.role || "USER").toUpperCase();
  const welcome = roleWelcome[role] || roleWelcome.USER;
  return (
    <div
      className={`w-full max-w-md bg-white rounded-xl shadow-lg p-8 mx-auto flex flex-col items-center border ${welcome.accent}`}
    >
      <h1 className="text-2xl font-bold mb-2 font-condensed text-center">
        {welcome.heading}
      </h1>
      <p className="mb-4 text-center text-base font-sans">{welcome.message}</p>
      <div className="mb-6 text-gray-700 text-center text-sm">
        Signed in as{" "}
        <span className="font-mono font-semibold">{user?.email}</span>
      </div>
      <button
        className={`w-full py-2 px-4 rounded transition font-bold shadow text-white ${welcome.button}`}
        onClick={signOut}
      >
        Sign Out
      </button>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/signin" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen w-full flex flex-col font-sans bg-gray-50 text-gray-900">
          <header className="w-full py-4 shadow bg-white">
            <div className="max-w-6xl mx-auto px-4 flex items-center">
              <h1 className="text-2xl font-bold font-condensed m-0">
                CodeArena
              </h1>
            </div>
          </header>
          <main className="flex-1 flex items-center justify-center">
            <Routes>
              <Route path="/signin" element={<SignIn />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <footer className="w-full py-4 text-center text-sm text-gray-500 bg-white mt-8">
            &copy; {new Date().getFullYear()} CodeArena. All rights reserved.
          </footer>
          <ToastContainer position="top-center" autoClose={3000} />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
