import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProblemForm from "../components/ProblemForm";
import apiClient from "../services/apiClient";

const ProblemCreate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.post("/problems", data);
      const id = res.data.data.id;
      navigate(`/problems/${id}`);
    } catch (err) {
      // Try to extract a clear error message from backend or network error
      let msg = "Failed to create problem.";
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 px-4">
      {error && (
        <div className="mb-6 max-w-2xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center text-base font-medium shadow">
          {error === "Failed to create problem." ||
          error.toLowerCase().includes("server") ||
          error.toLowerCase().includes("network") ||
          error.toLowerCase().includes("unavailable")
            ? "The server is currently unavailable. Please check your connection or try again later. You can still fill out the form, but submission will not work until the server is back online."
            : error}
        </div>
      )}
      <ProblemForm onSubmit={handleSubmit} loading={loading} error={error} />
    </div>
  );
};

export default ProblemCreate;
