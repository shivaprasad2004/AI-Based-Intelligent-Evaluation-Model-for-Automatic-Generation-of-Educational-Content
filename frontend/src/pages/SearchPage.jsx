import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Sparkles, BookOpen, Loader2, Brain, RefreshCw } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import TopicContent from '../components/TopicContent';
import { useAuth } from '../context/AuthContext';

const SUGGESTED_TOPICS = [
  'Machine Learning', 'Quantum Physics', 'Data Structures', 'Organic Chemistry',
  'World War II', 'Artificial Intelligence', 'Calculus', 'Python Programming',
  'DNA Replication', 'Solar System', 'Blockchain', 'Operating Systems'
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const navigate = useNavigate();
  const locationState = useLocation();
  const { user } = useAuth();
  const formRef = useRef(null);

  useEffect(() => {
    if (locationState.state?.retryTopic) {
      setQuery(locationState.state.retryTopic);
      // Auto-search on retry
      doSearch(locationState.state.retryTopic);
    }
  }, [locationState.state]);

  const doSearch = async (topic) => {
    if (!topic || topic.length < 2) {
      toast.error('Enter at least 2 characters');
      return;
    }
    setLoading(true);
    setContent(null);
    try {
      const res = await api.post('/search-topic', { topic });
      setContent(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    doSearch(query.trim());
  };

  const handleChipClick = (topic) => {
    setQuery(topic);
    doSearch(topic);
  };

  const handleRefresh = async () => {
    if (!content?.topic) return;
    try {
      await api.post('/search-topic/clear-cache', { topic: content.topic });
      doSearch(content.topic);
    } catch {
      doSearch(content.topic);
    }
  };

  const handleGenerateQuiz = async (difficulty) => {
    if (!content?.topic) return;
    setGeneratingQuiz(true);
    try {
      const res = await api.post('/generate-quiz', {
        topic: content.topic,
        difficulty: difficulty || undefined,
        count: 5
      });
      navigate('/dynamic-quiz', { state: res.data });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate quiz');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-10 h-10 text-indigo-500" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              AI-Powered Topic Explorer
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Search any topic to get real educational content from the web, then test your knowledge with a dynamic quiz.
          </p>
        </div>

        {/* Search Bar */}
        <form ref={formRef} onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any topic... (e.g., Machine Learning, Quantum Physics)"
              className="w-full pl-12 pr-36 py-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-medium text-sm transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Search
                </>
              )}
            </button>
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">Fetching real educational content...</p>
            <p className="text-gray-400 text-sm mt-1">Searching Wikipedia & web sources</p>
          </div>
        )}

        {/* Content */}
        {content && !loading && (
          <div>
            {/* Refresh button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={handleRefresh}
                className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh content
              </button>
            </div>

            <TopicContent content={content} />

            {/* Quiz Section */}
            {user?.role === 'student' && (
              <GlassCard className="mt-8 text-center" hover={false}>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <BookOpen className="w-6 h-6 text-indigo-500" />
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Test Your Knowledge
                  </h2>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Take a quiz on <strong>"{content.topic}"</strong> with questions generated from real content.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {[
                    { level: 1, label: 'Beginner', color: 'bg-green-600 hover:bg-green-700' },
                    { level: 2, label: 'Easy', color: 'bg-blue-600 hover:bg-blue-700' },
                    { level: 3, label: 'Medium', color: 'bg-yellow-600 hover:bg-yellow-700' },
                    { level: 4, label: 'Hard', color: 'bg-orange-600 hover:bg-orange-700' },
                    { level: 5, label: 'Expert', color: 'bg-red-600 hover:bg-red-700' },
                  ].map(({ level, label, color }) => (
                    <button
                      key={level}
                      onClick={() => handleGenerateQuiz(level)}
                      disabled={generatingQuiz}
                      className={`${color} text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2`}
                    >
                      {generatingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleGenerateQuiz(null)}
                  disabled={generatingQuiz}
                  className="mt-4 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                  {generatingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Adaptive Quiz (Auto Difficulty)
                </button>
              </GlassCard>
            )}
          </div>
        )}

        {/* Empty State with Suggestions */}
        {!content && !loading && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-6">Search a topic to explore real educational content</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Popular topics:</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {SUGGESTED_TOPICS.map(t => (
                <button
                  key={t}
                  onClick={() => handleChipClick(t)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
