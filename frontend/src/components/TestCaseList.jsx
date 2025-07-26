import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/apiClient";

/**
 * TestCaseList component for displaying and managing test cases.
 * Supports filtering, sorting, and role-based actions.
 */
const TestCaseList = () => {
  const { problemId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, sample, hidden
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyVisible, setShowOnlyVisible] = useState(false);

  // Load test cases
  useEffect(() => {
    loadTestCases();
  }, [problemId]);

  const loadTestCases = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/testcases/problems/${problemId}`);
      // Fix: Handle the correct response structure
      setTestCases(response.data || []);
    } catch (error) {
      console.error("Error loading test cases:", error);
      setError("Failed to load test cases");
    } finally {
      setLoading(false);
    }
  };

  // Check user permissions
  const canManageTestCases = user?.roles?.some((role) =>
    ["ADMIN", "PROBLEM_SETTER", "TESTER"].includes(role)
  );

  const canViewHiddenTestCases = user?.roles?.some((role) =>
    ["ADMIN", "PROBLEM_SETTER", "TESTER"].includes(role)
  );

  // Filter and search test cases
  const filteredTestCases = testCases.filter((testCase) => {
    // Apply search filter
    if (
      searchTerm &&
      !testCase.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Apply type filter
    if (filter === "sample" && !testCase.isSample) {
      return false;
    }
    if (filter === "hidden" && !testCase.isHidden) {
      return false;
    }

    // Apply visibility filter
    if (showOnlyVisible && testCase.isHidden && !canViewHiddenTestCases) {
      return false;
    }

    return true;
  });

  // Handle test case deletion
  const handleDelete = async (testCaseId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this test case? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await apiClient.delete(`/testcases/${testCaseId}`);
      await loadTestCases(); // Reload the list
    } catch (error) {
      console.error("Error deleting test case:", error);
      alert("Failed to delete test case");
    }
  };

  // Handle test case edit
  const handleEdit = (testCaseId) => {
    navigate(`/problems/${problemId}/testcases/${testCaseId}/edit`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-lg font-medium text-red-800">Error</h3>
        <p className="text-sm text-red-700 mt-1">{error}</p>
        <button
          onClick={loadTestCases}
          className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Test Cases</h2>
          <p className="text-gray-600 mt-1">
            {filteredTestCases.length} of {testCases.length} test cases
          </p>
        </div>

        {canManageTestCases && (
          <button
            onClick={() => navigate(`/problems/${problemId}/testcases/create`)}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Test Case
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search test cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Test Cases</option>
            <option value="sample">Sample Only</option>
            <option value="hidden">Hidden Only</option>
          </select>

          {/* Visibility Toggle */}
          {canViewHiddenTestCases && (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showOnlyVisible}
                onChange={(e) => setShowOnlyVisible(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Show only visible
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Test Cases List */}
      {filteredTestCases.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No test cases found
          </h3>
          <p className="text-gray-600">
            {searchTerm || filter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "No test cases have been created for this problem yet."}
          </p>
          {canManageTestCases && !searchTerm && filter === "all" && (
            <button
              onClick={() =>
                navigate(`/problems/${problemId}/testcases/create`)
              }
              className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Create First Test Case
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  {canManageTestCases && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTestCases.map((testCase) => (
                  <tr key={testCase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {testCase.name}
                        </span>
                        {testCase.isHidden && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            Hidden
                          </span>
                        )}
                        {testCase.isSample && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Sample
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {testCase.description || "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {testCase.isSample ? "Sample" : "Regular"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {testCase.fileSize
                          ? `${(testCase.fileSize / 1024).toFixed(1)} KB`
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(testCase.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    {canManageTestCases && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(testCase.id)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(testCase.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
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

export default TestCaseList;
