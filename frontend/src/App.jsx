import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { FaGraduationCap, FaSignOutAlt, FaUser } from 'react-icons/fa';
import useAuthStore from './store/authStore';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import QuestionList from './features/questions/QuestionList';
import QuestionForm from './features/questions/QuestionForm';
import QuizList from './features/quizzes/QuizList';
import QuizBuilder from './features/quizzes/QuizBuilder';
import QuizPlayer from './features/quizzes/QuizPlayer';
import QuizHistory from './features/quizzes/QuizHistory';
import QuizStats from './features/quizzes/QuizStats';
import UserManagement from './features/admin/UserManagement';
import Dashboard from './features/dashboard/Dashboard';
import QuestionDetail from './features/questions/QuestionDetail';
import SubjectManagement from './features/subjects/SubjectManagement';
import PracticeSubjects from './features/practice/PracticeSubjects';
import PracticePlayer from './features/practice/PracticePlayer';

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

          {user && (
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
              {(user.role === 'Admin' || user.role === 'Instructor') && (
                <Link to="/" className="hover:text-blue-600 transition">Dashboard</Link>
              )}
              {(user.role === 'Admin' || user.role === 'Instructor') ? (
                  <Link to="/questions" className="hover:text-blue-600 transition">Questions</Link>
              ) : (
                  <Link to="/practice" className="hover:text-blue-600 transition">Practice</Link>
              )}
              {(user.role === 'Admin' || user.role === 'Instructor') && <Link to="/subjects" className="hover:text-blue-600 transition">Subjects</Link>}
              <Link to="/quizzes" className="hover:text-blue-600 transition">Quizzes</Link>
              {user.role === 'Student' && <Link to="/history" className="hover:text-blue-600 transition">My History</Link>}
              {user.role === 'Admin' && <Link to="/admin/users" className="hover:text-blue-600 transition">Users</Link>}
            </nav>
          )}

          <div>
            {user ? (
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
                    <FaUser size={14} />
                  </div>
                  <div className="hidden lg:block text-left">
                    <span className="font-bold block truncate max-w-[100px] leading-none">{user.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{user.role}</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 transition-colors bg-red-50 px-3 py-1.5 rounded-lg border border-red-100"
                >
                  <FaSignOutAlt />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-4 border border-gray-200 rounded-lg p-1 bg-gray-50 shadow-inner">
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-sm font-bold rounded-md text-gray-700 hover:bg-white hover:shadow-sm transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-bold rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && (
          <div className="md:hidden border-t border-gray-100 py-2 px-4 flex justify-around bg-gray-50/50">
            {(user.role === 'Admin' || user.role === 'Instructor') && (
              <Link to="/" className="text-xs font-bold text-gray-600 hover:text-blue-600 flex flex-col items-center gap-1 p-2">
                <span>Dashboard</span>
              </Link>
            )}
            {(user.role === 'Admin' || user.role === 'Instructor') ? (
              <Link to="/questions" className="text-xs font-bold text-gray-600 hover:text-blue-600 flex flex-col items-center gap-1 p-2">
                <span>Questions</span>
              </Link>
            ) : (
              <Link to="/practice" className="text-xs font-bold text-gray-600 hover:text-blue-600 flex flex-col items-center gap-1 p-2">
                <span>Practice</span>
              </Link>
            )}
            <Link to="/quizzes" className="text-xs font-bold text-gray-600 hover:text-blue-600 flex flex-col items-center gap-1 p-2">
              <span>Quizzes</span>
            </Link>
            {(user.role === 'Admin' || user.role === 'Instructor') && (
              <Link to="/subjects" className="text-xs font-bold text-gray-600 hover:text-blue-600 flex flex-col items-center gap-1 p-2">
                <span>Subjects</span>
              </Link>
            )}
            {user.role === 'Student' && (
              <Link to="/history" className="text-xs font-bold text-gray-600 hover:text-blue-600 flex flex-col items-center gap-1 p-2">
                <span>History</span>
              </Link>
            )}
            {user.role === 'Admin' && (
              <Link to="/admin/users" className="text-xs font-bold text-gray-600 hover:text-blue-600 flex flex-col items-center gap-1 p-2">
                <span>Users</span>
              </Link>
            )}
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                user.role === 'Student' ? <Navigate to="/practice" /> : <Dashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          
          {/* Practice Routes for Students */}
          <Route path="/practice" element={user ? <PracticeSubjects /> : <Navigate to="/login" />} />
          <Route path="/practice/:subjectId" element={user ? <PracticePlayer /> : <Navigate to="/login" />} />
          
          <Route path="/questions" element={user && (user.role === 'Admin' || user.role === 'Instructor') ? <QuestionList /> : <Navigate to="/practice" />} />
          <Route path="/questions/new" element={user && (user.role === 'Admin' || user.role === 'Instructor') ? <QuestionForm /> : <Navigate to="/practice" />} />
          <Route path="/questions/:id" element={user && (user.role === 'Admin' || user.role === 'Instructor') ? <QuestionDetail /> : <Navigate to="/practice" />} />
          <Route path="/questions/:id/edit" element={user && (user.role === 'Admin' || user.role === 'Instructor') ? <QuestionForm /> : <Navigate to="/practice" />} />
          <Route path="/subjects" element={user && (user.role === 'Admin' || user.role === 'Instructor') ? <SubjectManagement /> : <Navigate to="/login" />} />

          {/* Quiz Routes */}
          <Route path="/quizzes" element={user ? <QuizList /> : <Navigate to="/login" />} />
          <Route path="/quizzes/new" element={user && (user.role === 'Admin' || user.role === 'Instructor') ? <QuizBuilder /> : <Navigate to="/quizzes" />} />
          <Route path="/quizzes/:id/edit" element={user && (user.role === 'Admin' || user.role === 'Instructor') ? <QuizBuilder /> : <Navigate to="/quizzes" />} />
          <Route path="/quizzes/:id" element={user ? <QuizPlayer /> : <Navigate to="/login" />} />
          <Route path="/quizzes/:id/stats" element={user && (user.role === 'Admin' || user.role === 'Instructor') ? <QuizStats /> : <Navigate to="/quizzes" />} />
          <Route path="/history" element={user && user.role === 'Student' ? <QuizHistory /> : <Navigate to="/" />} />
          <Route path="/admin/users" element={user && user.role === 'Admin' ? <UserManagement /> : <Navigate to="/" />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
