import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/apiClient";
import { useNavigate } from "react-router-dom";

/**
 * Problems page: lists all problems visible to the user.
 * Shows 'Create Problem' button for PROBLEM_SETTER/ADMIN.
 */
const Problems = () => {
  const { user, hasRole } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiClient.get("/problems");
        setProblems(res.data);
      } catch (err) {
        setError("Failed to load problems.");
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Problems</h1>
        {(hasRole("PROBLEM_SETTER") || hasRole("ADMIN")) && (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
            onClick={() => navigate("/problems/create")}
          >
            + Create Problem
          </button>
        )}
      </div>
      {loading ? (
        <div className="text-center py-10 text-lg text-gray-500">
          Loading...
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : problems.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No problems found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Tags</th>
                <th className="py-3 px-4">Public</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((p) => (
                <tr key={p.id} className="border-b hover:bg-blue-50 transition">
                  <td
                    className="py-2 px-4 font-medium text-blue-800 cursor-pointer"
                    onClick={() => navigate(`/problems/${p.id}`)}
                  >
                    {p.title}
                  </td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        p.difficulty === "EASY"
                          ? "bg-green-100 text-green-700"
                          : p.difficulty === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {p.difficulty}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    {p.tags && p.tags.length > 0 ? (
                      p.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block bg-gray-200 text-gray-700 px-2 py-0.5 rounded mr-1 text-xs"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">None</span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {p.isPublic ? (
                      <span className="text-green-600 font-bold">Yes</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  <td className="py-2 px-4 space-x-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => navigate(`/problems/${p.id}`)}
                    >
                      View
                    </button>
                    {(hasRole("PROBLEM_SETTER") || hasRole("ADMIN")) &&
                      user &&
                      (user.displayName === p.createdBy ||
                        hasRole("ADMIN")) && (
                        <>
                          <button
                            className="text-yellow-600 hover:underline"
                            onClick={() => navigate(`/problems/${p.id}/edit`)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-600 hover:underline"
                            onClick={() => navigate(`/problems/${p.id}/delete`)}
                          >
                            Delete
                          </button>
                        </>
                      )}
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

export default Problems;
