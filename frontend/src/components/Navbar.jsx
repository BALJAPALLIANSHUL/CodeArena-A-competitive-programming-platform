import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Navbar = () => {
  const { user, signOut, hasRole } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/vite.svg" alt="Logo" className="h-8 w-8" />
              <span className="font-bold text-xl text-blue-700">CodeArena</span>
            </Link>
            <Link
              to="/problems"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Problems
            </Link>
            {/* Add more nav links here if needed */}
            {hasRole("ADMIN") && (
              <Link
                to="/admin/users"
                className="text-gray-700 hover:text-purple-600 font-medium"
              >
                User Management
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 group"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="h-8 w-8 rounded-full border-2 border-blue-200 group-hover:border-blue-500 transition"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-blue-200 group-hover:border-blue-500 transition">
                      {user.displayName
                        ? user.displayName[0].toUpperCase()
                        : "U"}
                    </div>
                  )}
                  <span className="hidden sm:inline text-gray-700 font-medium group-hover:text-blue-600 transition">
                    Profile
                  </span>
                </Link>
                <button
                  onClick={signOut}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm font-medium"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
