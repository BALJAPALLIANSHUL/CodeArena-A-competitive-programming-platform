import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";
import { useAuth } from "../context/AuthContext";

/**
 * Role descriptions for better user understanding
 */
const ROLE_DESCRIPTIONS = {
  USER: "Basic user - can solve problems and participate in contests",
  ADMIN:
    "System administrator - full access to all features and user management",
  PROBLEM_SETTER: "Can create, edit, and manage problems and test cases",
  TESTER: "Can test problems, validate test cases, and provide feedback",
  CONTEST_MANAGER:
    "Can create and manage contests, curate problems for contests",
  MODERATOR: "Can moderate user content, review plagiarism, resolve disputes",
};

const AdminUserRoles = () => {
  const { uid } = useParams();
  const { hasRole } = useAuth();
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasRole("ADMIN")) return;
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [userRes, rolesRes] = await Promise.all([
          apiClient.get(`/users/${uid}`),
          apiClient.get("/roles"),
        ]);
        setUser(userRes.data);
        setRoles(rolesRes.data);
      } catch (err) {
        setError("Failed to load user or roles.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [uid, hasRole]);

  if (!hasRole("ADMIN")) {
    return (
      <div className="max-w-xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800">Access Denied</h3>
          <p className="text-sm text-red-700 mt-1">
            You need ADMIN privileges to manage user roles.
          </p>
          <button
            onClick={() => navigate("/admin/users")}
            className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
          >
            Back to User List
          </button>
        </div>
      </div>
    );
  }

  const userRoles = user?.roles?.map((r) => r.name || r) || [];

  const handleRoleChange = async (role, checked) => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      if (checked) {
        await apiClient.post(`/admin/users/${uid}/roles?role=${role}`);
        setMessage(`Role '${role}' assigned successfully.`);
      } else {
        await apiClient.delete(`/admin/users/${uid}/roles/${role}`);
        setMessage(`Role '${role}' removed successfully.`);
      }
      // Refresh user info
      const userRes = await apiClient.get(`/users/${uid}`);
      setUser(userRes.data);
    } catch (err) {
      let msg = "Failed to update roles.";
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      if (msg.includes("Cannot remove ADMIN role from the last admin user")) {
        msg =
          "You cannot remove the ADMIN role from the last admin. At least one admin must remain in the system.";
      }
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <button
          className="mb-4 text-blue-600 hover:underline flex items-center"
          onClick={() => navigate("/admin/users")}
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to User List
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Manage User Roles</h1>
        <p className="text-gray-600 mt-2">
          Assign or remove roles for this user. Each role grants specific
          permissions.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <h3 className="text-lg font-medium text-red-800">Error</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      ) : !user ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-yellow-800">
            User Not Found
          </h3>
          <p className="text-sm text-yellow-700 mt-1">
            The user you're looking for doesn't exist or hasn't completed
            registration.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* User Information */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.displayName}
                </h2>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500">UID: {user.firebaseUid}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {userRoles.length} role{userRoles.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Role Management */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Available Roles
            </h3>
            <div className="grid gap-4">
              {roles.map((role) => {
                const roleName = role.name || role;
                const isAssigned = userRoles.includes(roleName);
                const description =
                  ROLE_DESCRIPTIONS[roleName] || "No description available";

                return (
                  <div
                    key={roleName}
                    className={`border rounded-lg p-4 transition-colors ${
                      isAssigned
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={(e) =>
                              handleRoleChange(roleName, e.target.checked)
                            }
                            disabled={saving}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-3 text-sm font-medium text-gray-900">
                            {roleName}
                          </label>
                          {isAssigned && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Assigned
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 ml-7">
                          {description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Status Messages */}
            {message && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex">
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {saving && (
              <div className="mt-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm text-gray-600">Updating roles...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserRoles;
