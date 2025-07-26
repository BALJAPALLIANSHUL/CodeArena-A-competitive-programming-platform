import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TestCaseList from '../components/TestCaseList';

/**
 * Page component for displaying test cases for a specific problem.
 * Includes navigation breadcrumbs and page layout.
 */
const TestCaseListPage = () => {
    const { problemId } = useParams();
    const navigate = useNavigate();
    
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    {/* Breadcrumb Navigation */}
                    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                        <button
                            onClick={() => navigate('/problems')}
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
                        <span className="text-gray-900">Test Cases</span>
                    </nav>
                    
                    {/* Page Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Test Cases</h1>
                            <p className="text-gray-600 mt-2">
                                Manage test cases for problem #{problemId}. Test cases are used to validate user submissions.
                            </p>
                        </div>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate(`/problems/${problemId}`)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Back to Problem
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Test Cases List */}
                <TestCaseList />
            </div>
        </div>
    );
};

export default TestCaseListPage; 