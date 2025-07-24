import React, { useState, useEffect } from "react";

/**
 * ProblemForm component for creating/editing a problem.
 * @param {Object} props
 * @param {Object} [props.initial] - Initial values for edit mode
 * @param {Function} props.onSubmit - Called with form data on submit
 * @param {boolean} [props.loading] - Show loading state
 * @param {string} [props.error] - Show error message
 */
const ProblemForm = ({
  initial = {},
  onSubmit,
  loading = false,
  error = "",
}) => {
  const [title, setTitle] = useState(initial.title || "");
  const [description, setDescription] = useState(initial.description || "");
  const [difficulty, setDifficulty] = useState(initial.difficulty || "EASY");
  const [timeLimitMillis, setTimeLimitMillis] = useState(
    initial.timeLimitMillis || 2000
  );
  const [memoryLimitMB, setMemoryLimitMB] = useState(
    initial.memoryLimitMB || 256
  );
  const [tags, setTags] = useState(initial.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [isPublic, setIsPublic] = useState(initial.isPublic || false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setTitle(initial.title || "");
    setDescription(initial.description || "");
    setDifficulty(initial.difficulty || "EASY");
    setTimeLimitMillis(initial.timeLimitMillis || 2000);
    setMemoryLimitMB(initial.memoryLimitMB || 256);
    setTags(initial.tags || []);
    setIsPublic(initial.isPublic || false);
  }, [initial.id]);

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    if (!title.trim() || !description.trim()) {
      setFormError("Title and description are required.");
      return;
    }
    if (title.length > 100) {
      setFormError("Title must be at most 100 characters.");
      return;
    }
    if (description.length > 5000) {
      setFormError("Description is too long.");
      return;
    }
    if (tags.some((t) => t.length > 20)) {
      setFormError("Tags must be at most 20 characters.");
      return;
    }
    onSubmit({
      title,
      description,
      difficulty,
      timeLimitMillis: Number(timeLimitMillis),
      memoryLimitMB: Number(memoryLimitMB),
      tags,
      isPublic,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto"
    >
      <h2 className="text-xl font-bold mb-4">
        {initial.id ? "Edit Problem" : "Create Problem"}
      </h2>
      {(formError || error) && (
        <div className="mb-4 text-red-600 bg-red-100 border border-red-300 rounded px-4 py-2 text-sm">
          {formError || error}
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={100}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={6}
          maxLength={5000}
          required
        />
      </div>
      <div className="mb-4 flex space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="EASY">EASY</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HARD">HARD</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">
            Time Limit (ms)
          </label>
          <input
            type="number"
            value={timeLimitMillis}
            onChange={(e) => setTimeLimitMillis(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={500}
            max={10000}
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">
            Memory Limit (MB)
          </label>
          <input
            type="number"
            value={memoryLimitMB}
            onChange={(e) => setMemoryLimitMB(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={16}
            max={2048}
            required
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Tags</label>
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={20}
            placeholder="Add tag"
          />
          <button
            onClick={handleAddTag}
            className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition"
            type="button"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs flex items-center"
            >
              {tag}
              <button
                type="button"
                className="ml-1 text-red-500 hover:text-red-700"
                onClick={() => handleRemoveTag(tag)}
                aria-label={`Remove tag ${tag}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>
      <div className="mb-6 flex items-center">
        <input
          type="checkbox"
          id="isPublic"
          checked={isPublic}
          onChange={() => setIsPublic((v) => !v)}
          className="mr-2"
        />
        <label htmlFor="isPublic" className="text-sm font-medium">
          Public
        </label>
      </div>
      <div className="flex space-x-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : initial.id
            ? "Update Problem"
            : "Create Problem"}
        </button>
        <button
          type="button"
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition"
          onClick={() => window.history.back()}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProblemForm;
