import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import PageTransition from '../components/ui/PageTransition';
import StatCard from '../components/ui/StatCard';
import GlassCard from '../components/ui/GlassCard';
import { motion } from 'framer-motion';
import { BookOpen, Users, HelpCircle, Plus, Settings } from 'lucide-react';

export default function EducatorDashboard() {
  const [topics, setTopics] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/topics/'),
      api.get('/analytics/educator/overview')
    ]).then(([topicsRes, statsRes]) => {
      setTopics(topicsRes.data.topics);
      setStats(statsRes.data);
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-12 text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div></div>;

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Educator Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Manage topics, questions and track student performance</p>
          </div>
          <Link to="/topics"
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 text-sm font-medium shadow-lg shadow-indigo-500/25 transition-all">
            <Settings className="w-4 h-4" /> Manage Topics
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <StatCard label="Total Topics" value={stats?.total_topics || 0} icon={<BookOpen className="w-6 h-6" />} color="indigo" />
          <StatCard label="Quiz Attempts" value={stats?.total_sessions || 0} icon={<Users className="w-6 h-6" />} color="green" />
          <StatCard label="Total Questions" value={topics.reduce((s, t) => s + t.question_count, 0)} icon={<HelpCircle className="w-6 h-6" />} color="pink" />
        </div>

        {/* Topic overview */}
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-5">Your Topics</h2>
        {topics.length === 0 ? (
          <GlassCard hover={false} className="text-center py-8">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No topics created yet.</p>
            <Link to="/topics" className="inline-flex items-center gap-2 mt-3 text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium">
              <Plus className="w-4 h-4" /> Create your first topic
            </Link>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {topics.map((topic, i) => {
              const topicStat = stats?.topics?.find(t => t.topic_id === topic.id);
              return (
                <motion.div key={topic.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <GlassCard>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">{topic.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{topic.description || 'No description'}</p>
                      </div>
                      {topic.category_name && (
                        <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full">{topic.category_name}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3">
                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{topic.question_count}</p>
                        <p className="text-xs text-gray-500">Questions</p>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{topicStat?.total_students || 0}</p>
                        <p className="text-xs text-gray-500">Students</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3">
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{topicStat?.average_score || 0}%</p>
                        <p className="text-xs text-gray-500">Avg Score</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
