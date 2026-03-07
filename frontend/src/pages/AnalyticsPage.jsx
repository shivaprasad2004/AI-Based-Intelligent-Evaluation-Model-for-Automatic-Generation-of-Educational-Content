import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import StatCard from '../components/ui/StatCard';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  TrendingUp, Target, BookOpen, AlertTriangle, Brain, Zap,
  BarChart3, ArrowRight, Loader2, FileText, ChevronDown, ChevronUp
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

export default function AnalyticsPage() {
  const { user } = useAuth();
  return (
    <PageTransition>
      {user.role === 'educator' ? <EducatorAnalytics /> : <StudentAnalytics />}
    </PageTransition>
  );
}

function StudentAnalytics() {
  const [data, setData] = useState(null);
  const [gaps, setGaps] = useState([]);
  const [topicProgress, setTopicProgress] = useState([]);
  const [scoreTrend, setScoreTrend] = useState([]);
  const [studyMaterial, setStudyMaterial] = useState(null);
  const [loadingMaterial, setLoadingMaterial] = useState(false);
  const [expandedGap, setExpandedGap] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/analytics/student/overview').catch(() => ({ data: null })),
      api.get('/chatbot/knowledge-gaps').catch(() => ({ data: { knowledge_gaps: [] } })),
      api.get('/analytics/student/topic-progress').catch(() => ({ data: { topic_progress: [] } })),
      api.get('/analytics/student/score-trend').catch(() => ({ data: { score_trend: [] } })),
    ]).then(([overviewRes, gapsRes, progressRes, trendRes]) => {
      setData(overviewRes.data);
      setGaps(gapsRes.data.knowledge_gaps || []);
      setTopicProgress(progressRes.data.topic_progress || []);
      setScoreTrend(trendRes.data.score_trend || []);
    }).catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const generateStudyMaterial = async (topicId, topicName) => {
    setLoadingMaterial(true);
    setExpandedGap(topicId);
    try {
      const res = await api.post('/chatbot/study-material', { topic_id: topicId });
      setStudyMaterial({ topicId, ...res.data });
    } catch {
      toast.error('Failed to generate study material');
    } finally {
      setLoadingMaterial(false);
    }
  };

  if (loading) return (
    <div className="p-12 text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
    </div>
  );

  if (!data) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">No analytics data available yet. Take some quizzes first!</div>;

  const topicData = Object.entries(data.topic_strengths || {}).map(([name, stats]) => ({
    name: name.length > 12 ? name.slice(0, 12) + '...' : name,
    fullName: name,
    level: stats.level,
    score: stats.average_score,
    quizzes: stats.quizzes_taken
  }));

  // Prepare radar data
  const radarData = topicData.slice(0, 6).map(t => ({
    subject: t.name,
    score: t.score,
    level: t.level * 20,
  }));

  // Pie chart data for accuracy
  const totalQuizzes = data.total_quizzes || 0;
  const avgScore = topicData.length > 0 ? Math.round(topicData.reduce((s, t) => s + t.score, 0) / topicData.length) : 0;
  const pieData = [
    { name: 'Correct', value: avgScore },
    { name: 'Incorrect', value: 100 - avgScore },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-indigo-500" /> Learning Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Your performance overview, knowledge gaps, and learning progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Quizzes Taken" value={totalQuizzes} icon={<Target className="w-6 h-6" />} color="indigo" />
        <StatCard label="Topics Studied" value={topicData.length} icon={<BookOpen className="w-6 h-6" />} color="green" />
        <StatCard label="Avg Accuracy" value={`${avgScore}%`} icon={<TrendingUp className="w-6 h-6" />} color="orange" />
        <StatCard label="Knowledge Gaps" value={gaps.length} icon={<AlertTriangle className="w-6 h-6" />} color="pink" />
      </div>

      {/* Charts Row 1: Score Trend + Accuracy Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Score over time */}
        <div className="lg:col-span-2">
          <GlassCard>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" /> Score Trend
            </h2>
            {(scoreTrend.length > 0 || data.score_history?.length > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={scoreTrend.length > 0 ? scoreTrend : data.score_history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `${v}%`} labelFormatter={d => new Date(d).toLocaleDateString()} />
                  <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">Take quizzes to see your score trend</div>
            )}
          </GlassCard>
        </div>

        {/* Accuracy Pie */}
        <GlassCard>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" /> Overall Accuracy
          </h2>
          {avgScore > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" startAngle={90} endAngle={-270}>
                  <Cell fill="#6366f1" />
                  <Cell fill="#e5e7eb" />
                </Pie>
                <text x="50%" y="45%" textAnchor="middle" fill="#6366f1" fontSize="28" fontWeight="bold">{avgScore}%</text>
                <text x="50%" y="58%" textAnchor="middle" fill="#9ca3af" fontSize="12">Accuracy</text>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">No data yet</div>
          )}
        </GlassCard>
      </div>

      {/* Charts Row 2: Topic Performance + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Topic Bar Chart */}
        {topicData.length > 0 && (
          <GlassCard>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" /> Topic Performance
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topicData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" name="Avg Score (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="level" name="Level" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        )}

        {/* Radar Chart */}
        {radarData.length >= 3 && (
          <GlassCard>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-pink-500" /> Skill Radar
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                <Radar name="Level" dataKey="level" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>
        )}
      </div>

      {/* Knowledge Gaps Section */}
      {gaps.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Knowledge Gaps Detected
          </h2>
          <div className="space-y-3">
            {gaps.map((gap, i) => {
              const severityColors = {
                critical: 'border-red-500 bg-red-50 dark:bg-red-900/10',
                high: 'border-orange-500 bg-orange-50 dark:bg-orange-900/10',
                medium: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
                low: 'border-blue-500 bg-blue-50 dark:bg-blue-900/10',
              };
              const severityBadge = {
                critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
              };

              return (
                <motion.div
                  key={gap.topic_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-xl border-l-4 p-5 ${severityColors[gap.severity]}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-800 dark:text-white">{gap.topic_name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityBadge[gap.severity]}`}>
                        {gap.severity.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                      Avg: {gap.average_score}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{gap.recommendation}</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/topics/${gap.topic_id}/learn`)}
                      className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Study Topic
                    </button>
                    <button
                      onClick={() => generateStudyMaterial(gap.topic_id, gap.topic_name)}
                      disabled={loadingMaterial && expandedGap === gap.topic_id}
                      className="text-sm text-purple-600 dark:text-purple-400 font-medium hover:underline flex items-center gap-1"
                    >
                      {loadingMaterial && expandedGap === gap.topic_id ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                      ) : (
                        <><FileText className="w-3.5 h-3.5" /> Generate Study Material</>
                      )}
                    </button>
                  </div>

                  {/* Study Material Display */}
                  {studyMaterial?.topicId === gap.topic_id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" /> Study Material for {studyMaterial.topic_name}
                      </h4>
                      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {studyMaterial.study_material}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Learning Progress */}
      {topicProgress.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" /> Learning Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topicProgress.map((tp, i) => {
              const color = tp.average_score >= 80 ? 'emerald' : tp.average_score >= 50 ? 'yellow' : 'red';
              const barColor = { emerald: 'bg-emerald-500', yellow: 'bg-yellow-500', red: 'bg-red-500' }[color];
              return (
                <motion.div
                  key={tp.topic_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 card-hover-lift"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800 dark:text-white text-sm">{tp.topic_name}</h4>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500">Lv {tp.current_level}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                    <div className={`${barColor} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${Math.min(tp.average_score, 100)}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{tp.total_quizzes} quizzes</span>
                    <span className="font-medium">{tp.average_score}%</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function EducatorAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/educator/overview')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div></div>;
  if (!data) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">No data available.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-indigo-500" /> Educator Analytics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard label="Total Topics" value={data.total_topics} icon={<BookOpen className="w-6 h-6" />} color="indigo" />
        <StatCard label="Total Attempts" value={data.total_sessions} icon={<Target className="w-6 h-6" />} color="green" />
      </div>

      {data.topics.length > 0 && (
        <GlassCard className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Class Performance by Topic</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="topic_name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="average_score" name="Avg Score (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total_students" name="Students" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {data.topics.map(topic => (
        topic.question_stats.length > 0 && (
          <GlassCard key={topic.topic_id} className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Question Effectiveness: {topic.topic_name}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Question</th>
                    <th className="text-center py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Type</th>
                    <th className="text-center py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Difficulty</th>
                    <th className="text-center py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Attempts</th>
                    <th className="text-center py-3 px-3 font-medium text-gray-500 dark:text-gray-400">Correct Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {topic.question_stats.map(q => (
                    <tr key={q.question_id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-3 text-gray-800 dark:text-gray-200">{q.question_text}</td>
                      <td className="text-center py-3 px-3 text-gray-500">{q.type}</td>
                      <td className="text-center py-3 px-3 text-gray-500">{q.difficulty}/5</td>
                      <td className="text-center py-3 px-3 text-gray-500">{q.attempts}</td>
                      <td className="text-center py-3 px-3">
                        <span className={`font-medium ${q.correct_rate >= 70 ? 'text-green-600' : q.correct_rate >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {q.correct_rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )
      ))}
    </div>
  );
}
