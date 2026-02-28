import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { FaGraduationCap } from 'react-icons/fa';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center gap-3">
          <FaGraduationCap className="text-4xl text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Question Management System
          </h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center bg-white">
              <h2 className="text-2xl font-semibold mb-2">Welcome to the QMS</h2>
              <p className="text-gray-500 max-w-md text-center">
                The frontend has been successfully scaffolded with React, Tailwind v4, React Router, and React Icons.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
