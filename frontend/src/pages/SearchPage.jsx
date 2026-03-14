import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Sparkles, BookOpen, Loader2, Brain, RefreshCw, FileText, ArrowRight, Clock } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import TopicContent from '../components/TopicContent';
import { SkeletonTopicContent } from '../components/ui/SkeletonLoader';
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

  // Recent searches from localStorage
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    if (locationState.state?.retryTopic) {
      setQuery(locationState.state.retryTopic);
      doSearch(locationState.state.retryTopic);
    }
  }, [locationState.state]);

  const saveRecentSearch = (topic) => {
    const updated = [topic, ...recentSearches.filter(s => s !== topic)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

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
      saveRecentSearch(topic);
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
        <div className="text-center mb-10 relative">
          <div className="absolute -top-4 left-1/4 w-20 h-20 bg-indigo-400/10 rounded-full blur-2xl animate-float-slow" />
          <div className="absolute -top-8 right-1/3 w-16 h-16 bg-purple-400/10 rounded-full blur-2xl animate-float" />
          <div className="flex items-center justify-center gap-3 mb-4 relative">
            <Brain className="w-10 h-10 text-indigo-500" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              AI-Powered Topic Explorer
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Search any topic to get real educational content from the web, then test your knowledge with quizzes and essays.
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
                <><Loader2 className="w-4 h-4 animate-spin" /> Fetching...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Search</>
              )}
            </button>
          </div>
        </form>

        {/* Skeleton Loading */}
        {loading && <SkeletonTopicContent />}

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

            {/* Learning Path */}
            {user?.role === 'student' && (
              <GlassCard className="mt-8" hover={false}>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  Your Learning Path
                </h2>
                <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap mb-6">
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    Read Content
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 hidden sm:block" />
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    Take Quiz
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 hidden sm:block" />
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium">
                    <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    Write Essay
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Quiz Section */}
            {user?.role === 'student' && (
              <GlassCard className="mt-6 text-center" hover={false}>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Brain className="w-6 h-6 text-indigo-500" />
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

            {/* Essay Exam Section */}
            {user?.role === 'student' && (
              <GlassCard className="mt-6 text-center" hover={false}>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <FileText className="w-6 h-6 text-purple-500" />
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Written Exam
                  </h2>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Prove your understanding by writing a ~300 word essay on <strong>"{content.topic}"</strong>.
                  Your essay will be evaluated against key concepts from real sources.
                </p>
                <div className="flex items-center justify-center gap-3 text-sm text-gray-400 mb-6">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 30 minutes</span>
                  <span>|</span>
                  <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> ~300 words</span>
                </div>
                <button
                  onClick={() => navigate('/exam', { state: { topic: content.topic } })}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 font-medium transition-all flex items-center gap-2 mx-auto shadow-lg shadow-purple-500/25"
                >
                  <FileText className="w-4 h-4" />
                  Take Written Exam
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

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-8">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Recent searches:
                </p>
                <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                  {recentSearches.map(t => (
                    <button
                      key={t}
                      onClick={() => handleChipClick(t)}
                      className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors border border-indigo-200 dark:border-indigo-800 font-medium"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Popular topics:</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {SUGGESTED_TOPICS.map(t => (
                <button
                  key={t}
                  onClick={() => handleChipClick(t)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-gray-200 dark:border-gray-700 hover:scale-105"
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
