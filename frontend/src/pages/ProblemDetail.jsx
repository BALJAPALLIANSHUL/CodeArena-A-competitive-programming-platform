import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/apiClient";
import { useNavigate, useParams } from "react-router-dom";

/**
 * ProblemDetail page: shows a single problem's details.
 * Shows Edit/Delete for creator/admin.
 */
const ProblemDetail = () => {
  const { user, hasRole } = useAuth();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiClient.get(`/problems/${id}`);
        setProblem(res.data);
      } catch (err) {
        setError("Failed to load problem.");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <button
        className="mb-4 text-blue-600 hover:underline"
        onClick={() => navigate("/problems")}
      >
        &larr; Back to List
      </button>
      {loading ? (
        <div className="text-center py-10 text-lg text-gray-500">
          Loading...
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : !problem ? (
        <div className="text-center py-10 text-gray-500">
          Problem not found.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-800">
              {problem.title}
            </h2>
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                problem.difficulty === "EASY"
                  ? "bg-green-100 text-green-700"
                  : problem.difficulty === "MEDIUM"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {problem.difficulty}
            </span>
          </div>
          <div className="mb-2 text-gray-600 text-sm">
            <span className="mr-4">
              Time Limit:{" "}
              <span className="font-medium">{problem.timeLimitMillis} ms</span>
            </span>
            <span className="mr-4">
              Memory Limit:{" "}
              <span className="font-medium">{problem.memoryLimitMB} MB</span>
            </span>
            <span>
              Public:{" "}
              {problem.isPublic ? (
                <span className="text-green-600 font-bold">Yes</span>
              ) : (
                <span className="text-gray-400">No</span>
              )}
            </span>
          </div>
          <div className="mb-2">
            {problem.tags && problem.tags.length > 0 ? (
              problem.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-gray-200 text-gray-700 px-2 py-0.5 rounded mr-1 text-xs"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-xs">No tags</span>
            )}
          </div>
          <div className="mb-4 text-gray-700 whitespace-pre-line">
            {problem.description}
          </div>
          <div className="flex space-x-2">
            {/* Test Cases Link */}
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              onClick={() => navigate(`/problems/${problem.id}/testcases`)}
            >
              Test Cases ({problem.testCaseCount || 0})
            </button>
            
            {/* Edit/Delete buttons for problem creators/admins */}
            {(hasRole("PROBLEM_SETTER") || hasRole("ADMIN")) &&
              user &&
              (user.displayName === problem.createdBy || hasRole("ADMIN")) && (
                <>
                  <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
                    onClick={() => navigate(`/problems/${problem.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    onClick={() => navigate(`/problems/${problem.id}/delete`)}
                  >
                    Delete
                  </button>
                </>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemDetail;
