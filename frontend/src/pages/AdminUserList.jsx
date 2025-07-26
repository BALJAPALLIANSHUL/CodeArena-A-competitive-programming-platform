import React, { useEffect, useState } from "react";
import apiClient from "../services/apiClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Role descriptions for better user understanding
 */
const ROLE_DESCRIPTIONS = {
  USER: "Basic user - can solve problems and participate in contests",
  ADMIN: "System administrator - full access to all features and user management",
  PROBLEM_SETTER: "Can create, edit, and manage problems and test cases",
  TESTER: "Can test problems, validate test cases, and provide feedback",
  CONTEST_MANAGER: "Can create and manage contests, curate problems for contests",
  MODERATOR: "Can moderate user content, review plagiarism, resolve disputes"
};

/**
 * Role color mapping for visual distinction
 */
const ROLE_COLORS = {
  USER: "bg-gray-100 text-gray-700",
  ADMIN: "bg-red-100 text-red-700",
  PROBLEM_SETTER: "bg-blue-100 text-blue-700",
  TESTER: "bg-green-100 text-green-700",
  CONTEST_MANAGER: "bg-purple-100 text-purple-700",
  MODERATOR: "bg-orange-100 text-orange-700"
};

const AdminUserList = () => {
  const { user, hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasRole("ADMIN")) return;
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiClient.get("/users");
        setUsers(res.data);
      } catch (err) {
        setError("Failed to load users.");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [hasRole]);

  if (!hasRole("ADMIN")) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800">Access Denied</h3>
          <p className="text-sm text-red-700 mt-1">
            You need ADMIN privileges to access user management.
          </p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.displayName &&
        u.displayName.toLowerCase().includes(search.toLowerCase()))
  );

  const getRoleColor = (roleName) => {
    return ROLE_COLORS[roleName] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">
          Manage user roles and permissions. Each role grants specific access to platform features.
        </p>
      </div>

      {/* Search and Stats */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-sm text-gray-600">
          {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800">Error</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">
            {search ? 'Try adjusting your search criteria.' : 'No users have been registered yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u.firebaseUid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {u.displayName || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                        <div className="text-xs text-gray-400">UID: {u.firebaseUid}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles && u.roles.length > 0 ? (
                          u.roles.map((r) => {
                            const roleName = r.name || r;
                            return (
                              <span
                                key={roleName}
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(roleName)}`}
                                title={ROLE_DESCRIPTIONS[roleName] || "No description available"}
                              >
                                {roleName}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-gray-400 text-xs">No roles assigned</span>
                        )}
                      </div>
                      {u.roles && u.roles.length > 0 && (
                        <div className="mt-1 text-xs text-gray-500">
                          {u.roles.length} role{u.roles.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => navigate(`/admin/users/${u.firebaseUid}`)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        Manage Roles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserList;
