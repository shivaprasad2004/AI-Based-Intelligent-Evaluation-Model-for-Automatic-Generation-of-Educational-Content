import { useLocation, useNavigate } from 'react-router-dom';

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data?.session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">No results to display.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-indigo-600 hover:underline">Go to Dashboard</button>
      </div>
    );
  }

  const { session, percentage, xp_earned, current_streak } = data;
  const scoreColor = percentage >= 80 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600';
  const scoreBg = percentage >= 80 ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' : percentage >= 50 ? 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20' : 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className={`bg-gradient-to-br ${scoreBg} rounded-2xl shadow-lg p-8 text-center mb-8 border border-gray-100 dark:border-gray-700`}>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Quiz Results</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{session.topic_name}</p>
        <p className={`text-6xl font-bold ${scoreColor} mb-2`}>{percentage}%</p>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          {session.total_score?.toFixed(1)} / {session.max_score} correct
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Difficulty Level: {session.difficulty_level}</p>
        {(xp_earned > 0 || current_streak > 0) && (
          <div className="flex items-center justify-center gap-4 mt-4">
            {xp_earned > 0 && <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">+{xp_earned} XP</span>}
            {current_streak > 0 && <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full text-sm font-medium">{current_streak} day streak!</span>}
          </div>
        )}
      </div>

      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Detailed Feedback</h2>
      <div className="space-y-4">
        {session.responses?.map((resp, idx) => (
          <div
            key={resp.id || idx}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 ${
              resp.is_correct ? 'border-green-500' : resp.score > 0 ? 'border-yellow-500' : 'border-red-500'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Question {idx + 1}</span>
              <span className={`text-sm font-bold ${
                resp.is_correct ? 'text-green-600' : resp.score > 0 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {resp.is_correct ? 'Correct' : resp.score > 0 ? 'Partial' : 'Incorrect'}
                {' '}({(resp.score * 100).toFixed(0)}%)
              </span>
            </div>
            <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">{resp.question?.question_text}</p>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-500">Your answer:</span> <span className="text-gray-700 dark:text-gray-300">{resp.student_answer || '(no answer)'}</span></p>
              <p><span className="text-gray-500">Correct answer:</span> <span className="text-green-700 dark:text-green-400">{resp.question?.correct_answer}</span></p>
            </div>
            {resp.ai_feedback && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">{resp.ai_feedback}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        {session.topic_id && (
          <button
            onClick={() => navigate(`/topics/${session.topic_id}/learn`)}
            className="bg-white dark:bg-gray-800 text-indigo-600 border border-indigo-200 dark:border-indigo-700 px-6 py-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-700 font-medium"
          >
            Back to Topic
          </button>
        )}
        {session.topic_id && (
          <button
            onClick={async () => {
              try {
                const res = await (await import('../services/api')).default.post('/quiz/start', { topic_id: session.topic_id });
                navigate('/quiz', { state: res.data });
              } catch (err) {
                navigate(`/topics/${session.topic_id}/learn`);
              }
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
          >
            Retake Quiz
          </button>
        )}
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium"
        >
          Dashboard
        </button>
      </div>
    </div>
  );
}
