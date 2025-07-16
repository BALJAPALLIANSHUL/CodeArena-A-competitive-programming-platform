import { createContext, useContext, useState, useEffect } from "react";

/**
 * AuthContext provides authentication state and actions.
 * Now supports persistent authentication using localStorage.
 */
const AuthContext = createContext();

export function AuthProvider({ children }) {
  // On initial load, try to get user from localStorage
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // Whenever user changes, update localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  /**
   * Log in a user and persist to localStorage
   */
  const login = (userData) => setUser(userData);

  /**
   * Log out a user and clear from localStorage
   */
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
