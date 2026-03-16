import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import QuestionCard from '../components/QuestionCard';
import Timer from '../components/Timer';
import ProgressBar from '../components/ProgressBar';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function DynamicQuizPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, questions, currentIndex, answers, setCurrentIndex, setAnswer, startQuiz, setResults } = useQuiz();
  const [submitting, setSubmitting] = useState(false);
  const topicName = location.state?.topic_name || session?.topic_name || '';

  useEffect(() => {
    if (location.state) {
      startQuiz(location.state);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    const answerList = questions.map(q => ({
      question_id: q.id,
      answer: answers[q.id] || ''
    }));

    try {
      // Use the dynamic submit endpoint
      const res = await api.post('/submit-quiz', {
        session_id: session.id,
        answers: answerList
      });
      setResults(res.data);
      navigate('/dynamic-results', { state: res.data });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
      setSubmitting(false);
    }
  }, [submitting, questions, answers, session, navigate, setResults]);

  if (!session || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">No active quiz session.</p>
        <button onClick={() => navigate('/explore')} className="mt-4 text-indigo-600 hover:underline">
          Go to Topic Explorer
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 relative">
      {/* Full-screen loading overlay during submission */}
      {submitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-800 dark:text-white">Evaluating your answers with AI...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This may take a few seconds</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            {topicName ? `Quiz: ${topicName}` : 'Dynamic Quiz'}
          </h1>
          <p className="text-sm text-gray-500">Difficulty Level: {session.difficulty || session.difficulty_level}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-indigo-600">Question {currentIndex + 1} of {questions.length}</div>
          <Timer duration={questions.length * 120} onTimeUp={handleSubmit} />
        </div>
      </div>

      <ProgressBar current={currentIndex + 1} total={questions.length} />

      <div className="mt-6">
        <QuestionCard
          question={currentQuestion}
          answer={answers[currentQuestion.id]}
          onAnswer={(val) => setAnswer(currentQuestion.id, val)}
        />
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>

        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {submitting ? 'Evaluating with AI...' : 'Submit Quiz'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Next
          </button>
        )}
      </div>

      <div className="flex justify-center gap-2 mt-6 flex-wrap">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={`w-8 h-8 rounded-full text-sm font-medium transition-colors
              ${i === currentIndex ? 'bg-indigo-600 text-white' :
                answers[q.id] ? 'bg-green-100 text-green-700 border-2 border-green-300' :
                'bg-gray-100 text-gray-500'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
