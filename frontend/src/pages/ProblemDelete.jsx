import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../services/apiClient";

const ProblemDelete = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiClient.get(`/problems/${id}`);
        setProblem(res.data.data);
      } catch (err) {
        setError("Failed to load problem.");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await apiClient.delete(`/problems/${id}`);
      navigate("/problems");
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Failed to delete problem."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-lg text-gray-500">Loading...</div>
    );
  }
  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }
  if (!problem) {
    return (
      <div className="text-center py-10 text-gray-500">Problem not found.</div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-red-600 mb-4">Delete Problem</h2>
        <p className="mb-4 text-gray-700">
          Are you sure you want to delete the problem{" "}
          <span className="font-semibold">{problem.title}</span>?
          <br />
          This action cannot be undone.
        </p>
        {deleteError && (
          <div className="mb-4 text-red-600 bg-red-100 border border-red-300 rounded px-4 py-2 text-sm">
            {deleteError}
          </div>
        )}
        <div className="flex space-x-2">
          <button
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Yes, Delete"}
          </button>
          <button
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition"
            onClick={() => navigate(`/problems/${id}`)}
            disabled={deleting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProblemDelete;
