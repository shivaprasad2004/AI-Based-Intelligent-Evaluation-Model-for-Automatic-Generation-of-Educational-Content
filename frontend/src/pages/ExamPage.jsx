import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import {
  FileText,
  Clock,
  Send,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  BookOpen,
} from 'lucide-react';

export default function ExamPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const topic = location.state?.topic;

  const [instructions, setInstructions] = useState('');
  const [wordTarget, setWordTarget] = useState(300);
  const [keyConceptCount, setKeyConceptCount] = useState(0);
  const [timeLimit, setTimeLimit] = useState(1800);
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const [essayText, setEssayText] = useState('');
  const [instructionsOpen, setInstructionsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const autoSaveRef = useRef(null);
  const textareaRef = useRef(null);

  // Word count derived from essay text
  const wordCount = essayText.trim() === '' ? 0 : essayText.trim().split(/\s+/).length;

  // Redirect if no topic provided
  useEffect(() => {
    if (!topic) {
      toast.error('No topic selected. Redirecting to explore.');
      navigate('/explore');
    }
  }, [topic, navigate]);

  // Fetch exam instructions on mount
  useEffect(() => {
    if (!topic) return;

    const fetchExamData = async () => {
      try {
        setLoading(true);
        const response = await api.post('/exam/start', { topic });
        const data = response.data;
        setInstructions(data.instructions || '');
        setWordTarget(data.word_target || 300);
        setTimeLimit(data.time_limit_seconds || 1800);
        setTimeRemaining(data.time_limit_seconds || 1800);
        setKeyConceptCount(data.key_concept_count || 0);
        startTimeRef.current = Date.now();
        toast.success('Exam started! Good luck!');
      } catch (error) {
        toast.error('Failed to start exam. Please try again.');
        console.error('Exam start error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [topic]);

  // Check localStorage for saved draft on mount
  useEffect(() => {
    if (!topic) return;
    const savedDraft = localStorage.getItem(`exam_draft_${topic}`);
    if (savedDraft) {
      const restore = window.confirm(
        'A saved draft was found for this topic. Would you like to restore it?'
      );
      if (restore) {
        setEssayText(savedDraft);
        toast.success('Draft restored successfully!');
      } else {
        localStorage.removeItem(`exam_draft_${topic}`);
      }
    }
  }, [topic]);

  // Countdown timer
  useEffect(() => {
    if (loading || !topic) return;

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
  }, [loading, topic]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!topic) return;

    autoSaveRef.current = setInterval(() => {
      if (essayText.trim().length > 0) {
        localStorage.setItem(`exam_draft_${topic}`, essayText);
      }
    }, 30000);

    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [topic, essayText]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getWordCountColor = () => {
    if (wordCount < 200) return 'text-red-500';
    if (wordCount < 280) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getWordCountBg = () => {
    if (wordCount < 200) return 'bg-red-500/10 border-red-500/30';
    if (wordCount < 280) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-green-500/10 border-green-500/30';
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit) {
      if (wordCount < 50) {
        toast.error('Please write at least 50 words before submitting.');
        return;
      }
      const confirmed = window.confirm(
        `You have written ${wordCount} words. Are you sure you want to submit your essay?`
      );
      if (!confirmed) return;
    }

    const timeTaken = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : timeLimit - timeRemaining;

    try {
      setSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const response = await api.post('/exam/submit', {
        topic,
        essay_text: essayText,
        time_taken_seconds: timeTaken,
      });

      // Clear the saved draft
      localStorage.removeItem(`exam_draft_${topic}`);

      toast.success('Exam submitted successfully!');
      navigate('/exam-results', {
        state: {
          ...response.data,
          topic,
          essay_text: essayText,
          time_taken_seconds: timeTaken,
        },
      });
    } catch (error) {
      toast.error('Failed to submit exam. Please try again.');
      console.error('Exam submit error:', error);
      setSubmitting(false);
      // Restart timer if submission failed
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Preparing your exam...
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
          className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 dark:from-indigo-800 dark:via-purple-800 dark:to-indigo-900"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-white/15 backdrop-blur-sm rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-indigo-200 text-sm font-medium tracking-wide uppercase">
                Written Exam
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {topic}
            </h1>
            <p className="text-indigo-200 text-base">
              Write a comprehensive essay covering key concepts. Take your time and
              express your understanding clearly.
            </p>
          </div>
        </motion.div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Timer & Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-wrap items-center justify-between gap-4"
          >
            {/* Timer */}
            <div
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl border backdrop-blur-sm transition-colors ${
                timeRemaining < 60
                  ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                  : timeRemaining < 300
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400'
                  : 'bg-white/60 border-gray-200/50 text-gray-700 dark:bg-gray-800/60 dark:border-gray-700/50 dark:text-gray-300'
              }`}
            >
              <Clock
                className={`w-5 h-5 ${
                  timeRemaining < 60 ? 'animate-pulse' : ''
                }`}
              />
              <span className="text-xl font-mono font-bold">
                {formatTime(timeRemaining)}
              </span>
              <span className="text-sm opacity-70">remaining</span>
            </div>

            {/* Word Count */}
            <div
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl border backdrop-blur-sm transition-colors ${getWordCountBg()}`}
            >
              <FileText className={`w-5 h-5 ${getWordCountColor()}`} />
              <span className={`text-xl font-bold font-mono ${getWordCountColor()}`}>
                {wordCount}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                / {wordTarget} words
              </span>
            </div>

            {/* Key Concepts Info */}
            {keyConceptCount > 0 && (
              <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl border bg-indigo-500/10 border-indigo-500/30 backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 text-indigo-500" />
                <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                  {keyConceptCount} key concepts to cover
                </span>
              </div>
            )}
          </motion.div>

          {/* Collapsible Instructions Panel */}
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
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                    <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
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

          {/* Essay Textarea */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <GlassCard className="p-0 overflow-hidden">
              <div className="px-6 py-3 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Your Essay
                  </span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Auto-saves every 30 seconds
                </span>
              </div>
              <textarea
                ref={textareaRef}
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                placeholder={`Start writing your essay about ${topic}...`}
                disabled={submitting || timeRemaining === 0}
                className="w-full min-h-[400px] p-6 text-base leading-relaxed text-gray-800 dark:text-gray-200 bg-transparent placeholder-gray-400 dark:placeholder-gray-600 border-none outline-none resize-y focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
                spellCheck
              />
            </GlassCard>
          </motion.div>

          {/* Submit Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8"
          >
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              {wordCount < 50 ? (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>Write at least 50 words to enable submission</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-green-500" />
                  <span>Your essay is ready to submit</span>
                </>
              )}
            </div>
            <motion.button
              whileHover={{ scale: wordCount >= 50 && !submitting ? 1.02 : 1 }}
              whileTap={{ scale: wordCount >= 50 && !submitting ? 0.98 : 1 }}
              onClick={() => handleSubmit(false)}
              disabled={wordCount < 50 || submitting || timeRemaining === 0}
              className="flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Essay
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
