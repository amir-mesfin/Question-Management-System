import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { FaGraduationCap, FaSignOutAlt, FaUser } from 'react-icons/fa';
import useAuthStore from './store/authStore';
import Login from './features/auth/Login';
import Register from './features/auth/Register';

function App() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <FaGraduationCap className="text-4xl text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 hidden sm:block">
              QMS Platform
            </h1>
          </Link>

          <div>
            {user ? (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <FaUser />
                  </div>
                  <span className="font-medium hidden sm:block">{user.name}</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 font-semibold border border-gray-200">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition"
                >
                  <FaSignOutAlt />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-4 border border-gray-200 rounded-lg p-1 bg-gray-50">
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-sm font-medium rounded-md text-gray-700 hover:bg-white hover:shadow-sm transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <div className="px-4 py-6 sm:px-0">
                  <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center bg-white p-6">
                    <h2 className="text-2xl font-semibold mb-2">Welcome to the Dashboard, {user.name}!</h2>
                    <p className="text-gray-500 mb-4">You are logged in as a <strong className="text-blue-600">{user.role}</strong>.</p>
                    <p className="text-gray-400 text-sm max-w-md text-center">
                      (Question management features will be implemented in the next phase.)
                    </p>
                  </div>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
