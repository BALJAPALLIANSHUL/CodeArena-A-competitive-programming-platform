import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";
import { useAuth } from "../context/AuthContext";

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
    return <div className="text-center py-10 text-red-500">Access denied.</div>;
  }

  const userRoles = user?.roles?.map((r) => r.name || r) || [];

  const handleRoleChange = async (role, checked) => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      if (checked) {
        await apiClient.post(`/admin/users/${uid}/roles?role=${role}`);
        setMessage(`Role '${role}' assigned.`);
      } else {
        await apiClient.delete(`/admin/users/${uid}/roles/${role}`);
        setMessage(`Role '${role}' removed.`);
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
    <div className="max-w-xl mx-auto py-8 px-4">
      <button
        className="mb-4 text-blue-600 hover:underline"
        onClick={() => navigate("/admin/users")}
      >
        &larr; Back to User List
      </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Manage Roles</h1>
      {loading ? (
        <div className="text-center py-10 text-lg text-gray-500">
          Loading...
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : !user ? (
        <div className="text-center py-10 text-gray-500">User not found.</div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <div className="font-medium text-gray-700">Email: {user.email}</div>
            <div className="font-medium text-gray-700">
              Display Name: {user.displayName}
            </div>
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-2">Roles:</div>
            {roles.map((role) => {
              const roleName = role.name || role;
              return (
                <label key={roleName} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={userRoles.includes(roleName)}
                    onChange={(e) =>
                      handleRoleChange(roleName, e.target.checked)
                    }
                    disabled={saving}
                    className="mr-2"
                  />
                  <span>{roleName}</span>
                </label>
              );
            })}
          </div>
          {message && <div className="mb-2 text-green-600">{message}</div>}
          {saving && <div className="text-gray-500 text-sm">Saving...</div>}
        </div>
      )}
    </div>
  );
};

export default AdminUserRoles;
