import { useState, useEffect } from 'react';
import { Trophy, Flame, Medal, Zap } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/ui/PageTransition';
import { motion } from 'framer-motion';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    setLoading(true);
    api.get(`/leaderboard/?period=${period}`)
      .then(res => setLeaderboard(res.data.leaderboard))
      .catch(() => toast.error('Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, [period]);

  const periods = [
    { key: 'all', label: 'All Time' },
    { key: 'monthly', label: 'This Month' },
    { key: 'weekly', label: 'This Week' },
  ];

  const medalColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
  const medalBgs = ['bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800', 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700', 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'];

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Leaderboard</h1>
        </div>

        {/* Period tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
          {periods.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p.key
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No data yet. Start taking quizzes!</p>
          </div>
        ) : (
          <>
            {/* Top 3 */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {leaderboard.slice(0, 3).map((entry, i) => (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl border-2 p-5 text-center ${medalBgs[i]} ${entry.user_id === user.id ? 'ring-2 ring-indigo-500' : ''}`}
                >
                  <Medal className={`w-8 h-8 mx-auto mb-2 ${medalColors[i]}`} />
                  <p className="font-bold text-gray-800 dark:text-white text-lg">{entry.username}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Zap className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{entry.total_xp} XP</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{entry.quiz_count} quizzes | {entry.avg_score}% avg</p>
                </motion.div>
              ))}
            </div>

            {/* Rest of leaderboard */}
            <div className="space-y-2">
              {leaderboard.slice(3).map((entry, i) => (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.03 }}
                  className={`flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 ${entry.user_id === user.id ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                >
                  <span className="w-8 text-center text-sm font-bold text-gray-400">#{entry.rank}</span>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {entry.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-white">
                      {entry.username}
                      {entry.user_id === user.id && <span className="text-xs text-indigo-500 ml-2">(You)</span>}
                    </p>
                    <p className="text-xs text-gray-500">{entry.quiz_count} quizzes | {entry.avg_score}% avg</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600 dark:text-indigo-400">{entry.total_xp} XP</p>
                    {entry.current_streak > 0 && (
                      <div className="flex items-center gap-1 justify-end">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span className="text-xs text-orange-500">{entry.current_streak}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}
