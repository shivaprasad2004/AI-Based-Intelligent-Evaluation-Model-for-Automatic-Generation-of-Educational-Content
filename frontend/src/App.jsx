import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QuizProvider } from './context/QuizContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import TopicManagePage from './pages/TopicManagePage';
import TopicQuestionsPage from './pages/TopicQuestionsPage';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import BrowsePage from './pages/BrowsePage';
import CategoryDetailPage from './pages/CategoryDetailPage';
import SearchResultsPage from './pages/SearchResultsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import BookmarksPage from './pages/BookmarksPage';
import TopicDetailPage from './pages/TopicDetailPage';
import AIChatbot from './components/AIChatbot';
import SearchPage from './pages/SearchPage';
import DynamicQuizPage from './pages/DynamicQuizPage';
import DynamicResultsPage from './pages/DynamicResultsPage';
import LearningDashboard from './pages/LearningDashboard';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading EvalAI...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {user && <Navbar />}
      <div className={user ? "min-h-screen bg-gray-50 dark:bg-gray-900 mesh-gradient" : ""}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />

          {/* Landing page for unauthenticated, Dashboard for authenticated */}
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Protected routes */}
          <Route path="/browse" element={<ProtectedRoute><BrowsePage /></ProtectedRoute>} />
          <Route path="/categories/:categoryId" element={<ProtectedRoute><CategoryDetailPage /></ProtectedRoute>} />
          <Route path="/topics/:topicId/learn" element={<ProtectedRoute><TopicDetailPage /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchResultsPage /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
          <Route path="/dynamic-quiz" element={<ProtectedRoute role="student"><DynamicQuizPage /></ProtectedRoute>} />
          <Route path="/dynamic-results" element={<ProtectedRoute><DynamicResultsPage /></ProtectedRoute>} />
          <Route path="/learning-dashboard" element={<ProtectedRoute role="student"><LearningDashboard /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/bookmarks" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />
          <Route path="/topics" element={<ProtectedRoute role="educator"><TopicManagePage /></ProtectedRoute>} />
          <Route path="/topics/:topicId/questions" element={<ProtectedRoute role="educator"><TopicQuestionsPage /></ProtectedRoute>} />
          <Route path="/quiz" element={<ProtectedRoute role="student"><QuizPage /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      {user && user.role === 'student' && <AIChatbot />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <QuizProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'dark:bg-gray-800 dark:text-white',
                duration: 3000,
              }}
            />
          </QuizProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
