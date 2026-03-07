import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, BookOpen } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import PageTransition from '../components/ui/PageTransition';
import Badge from '../components/ui/Badge';
import BookmarkButton from '../components/BookmarkButton';
import PYQSection from '../components/PYQSection';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const gradients = [
  'from-blue-600 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-purple-600 to-pink-500',
  'from-orange-500 to-red-500',
  'from-cyan-500 to-blue-500',
];

export default function CategoryDetailPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);

  useEffect(() => {
    api.get(`/categories/${categoryId}`)
      .then(res => setCategory(res.data.category))
      .catch(() => toast.error('Failed to load category'))
      .finally(() => setLoading(false));
  }, [categoryId]);

  const startQuiz = async (topicId) => {
    try {
      const res = await api.post('/quiz/start', { topic_id: topicId });
      navigate('/quiz', { state: res.data });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not start quiz');
    }
  };

  if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div></div>;
  if (!category) return <div className="p-8 text-center text-gray-500">Category not found.</div>;

  const gradient = gradients[(category.id - 1) % gradients.length];

  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Header */}
        <div className={`bg-gradient-to-r ${gradient} text-white py-12 px-4`}>
          <div className="max-w-7xl mx-auto">
            <button onClick={() => navigate('/browse')} className="flex items-center gap-2 text-white/70 hover:text-white mb-4 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Browse
            </button>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{category.name}</h1>
            <p className="text-white/80">{category.description}</p>
            <div className="flex items-center gap-4 mt-4">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{category.topic_count} Topics</span>
              {category.target_audience && (
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm capitalize">{category.target_audience}</span>
              )}
            </div>
          </div>
        </div>

        {/* Topics */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Topics</h2>
          {category.topics?.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No topics in this category yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {category.topics?.map((topic, i) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-5 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 dark:text-white">{topic.name}</h3>
                    <BookmarkButton type="topic" itemId={topic.id} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{topic.description || 'No description'}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <BookOpen className="w-3.5 h-3.5" /> {topic.question_count} questions
                    </span>
                    {topic.pyq_count > 0 && (
                      <span className="text-xs text-amber-600 dark:text-amber-400">{topic.pyq_count} PYQs</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/topics/${topic.id}/learn`)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Learn & Quiz
                    </button>
                    {topic.pyq_count > 0 && (
                      <button
                        onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        PYQs
                      </button>
                    )}
                  </div>
                  {selectedTopic === topic.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <PYQSection topicId={topic.id} topicName={topic.name} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
