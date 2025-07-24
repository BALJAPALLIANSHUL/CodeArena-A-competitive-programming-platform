import React, { useEffect, useState } from "react";
import apiClient from "../services/apiClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
        const res = await apiClient.get("/users"); // Assumes GET /users returns all users
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
    return <div className="text-center py-10 text-red-500">Access denied.</div>;
  }

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.displayName &&
        u.displayName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">User Management</h1>
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {loading ? (
        <div className="text-center py-10 text-lg text-gray-500">
          Loading users...
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No users found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Display Name</th>
                <th className="py-3 px-4">Roles</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr
                  key={u.firebaseUid}
                  className="border-b hover:bg-blue-50 transition"
                >
                  <td className="py-2 px-4">{u.email}</td>
                  <td className="py-2 px-4">{u.displayName}</td>
                  <td className="py-2 px-4">
                    {u.roles && u.roles.length > 0 ? (
                      u.roles.map((r) => (
                        <span
                          key={r.name || r}
                          className="inline-block bg-gray-200 text-gray-700 px-2 py-0.5 rounded mr-1 text-xs"
                        >
                          {r.name || r}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">None</span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => navigate(`/admin/users/${u.firebaseUid}`)}
                    >
                      Manage Roles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUserList;
