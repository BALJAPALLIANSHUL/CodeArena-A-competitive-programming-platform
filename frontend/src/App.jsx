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
import FirebaseTest from "./components/FirebaseTest";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Problems from "./pages/Problems";
import ProblemCreate from "./pages/ProblemCreate";
import ProblemDetail from "./pages/ProblemDetail";
import ProblemEdit from "./pages/ProblemEdit";
import ProblemDelete from "./pages/ProblemDelete";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import AdminUserList from "./pages/AdminUserList";
import AdminUserRoles from "./pages/AdminUserRoles";

/**
 * Loading component while authentication state is being determined
 */
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

/**
 * Protected route component that checks authentication
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {React.ReactNode} Protected content or redirect
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? children : <Navigate to="/signin" />;
};

/**
 * Main App component with routing and authentication
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Show Navbar on all pages except sign-in/register */}
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/register" element={<Register />} />
            {/* Admin user management routes */}
            <Route path="/admin/users" element={<AdminUserList />} />
            <Route path="/admin/users/:uid" element={<AdminUserRoles />} />
            <Route
              path="*"
              element={
                <>
                  <Navbar />
                  <Routes>
                    <Route path="/test" element={<FirebaseTest />} />
                    <Route
                      path="/problems"
                      element={
                        <ProtectedRoute>
                          <Problems />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/problems/create"
                      element={
                        <ProtectedRoute>
                          <ProblemCreate />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/problems/:id"
                      element={
                        <ProtectedRoute>
                          <ProblemDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/problems/:id/edit"
                      element={
                        <ProtectedRoute>
                          <ProblemEdit />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/problems/:id/delete"
                      element={
                        <ProtectedRoute>
                          <ProblemDelete />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </>
              }
            />
          </Routes>
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
