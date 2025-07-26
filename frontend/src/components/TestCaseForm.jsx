import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/apiClient";

/**
 * TestCaseForm component for creating and editing test cases.
 * Supports both individual test case creation and bulk upload.
 */
const TestCaseForm = ({
  mode = "create",
  testCase = null,
  onSuccess,
  onCancel,
}) => {
  const { problemId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    inputContent: "",
    outputContent: "",
    isHidden: false,
    isSample: false,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const [bulkFormat, setBulkFormat] = useState("json");

  // Character counters
  const [nameCount, setNameCount] = useState(0);
  const [descriptionCount, setDescriptionCount] = useState(0);

  // Initialize form data if editing
  useEffect(() => {
    if (mode === "edit" && testCase) {
      setFormData({
        name: testCase.name || "",
        description: testCase.description || "",
        inputContent: testCase.inputContent || "",
        outputContent: testCase.outputContent || "",
        isHidden: testCase.isHidden || false,
        isSample: testCase.isSample || false,
      });
    }
  }, [mode, testCase]);

  // Update character counters
  useEffect(() => {
    setNameCount(formData.name.length);
    setDescriptionCount(formData.description.length);
  }, [formData.name, formData.description]);

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Test case name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Name must be 100 characters or less";
    }

    // Description validation
    if (formData.description.length > 500) {
      newErrors.description = "Description must be 500 characters or less";
    }

    // Input content validation
    if (!formData.inputContent.trim()) {
      newErrors.inputContent = "Input content is required";
    }

    // Output content validation
    if (!formData.outputContent.trim()) {
      newErrors.outputContent = "Output content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (mode === "create") {
        await apiClient.post(`/testcases/problems/${problemId}`, formData);
      } else {
        await apiClient.put(`/testcases/${testCase.id}`, formData);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/problems/${problemId}/testcases`);
      }
    } catch (error) {
      console.error("Error saving test case:", error);
      setErrors({
        submit: error.response?.data?.message || "Failed to save test case",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk upload
  const handleBulkUpload = async () => {
    if (!bulkData.trim()) {
      setErrors({ bulk: "Please provide test case data" });
      return;
    }

    setLoading(true);

    try {
      let testCases;

      if (bulkFormat === "json") {
        const parsedData = JSON.parse(bulkData);
        // Handle both direct array and wrapped object formats
        testCases = parsedData.testCases || parsedData;
      } else {
        // Parse CSV format
        const lines = bulkData.trim().split("\n");
        testCases = lines.map((line, index) => {
          const [name, description, input, output, isHidden, isSample] =
            line.split(",");
          return {
            name: name?.trim() || `Test Case ${index + 1}`,
            description: description?.trim() || "",
            inputContent: input?.trim() || "",
            outputContent: output?.trim() || "",
            isHidden: isHidden?.trim() === "true",
            isSample: isSample?.trim() === "true",
          };
        });
      }

      await apiClient.post(`/testcases/problems/${problemId}/bulk`, {
        testCases: Array.isArray(testCases) ? testCases : [testCases],
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/problems/${problemId}/testcases`);
      }
    } catch (error) {
      console.error("Error uploading test cases:", error);
      setErrors({
        bulk: error.response?.data?.message || "Failed to upload test cases",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear field-specific errors
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === "create" ? "Create Test Case" : "Edit Test Case"}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkUpload(!showBulkUpload)}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
          >
            {showBulkUpload ? "Single Form" : "Bulk Upload"}
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {showBulkUpload ? (
        <BulkUploadForm
          bulkData={bulkData}
          setBulkData={setBulkData}
          bulkFormat={bulkFormat}
          setBulkFormat={setBulkFormat}
          onSubmit={handleBulkUpload}
          loading={loading}
          errors={errors}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Test Case Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., Sample Test Case 1"
              maxLength={100}
            />
            <div className="flex justify-between mt-1">
              <span className="text-sm text-red-600">{errors.name}</span>
              <span className="text-sm text-gray-500">{nameCount}/100</span>
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Describe what this test case validates..."
              maxLength={500}
            />
            <div className="flex justify-between mt-1">
              <span className="text-sm text-red-600">{errors.description}</span>
              <span className="text-sm text-gray-500">
                {descriptionCount}/500
              </span>
            </div>
          </div>

          {/* Input Content Field */}
          <div>
            <label
              htmlFor="inputContent"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Input Content *
            </label>
            <textarea
              id="inputContent"
              name="inputContent"
              value={formData.inputContent}
              onChange={handleInputChange}
              rows={8}
              className={`w-full px-3 py-2 border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.inputContent ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter the input data for this test case..."
            />
            <span className="text-sm text-red-600">{errors.inputContent}</span>
          </div>

          {/* Output Content Field */}
          <div>
            <label
              htmlFor="outputContent"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Expected Output *
            </label>
            <textarea
              id="outputContent"
              name="outputContent"
              value={formData.outputContent}
              onChange={handleInputChange}
              rows={8}
              className={`w-full px-3 py-2 border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.outputContent ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter the expected output for this test case..."
            />
            <span className="text-sm text-red-600">{errors.outputContent}</span>
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isHidden"
                name="isHidden"
                checked={formData.isHidden}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isHidden"
                className="ml-2 block text-sm text-gray-700"
              >
                Hidden Test Case
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isSample"
                name="isSample"
                checked={formData.isSample}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isSample"
                className="ml-2 block text-sm text-gray-700"
              >
                Sample Test Case
              </label>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? "Saving..."
                : mode === "create"
                ? "Create Test Case"
                : "Update Test Case"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

/**
 * BulkUploadForm component for uploading multiple test cases at once.
 */
const BulkUploadForm = ({
  bulkData,
  setBulkData,
  bulkFormat,
  setBulkFormat,
  onSubmit,
  loading,
  errors,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          Bulk Upload Test Cases
        </h3>
        <p className="text-sm text-blue-700">
          Upload multiple test cases at once using JSON or CSV format. This is
          useful for creating large numbers of test cases efficiently.
        </p>
      </div>

      {/* Format Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Format
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="json"
              checked={bulkFormat === "json"}
              onChange={(e) => setBulkFormat(e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">JSON</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="csv"
              checked={bulkFormat === "csv"}
              onChange={(e) => setBulkFormat(e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">CSV</span>
          </label>
        </div>
      </div>

      {/* Format Instructions */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Format Instructions:
        </h4>
        {bulkFormat === "json" ? (
          <pre className="text-xs text-gray-600 overflow-x-auto">
            {`{
  "testCases": [
    {
      "name": "Test Case 1",
      "description": "Sample test case",
      "inputContent": "2 7 11 15\\n9",
      "outputContent": "0 1",
      "isHidden": false,
      "isSample": true
    }
  ]
}`}
          </pre>
        ) : (
          <div className="text-xs text-gray-600">
            <p>CSV Format: name,description,input,output,isHidden,isSample</p>
            <p className="mt-1">
              Example: "Basic Test","Simple test case","2 7 11 15\n9","0
              1",false,true
            </p>
            <p className="mt-1 text-red-600">
              Note: Use double quotes around fields, escape newlines with \\n
            </p>
          </div>
        )}
      </div>

      {/* Data Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Case Data
        </label>
        <textarea
          value={bulkData}
          onChange={(e) => setBulkData(e.target.value)}
          rows={12}
          className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={
            bulkFormat === "json"
              ? "Paste JSON data here..."
              : "Paste CSV data here..."
          }
        />
        <span className="text-sm text-red-600">{errors.bulk}</span>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={onSubmit}
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Uploading..." : "Upload Test Cases"}
        </button>
      </div>
    </div>
  );
};

export default TestCaseForm;
