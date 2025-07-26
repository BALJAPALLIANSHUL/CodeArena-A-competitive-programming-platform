import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/apiClient";
import TestCaseForm from "../components/TestCaseForm";

/**
 * Page component for editing existing test cases.
 * Includes permission checks, data loading, and navigation handling.
 */
const TestCaseEdit = () => {
  const { problemId, testCaseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [testCase, setTestCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load test case data
  useEffect(() => {
    loadTestCase();
  }, [testCaseId]);

  const loadTestCase = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/testcases/${testCaseId}`);
      // Fix: Handle the correct response structure
      setTestCase(response.data);
    } catch (error) {
      console.error("Error loading test case:", error);
      setError("Failed to load test case");
    } finally {
      setLoading(false);
    }
  };

  // Check if user has permission to edit test cases
  const canEditTestCases = user?.roles?.some((role) =>
    ["ADMIN", "PROBLEM_SETTER", "TESTER"].includes(role)
  );

  const handleSuccess = () => {
    // Navigate back to the problem's test cases list
    navigate(`/problems/${problemId}/testcases`);
  };

  const handleCancel = () => {
    // Navigate back to the problem's test cases list
    navigate(`/problems/${problemId}/testcases`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={loadTestCase}
              className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => navigate(`/problems/${problemId}/testcases`)}
              className="mt-3 ml-2 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              Back to Test Cases
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!canEditTestCases) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-red-800">Access Denied</h3>
            <p className="text-sm text-red-700 mt-1">
              You don't have permission to edit test cases. Only problem
              setters, testers, and admins can edit test cases.
            </p>
            <button
              onClick={() => navigate(`/problems/${problemId}/testcases`)}
              className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
            >
              Back to Test Cases
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!testCase) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-yellow-800">
              Test Case Not Found
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              The test case you're looking for doesn't exist or has been
              deleted.
            </p>
            <button
              onClick={() => navigate(`/problems/${problemId}/testcases`)}
              className="mt-3 px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition-colors"
            >
              Back to Test Cases
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <button
              onClick={() => navigate("/problems")}
              className="hover:text-gray-700 transition-colors"
            >
              Problems
            </button>
            <span>/</span>
            <button
              onClick={() => navigate(`/problems/${problemId}`)}
              className="hover:text-gray-700 transition-colors"
            >
              Problem {problemId}
            </button>
            <span>/</span>
            <button
              onClick={() => navigate(`/problems/${problemId}/testcases`)}
              className="hover:text-gray-700 transition-colors"
            >
              Test Cases
            </button>
            <span>/</span>
            <span className="text-gray-900">Edit Test Case</span>
          </nav>

          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit Test Case
              </h1>
              <p className="text-gray-600 mt-2">
                Update test case "{testCase.name}" for problem #{problemId}.
              </p>
            </div>
          </div>
        </div>

        {/* Test Case Form */}
        <TestCaseForm
          mode="edit"
          testCase={testCase}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default TestCaseEdit;
