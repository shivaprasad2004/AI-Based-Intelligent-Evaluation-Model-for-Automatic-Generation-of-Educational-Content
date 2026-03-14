import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Target, AlertTriangle, BookOpen, Loader2, Clock, Brain, Trophy, FileText } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function LearningDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [essayHistory, setEssayHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/student-progress')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load progress'))
      .finally(() => setLoading(false));

    api.get('/exam/history')
      .then(res => setEssayHistory(res.data.exams || []))
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading your learning analytics...</p>
        </div>
      </div>
    );
  }

  // Empty state — no quizzes yet
  if (!data || data.total_quizzes === 0) {
    return (
      <PageTransition>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Brain className="w-20 h-20 text-indigo-200 dark:text-indigo-800 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">No Learning Data Yet</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Start exploring topics and taking quizzes to see your learning progress, score trends, and personalized recommendations here.
          </p>
          <button
            onClick={() => navigate('/explore')}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 font-medium transition-colors inline-flex items-center gap-2"
          >
            <Brain className="w-5 h-5" />
            Explore Topics & Take Your First Quiz
          </button>
        </div>
      </PageTransition>
    );
  }

  // Prepare pie chart data
  const pieData = [
    { name: 'Correct', value: Math.round(data.overall_accuracy) },
    { name: 'Incorrect', value: Math.round(100 - data.overall_accuracy) }
  ];

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-indigo-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Learning Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your personalized learning analytics</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/explore')}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 font-medium text-sm transition-colors hidden sm:flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            Explore Topics
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl p-5 bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Overall Accuracy</p>
                <p className="text-3xl font-bold mt-1">{data.overall_accuracy}%</p>
              </div>
              <Target className="w-8 h-8 opacity-70" />
            </div>
          </div>
          <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Quizzes Taken</p>
                <p className="text-3xl font-bold mt-1">{data.total_quizzes}</p>
              </div>
              <BookOpen className="w-8 h-8 opacity-70" />
            </div>
          </div>
          <div className="rounded-2xl p-5 bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Topics Studied</p>
                <p className="text-3xl font-bold mt-1">{data.total_topics_studied}</p>
              </div>
              <BarChart3 className="w-8 h-8 opacity-70" />
            </div>
          </div>
          <div className="rounded-2xl p-5 bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Weak Areas</p>
                <p className="text-3xl font-bold mt-1">{data.weak_topics?.length || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 opacity-70" />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Score Trend */}
          {data.improvement_trend?.length > 0 && (
            <GlassCard hover={false} className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Score Trend
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.improvement_trend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value, name) => [`${value}%`, 'Score']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>
          )}

          {/* Accuracy Pie */}
          <GlassCard hover={false}>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500" />
              Accuracy
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  <Cell fill="#6366f1" />
                  <Cell fill="#e5e7eb" />
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center -mt-2">
              <p className="text-2xl font-bold text-indigo-600">{data.overall_accuracy}%</p>
              <p className="text-xs text-gray-500">overall accuracy</p>
            </div>
          </GlassCard>
        </div>

        {/* Topic Performance Bar Chart */}
        {data.topic_performance?.length > 0 && (
          <GlassCard hover={false} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              Topic Performance
            </h3>
            <ResponsiveContainer width="100%" height={Math.max(200, data.topic_performance.slice(0, 10).length * 40)}>
              <BarChart data={data.topic_performance.slice(0, 10)} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="topic_name" tick={{ fontSize: 12 }} width={120} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${value}%`, 'Average Score']}
                />
                <Bar dataKey="average_score" radius={[0, 6, 6, 0]}>
                  {data.topic_performance.slice(0, 10).map((entry, idx) => (
                    <Cell key={idx} fill={entry.average_score >= 80 ? '#10b981' : entry.average_score >= 50 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        )}

        {/* Recent Quizzes */}
        {data.recent_quizzes?.length > 0 && (
          <GlassCard hover={false} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Recent Quizzes
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Topic</th>
                    <th className="text-center py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Score</th>
                    <th className="text-center py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Level</th>
                    <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_quizzes.map((q, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <td className="py-3 px-2 text-gray-800 dark:text-gray-200 font-medium">{q.topic_name}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          q.percentage >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          q.percentage >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {q.percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center text-gray-600 dark:text-gray-400">{q.difficulty}</td>
                      <td className="py-3 px-2 text-right text-gray-500 dark:text-gray-400 text-xs">{q.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {/* Weak + Strong Topics Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weak Topics */}
          {data.weak_topics?.length > 0 && (
            <GlassCard hover={false}>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Needs Improvement
              </h3>
              <div className="space-y-3">
                {data.weak_topics.map((topic) => (
                  <div
                    key={topic.topic_id}
                    className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800"
                  >
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{topic.topic_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Level {topic.current_level} &middot; {topic.total_quizzes} quizzes
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <p className="text-lg font-bold text-red-600">{topic.average_score}%</p>
                      <button
                        onClick={() => navigate('/explore', { state: { retryTopic: topic.topic_name } })}
                        className="text-xs bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 font-medium"
                      >
                        Practice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Strong Topics */}
          {data.strong_topics?.length > 0 && (
            <GlassCard hover={false}>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-green-500" />
                Mastered Topics
              </h3>
              <div className="space-y-3">
                {data.strong_topics.map((topic) => (
                  <div
                    key={topic.topic_id}
                    className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800"
                  >
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{topic.topic_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Level {topic.current_level} &middot; {topic.total_quizzes} quizzes
                      </p>
                    </div>
                    <p className="text-lg font-bold text-green-600">{topic.average_score}%</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        {/* Written Exam History */}
        {essayHistory.length > 0 && (
          <GlassCard hover={false} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              Written Exam History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Topic</th>
                    <th className="text-center py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Grade</th>
                    <th className="text-center py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Score</th>
                    <th className="text-center py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Words</th>
                    <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {essayHistory.map((exam) => {
                    const gradeColor = exam.grade?.startsWith('A') ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : exam.grade?.startsWith('B') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : exam.grade?.startsWith('C') ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
                    return (
                      <tr key={exam.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <td className="py-3 px-2 text-gray-800 dark:text-gray-200 font-medium">{exam.topic_name}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${gradeColor}`}>
                            {exam.grade}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center text-gray-600 dark:text-gray-400">{exam.score}%</td>
                        <td className="py-3 px-2 text-center text-gray-600 dark:text-gray-400">{exam.word_count}</td>
                        <td className="py-3 px-2 text-right text-gray-500 dark:text-gray-400 text-xs">
                          {exam.created_at ? new Date(exam.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {/* Mobile explore button */}
        <div className="sm:hidden text-center mb-4">
          <button
            onClick={() => navigate('/explore')}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 font-medium transition-colors"
          >
            Explore New Topics
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
