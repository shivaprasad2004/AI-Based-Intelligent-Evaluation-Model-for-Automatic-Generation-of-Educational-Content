import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Play, BookOpen, Sparkles, Brain } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import PYQSection from '../components/PYQSection';
import { useAuth } from '../context/AuthContext';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  const { user } = useAuth();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    api.get(`/search/?q=${encodeURIComponent(query)}`)
      .then(res => setResults(res.data))
      .catch(() => toast.error('Search failed'))
      .finally(() => setLoading(false));
  }, [query]);

  const startQuiz = async (topicId) => {
    try {
      const res = await api.post('/quiz/start', { topic_id: topicId });
      navigate('/quiz', { state: res.data });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not start quiz');
    }
  };

  const tabs = [
    { key: 'all', label: 'All', count: results?.total_results },
    { key: 'topics', label: 'Topics', count: results?.topics?.length },
    { key: 'questions', label: 'Questions', count: results?.questions?.length },
    { key: 'pyqs', label: 'PYQs', count: results?.pyqs?.length },
  ];

  if (loading) return <div className="p-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div></div>;

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Search className="w-6 h-6 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Results for "<span className="text-indigo-600 dark:text-indigo-400">{query}</span>"
          </h1>
          <span className="text-sm text-gray-400">{results?.total_results || 0} results</span>
        </div>

        {/* AI Summary */}
        {results?.ai_summary && (
          <GlassCard className="mb-6 border-l-4 border-l-indigo-500" hover={false}>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">AI Summary</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{results.ai_summary}</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t.label} {t.count > 0 && <span className="text-xs opacity-60">({t.count})</span>}
            </button>
          ))}
        </div>

        {/* Recommended Quizzes */}
        {(tab === 'all' || tab === 'topics') && results?.recommended_quizzes?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-indigo-500" /> Recommended Quizzes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.recommended_quizzes.map(topic => (
                <div key={topic.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-1">{topic.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{topic.question_count} questions</p>
                  {user?.role === 'student' && (
                    <button onClick={() => startQuiz(topic.id)}
                      className="w-full bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors">
                      Start Quiz
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topics */}
        {(tab === 'all' || tab === 'topics') && results?.topics?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-500" /> Topics
            </h2>
            <div className="space-y-3">
              {results.topics.map(t => (
                <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/categories/${t.category_id || 0}`)}>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">{t.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.description}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-gray-400">{t.question_count} questions</span>
                      {t.category_name && <span className="text-xs text-indigo-500">{t.category_name}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions */}
        {(tab === 'all' || tab === 'questions') && results?.questions?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Questions</h2>
            <div className="space-y-3">
              {results.questions.map(q => (
                <div key={q.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge type="type" value={q.question_type} />
                    <Badge type="difficulty" value={q.difficulty} />
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{q.question_text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PYQs */}
        {(tab === 'all' || tab === 'pyqs') && results?.pyqs?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Previous Year Questions</h2>
            <div className="space-y-3">
              {results.pyqs.map(p => (
                <div key={p.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{p.exam_name} {p.year}</span>
                    <Badge type="difficulty" value={p.difficulty} />
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{p.question_text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explore with AI CTA */}
        <GlassCard className="mb-8 text-center border border-purple-200 dark:border-purple-800" hover={false}>
          <Brain className="w-10 h-10 text-purple-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
            Want deeper insights on "{query}"?
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Get real educational content from Wikipedia & the web, then test yourself with an AI-generated quiz.
          </p>
          <button
            onClick={() => navigate('/explore', { state: { retryTopic: query } })}
            className="bg-purple-600 text-white px-6 py-2.5 rounded-xl hover:bg-purple-700 font-medium text-sm transition-colors inline-flex items-center gap-2"
          >
            <Brain className="w-4 h-4" /> Explore with AI
          </button>
        </GlassCard>

        {results?.total_results === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No results found for "{query}"</p>
            <p className="text-gray-400 text-sm mt-1">Try different keywords or browse categories</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
