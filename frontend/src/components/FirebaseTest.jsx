import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';

/**
 * Firebase Test Component
 * Simple component to test Firebase authentication functionality
 */
const FirebaseTest = () => {
  const { user, signIn, signOut, register } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [displayName, setDisplayName] = useState('Test User');

  const handleTestSignIn = async () => {
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Test sign in failed:', error);
    }
  };

  const handleTestRegister = async () => {
    try {
      await register(email, password, displayName);
    } catch (error) {
      console.error('Test registration failed:', error);
    }
  };

  const handleTestSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Test sign out failed:', error);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md border-2 border-blue-500">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">
        Firebase Auth Test
      </h2>
      
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Current Auth State:</h3>
        {user ? (
          <div>
            <p><strong>Signed in as:</strong> {user.email}</p>
            <p><strong>UID:</strong> {user.uid}</p>
            <p><strong>Display Name:</strong> {user.displayName || 'N/A'}</p>
            <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
          </div>
        ) : (
          <p className="text-red-600">Not signed in</p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Display Name:</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleTestRegister}
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
          >
            Test Register
          </button>
          <button
            onClick={handleTestSignIn}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Test Sign In
          </button>
        </div>

        {user && (
          <button
            onClick={handleTestSignOut}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
          >
            Test Sign Out
          </button>
        )}
      </div>

      <div className="mt-4 p-3 bg-yellow-100 rounded">
        <h4 className="font-semibold mb-2">Firebase Config Status:</h4>
        <p><strong>Auth Instance:</strong> {auth ? '✅ Loaded' : '❌ Failed'}</p>
        <p><strong>Project ID:</strong> {auth?.app?.options?.projectId || 'N/A'}</p>
      </div>
    </div>
  );
};

export default FirebaseTest; 