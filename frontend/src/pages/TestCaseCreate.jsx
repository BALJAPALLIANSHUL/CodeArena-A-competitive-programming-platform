import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TestCaseForm from "../components/TestCaseForm";

/**
 * Page component for creating new test cases.
 * Includes permission checks and navigation handling.
 */
const TestCaseCreate = () => {
  const { problemId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user has permission to create test cases
  const canCreateTestCases = user?.roles?.some((role) =>
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

  if (!canCreateTestCases) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800">Access Denied</h3>
          <p className="text-sm text-red-700 mt-1">
            You don't have permission to create test cases. Only problem
            setters, testers, and admins can create test cases.
          </p>
          <button
            onClick={() => navigate(`/problems/${problemId}/testcases`)}
            className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
          >
            Back to Test Cases
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
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
            <span className="text-gray-900">Create Test Case</span>
          </nav>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create Test Case
              </h1>
              <p className="text-gray-600 mt-2">
                Add a new test case for problem #{problemId}. You can create
                individual test cases or upload multiple test cases at once.
              </p>
            </div>
          </div>
        </div>

        <TestCaseForm
          mode="create"
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default TestCaseCreate;
