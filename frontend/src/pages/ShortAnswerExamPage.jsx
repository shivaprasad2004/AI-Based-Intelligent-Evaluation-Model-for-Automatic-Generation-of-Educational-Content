import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import {
  MessageSquare,
  Clock,
  Send,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  BookOpen,
  CheckCircle,
} from 'lucide-react';

export default function ShortAnswerExamPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const topic = location.state?.topic;

  const [questions, setQuestions] = useState([]);
  const [questionsData, setQuestionsData] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLimit, setTimeLimit] = useState(600);
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [instructionsOpen, setInstructionsOpen] = useState(true);
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!topic) {
      toast.error('No topic selected. Redirecting to explore.');
      navigate('/explore');
    }
  }, [topic, navigate]);

  useEffect(() => {
    if (!topic) return;

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await api.post('/short-answer-exam/start', { topic, count: 5, difficulty: 3 });
        const data = response.data;
        setQuestions(data.questions || []);
        setQuestionsData(data._questions_data || []);
        setTimeLimit(data.time_limit_seconds || 600);
        setTimeRemaining(data.time_limit_seconds || 600);
        setInstructions(data.instructions || '');
        startTimeRef.current = Date.now();
        toast.success('Exam started! Answer each question in 10-15 words.');
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to start exam. Please try again.');
        console.error('Short answer exam start error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [topic]);

  useEffect(() => {
    if (loading || !topic || questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          toast.error("Time's up! Your exam has been auto-submitted.");
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, topic, questions.length]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getWordCount = (text) => {
    if (!text || text.trim() === '') return 0;
    return text.trim().split(/\s+/).length;
  };

  const getWordCountColor = (count) => {
    if (count === 0) return 'text-gray-400';
    if (count < 8) return 'text-red-500';
    if (count > 20) return 'text-red-500';
    if (count >= 10 && count <= 15) return 'text-green-500';
    return 'text-yellow-500';
  };

  const answeredCount = Object.values(answers).filter((a) => a && a.trim().length > 0).length;

  const handleAnswerChange = (index, value) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit) {
      if (answeredCount === 0) {
        toast.error('Please answer at least one question before submitting.');
        return;
      }
      const confirmed = window.confirm(
        `You have answered ${answeredCount}/${questions.length} questions. Submit now?`
      );
      if (!confirmed) return;
    }

    const timeTaken = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : timeLimit - timeRemaining;

    const answerList = questions.map((q) => ({
      index: q.index,
      answer: answers[q.index] || '',
    }));

    try {
      setSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const response = await api.post('/short-answer-exam/submit', {
        topic,
        answers: answerList,
        questions_data: questionsData,
        time_taken_seconds: timeTaken,
      });

      toast.success('Exam submitted successfully!');
      navigate('/short-answer-results', {
        state: {
          ...response.data,
          topic,
        },
      });
    } catch (error) {
      toast.error('Failed to submit exam. Please try again.');
      console.error('Short answer exam submit error:', error);
      setSubmitting(false);
      if (timeRemaining > 0) {
        timerRef.current = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
  };

  if (!topic) return null;

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-amber-950 dark:to-orange-950">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Generating questions...
            </p>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 dark:from-amber-800 dark:via-orange-800 dark:to-amber-900"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-white/15 backdrop-blur-sm rounded-xl">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-amber-200 text-sm font-medium tracking-wide uppercase">
                Short Answer Exam
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {topic}
            </h1>
            <p className="text-amber-100 text-base">
              Answer each question concisely in 10-15 words. Focus on key concepts and terminology.
            </p>
          </div>
        </motion.div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Timer & Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-wrap items-center justify-between gap-4"
          >
            <div
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl border backdrop-blur-sm transition-colors ${
                timeRemaining < 60
                  ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                  : timeRemaining < 120
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400'
                  : 'bg-white/60 border-gray-200/50 text-gray-700 dark:bg-gray-800/60 dark:border-gray-700/50 dark:text-gray-300'
              }`}
            >
              <Clock className={`w-5 h-5 ${timeRemaining < 60 ? 'animate-pulse' : ''}`} />
              <span className="text-xl font-mono font-bold">{formatTime(timeRemaining)}</span>
              <span className="text-sm opacity-70">remaining</span>
            </div>

            <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl border bg-amber-500/10 border-amber-500/30 backdrop-blur-sm">
              <CheckCircle className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                {answeredCount}/{questions.length} answered
              </span>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <GlassCard className="overflow-hidden">
              <button
                onClick={() => setInstructionsOpen(!instructionsOpen)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                    <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    Exam Instructions
                  </span>
                </div>
                {instructionsOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: instructionsOpen ? 'auto' : 0,
                  opacity: instructionsOpen ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-5 pt-0">
                  <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                    {instructions}
                  </div>
                </div>
              </motion.div>
            </GlassCard>
          </motion.div>

          {/* Question Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {questions.map((q, i) => {
              const answered = answers[q.index] && answers[q.index].trim().length > 0;
              return (
                <button
                  key={i}
                  onClick={() => setCurrentQuestion(i)}
                  className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${
                    currentQuestion === i
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-110'
                      : answered
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-amber-300'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </motion.div>

          {/* Questions */}
          {questions.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: currentQuestion === i ? 1 : 0.4,
                y: 0,
                scale: currentQuestion === i ? 1 : 0.98,
              }}
              transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
              className={currentQuestion === i ? '' : 'hidden sm:block'}
            >
              <GlassCard className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                    <span className="text-amber-700 dark:text-amber-400 font-bold text-sm">
                      Q{i + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 dark:text-gray-200 font-medium mb-4 text-base leading-relaxed">
                      {q.question_text}
                    </p>
                    <div className="relative">
                      <input
                        type="text"
                        value={answers[q.index] || ''}
                        onChange={(e) => handleAnswerChange(q.index, e.target.value)}
                        placeholder="Type your answer in 10-15 words..."
                        disabled={submitting || timeRemaining === 0}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-base"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && currentQuestion < questions.length - 1) {
                            setCurrentQuestion(currentQuestion + 1);
                          }
                        }}
                      />
                      <span
                        className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${getWordCountColor(
                          getWordCount(answers[q.index])
                        )}`}
                      >
                        {getWordCount(answers[q.index])} words
                      </span>
                    </div>
                    {getWordCount(answers[q.index]) > 20 && (
                      <p className="text-xs text-red-500 mt-1">
                        Keep your answer concise (10-15 words recommended).
                      </p>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}

          {/* Navigation & Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8"
          >
            <div className="flex items-center gap-3">
              {currentQuestion > 0 && (
                <button
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                  className="px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all"
                >
                  Previous
                </button>
              )}
              {currentQuestion < questions.length - 1 && (
                <button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  className="px-5 py-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium rounded-xl border border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all"
                >
                  Next
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                {answeredCount === 0 ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>Answer at least one question</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{answeredCount}/{questions.length} answered</span>
                  </>
                )}
              </div>
              <motion.button
                whileHover={{ scale: answeredCount > 0 && !submitting ? 1.02 : 1 }}
                whileTap={{ scale: answeredCount > 0 && !submitting ? 0.98 : 1 }}
                onClick={() => handleSubmit(false)}
                disabled={answeredCount === 0 || submitting || timeRemaining === 0}
                className="flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-2xl shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Exam
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
