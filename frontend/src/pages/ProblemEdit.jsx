import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProblemForm from "../components/ProblemForm";
import apiClient from "../services/apiClient";

const ProblemEdit = () => {
  const { id } = useParams();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiClient.get(`/problems/${id}`);
        setInitial(res.data.data);
      } catch (err) {
        setError("Failed to load problem.");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  const handleSubmit = async (data) => {
    setSubmitLoading(true);
    setSubmitError("");
    try {
      await apiClient.put(`/problems/${id}`, data);
      navigate(`/problems/${id}`);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || "Failed to update problem."
      );
    } finally {
      setSubmitLoading(false);
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
  if (!initial) {
    return (
      <div className="text-center py-10 text-gray-500">Problem not found.</div>
    );
  }

  return (
    <div className="py-8 px-4">
      <ProblemForm
        initial={initial}
        onSubmit={handleSubmit}
        loading={submitLoading}
        error={submitError}
      />
    </div>
  );
};

export default ProblemEdit;
