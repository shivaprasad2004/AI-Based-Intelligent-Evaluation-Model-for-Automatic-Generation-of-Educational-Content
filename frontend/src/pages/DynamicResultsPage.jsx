import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, RefreshCw, BookOpen, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

export default function DynamicResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">No results to display.</p>
        <button onClick={() => navigate('/explore')} className="mt-4 text-indigo-600 hover:underline">
          Go to Topic Explorer
        </button>
      </div>
    );
  }

  const { topic_name, percentage, total_score, max_score, results, xp_earned, current_streak, new_difficulty_level, recommendations } = data;

  const scoreColor = percentage >= 80 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600';
  const scoreBg = percentage >= 80
    ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
    : percentage >= 50
    ? 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20'
    : 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Score Header */}
      <div className={`bg-gradient-to-br ${scoreBg} rounded-2xl shadow-lg p-8 text-center mb-8 border border-gray-100 dark:border-gray-700`}>
        <Trophy className={`w-12 h-12 mx-auto mb-3 ${scoreColor}`} />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Quiz Results</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{topic_name}</p>
        <p className={`text-6xl font-bold ${scoreColor} mb-2`}>{percentage}%</p>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          {total_score?.toFixed(1)} / {max_score} correct
        </p>
        <p className="text-sm text-gray-500 mt-2">New Difficulty Level: {new_difficulty_level}</p>
        {(xp_earned > 0 || current_streak > 0) && (
          <div className="flex items-center justify-center gap-4 mt-4">
            {xp_earned > 0 && (
              <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                +{xp_earned} XP
              </span>
            )}
            {current_streak > 0 && (
              <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full text-sm font-medium">
                {current_streak} day streak!
              </span>
            )}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations?.length > 0 && (
        <GlassCard className="mb-8" hover={false}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">AI Recommendations</h2>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg ${
                rec.type === 'advanced' ? 'bg-green-50 dark:bg-green-900/20' :
                rec.type === 'easier_questions' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                'bg-blue-50 dark:bg-blue-900/20'
              }`}>
                {rec.type === 'advanced' ? (
                  <TrendingUp className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                )}
                <p className="text-sm text-gray-700 dark:text-gray-300">{rec.message}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Detailed Results */}
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Detailed Feedback</h2>
      <div className="space-y-4">
        {results?.map((resp, idx) => (
          <div
            key={idx}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 ${
              resp.is_correct ? 'border-green-500' : resp.score > 0 ? 'border-yellow-500' : 'border-red-500'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Question {idx + 1}
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  {resp.question_type}
                </span>
              </span>
              <span className={`text-sm font-bold ${
                resp.is_correct ? 'text-green-600' : resp.score > 0 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {resp.is_correct ? 'Correct' : resp.score > 0 ? 'Partial' : 'Incorrect'}
                {' '}({(resp.score * 100).toFixed(0)}%)
              </span>
            </div>
            <p className="text-gray-800 dark:text-gray-200 font-medium mb-3">{resp.question_text}</p>
            <div className="text-sm space-y-1">
              <p>
                <span className="text-gray-500">Your answer: </span>
                <span className="text-gray-700 dark:text-gray-300">{resp.student_answer || '(no answer)'}</span>
              </p>
              <p>
                <span className="text-gray-500">Correct answer: </span>
                <span className="text-green-700 dark:text-green-400">{resp.correct_answer}</span>
              </p>
            </div>
            {resp.feedback && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">{resp.feedback}</p>
              </div>
            )}
            {resp.explanation && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Explanation:</strong> {resp.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
        <button
          onClick={() => navigate('/explore')}
          className="bg-white dark:bg-gray-800 text-indigo-600 border border-indigo-200 dark:border-indigo-700 px-6 py-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-700 font-medium flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Explore More Topics
        </button>
        <button
          onClick={() => navigate('/explore', { state: { retryTopic: topic_name } })}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retake Quiz
        </button>
        <button
          onClick={() => navigate('/learning-dashboard')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium"
        >
          Learning Dashboard
        </button>
      </div>
    </div>
  );
}
