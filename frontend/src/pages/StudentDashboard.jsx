import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import PageTransition from '../components/ui/PageTransition';
import StatCard from '../components/ui/StatCard';
import GlassCard from '../components/ui/GlassCard';
import StreakDisplay from '../components/StreakDisplay';
import CategoryCard from '../components/CategoryCard';
import { motion } from 'framer-motion';
import { Play, Compass, Zap, Target, BookOpen, TrendingUp, Clock, Award, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [topicProgress, setTopicProgress] = useState([]);
  const [scoreTrend, setScoreTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/topics/'),
      api.get('/categories/'),
      api.get('/analytics/student/overview').catch(() => ({ data: null })),
      api.get('/analytics/student/recent-quizzes').catch(() => ({ data: { recent_quizzes: [] } })),
      api.get('/analytics/student/topic-progress').catch(() => ({ data: { topic_progress: [] } })),
      api.get('/analytics/student/score-trend').catch(() => ({ data: { score_trend: [] } })),
    ]).then(([topicsRes, catsRes, analyticsRes, recentRes, progressRes, trendRes]) => {
      setTopics(topicsRes.data.topics);
      setCategories(catsRes.data.categories);
      setAnalytics(analyticsRes.data);
      setRecentQuizzes(recentRes.data.recent_quizzes || []);
      setTopicProgress(progressRes.data.topic_progress || []);
      setScoreTrend(trendRes.data.score_trend || []);
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const startQuiz = async (topicId) => {
    try {
      const res = await api.post('/quiz/start', { topic_id: topicId });
      navigate('/quiz', { state: res.data });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not start quiz');
    }
  };

  if (loading) return <div className="p-12 text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div></div>;

  const topicsWithQuestions = topics.filter(t => t.question_count > 0);
  const weakTopics = topicProgress.filter(t => t.average_score < 60);

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-24" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user.username || 'User'}!</h1>
              <p className="text-indigo-200">Ready to learn something new today?</p>
            </div>
            <div className="flex items-center gap-6">
              <StreakDisplay streak={user.current_streak || 0} />
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-2xl font-bold">{user.total_xp || 0}</span>
                </div>
                <p className="text-xs text-indigo-200">Total XP</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Quizzes Taken" value={analytics?.total_quizzes || 0} icon={<Target className="w-6 h-6" />} color="indigo" />
          <StatCard label="Topics Studied" value={analytics ? Object.keys(analytics.topic_strengths || {}).length : 0} icon={<BookOpen className="w-6 h-6" />} color="green" />
          <StatCard label="Day Streak" value={user.current_streak || 0} icon={<TrendingUp className="w-6 h-6" />} color="orange" />
          <StatCard label="Total XP" value={user.total_xp || 0} icon={<Zap className="w-6 h-6" />} color="pink" />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-8">
          <Link to="/browse" className="flex items-center gap-2 bg-white dark:bg-gray-800 px-5 py-3 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:shadow-lg transition-all text-sm font-medium">
            <Compass className="w-4 h-4 text-indigo-500" /> Browse Categories
          </Link>
          <Link to="/leaderboard" className="flex items-center gap-2 bg-white dark:bg-gray-800 px-5 py-3 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:shadow-lg transition-all text-sm font-medium">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Leaderboard
          </Link>
        </div>

        {/* Charts Row */}
        {(scoreTrend.length > 0 || topicProgress.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Score Trend */}
            {scoreTrend.length > 0 && (
              <GlassCard>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" /> Score Trend
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={scoreTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => `${v}%`} labelFormatter={(v) => new Date(v).toLocaleDateString()} />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </GlassCard>
            )}

            {/* Topic Progress */}
            {topicProgress.length > 0 && (
              <GlassCard>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-500" /> Topic Progress
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={topicProgress.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="topic_name" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="average_score" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </GlassCard>
            )}
          </div>
        )}

        {/* Recent Quiz Results */}
        {recentQuizzes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" /> Recent Quiz Results
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                    <th className="text-left py-3 px-4 font-medium">Topic</th>
                    <th className="text-center py-3 px-4 font-medium">Score</th>
                    <th className="text-center py-3 px-4 font-medium hidden sm:table-cell">Level</th>
                    <th className="text-center py-3 px-4 font-medium hidden sm:table-cell">Date</th>
                    <th className="text-right py-3 px-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentQuizzes.map((q, i) => {
                    const color = q.percentage >= 80 ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : q.percentage >= 50 ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20';
                    return (
                      <tr key={q.session_id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="py-3 px-4">
                          <Link to={`/topics/${q.topic_id}/learn`} className="text-sm font-medium text-gray-800 dark:text-white hover:text-indigo-600">{q.topic_name}</Link>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-lg text-sm font-bold ${color}`}>{q.percentage}%</span>
                        </td>
                        <td className="py-3 px-4 text-center hidden sm:table-cell">
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">Lv {q.difficulty_level}</span>
                        </td>
                        <td className="py-3 px-4 text-center hidden sm:table-cell text-xs text-gray-500">{q.completed_at ? new Date(q.completed_at).toLocaleDateString() : '-'}</td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => startQuiz(q.topic_id)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Retake</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Weak Topics */}
        {weakTopics.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Needs Improvement
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weakTopics.map((t, i) => (
                <motion.div key={t.topic_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-1">{t.topic_name}</h4>
                    <p className="text-sm text-gray-500 mb-3">Avg score: <span className="text-amber-600 font-bold">{t.average_score}%</span> ({t.total_quizzes} quizzes)</p>
                    <button onClick={() => navigate(`/topics/${t.topic_id}/learn`)}
                      className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> Study & Practice
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Browse by Category */}
        {categories.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Browse by Category</h2>
              <Link to="/browse" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.slice(0, 3).map((cat, i) => (
                <CategoryCard key={cat.id} category={cat} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Recommended Quizzes */}
        {topicsWithQuestions.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-5">Recommended Quizzes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {topicsWithQuestions.slice(0, 6).map((topic, i) => (
                <motion.div key={topic.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <GlassCard>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">{topic.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{topic.description || 'No description'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{topic.question_count} questions</span>
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/topics/${topic.id}/learn`)}
                          className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">
                          <BookOpen className="w-3.5 h-3.5" /> Learn
                        </button>
                        <button onClick={() => startQuiz(topic.id)}
                          className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors">
                          <Play className="w-3.5 h-3.5" /> Start
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {topics.length === 0 && categories.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No content available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
