import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Play, BookOpen, Globe, Brain, Clock, Award, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import BookmarkButton from '../components/BookmarkButton';
import PYQSection from '../components/PYQSection';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const tabs = [
  { id: 'learn', label: 'Learn', icon: Globe },
  { id: 'quiz', label: 'Quiz', icon: Brain },
  { id: 'pyq', label: 'PYQs', icon: BookOpen },
];

export default function TopicDetailPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topic, setTopic] = useState(null);
  const [content, setContent] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('learn');
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [startingQuiz, setStartingQuiz] = useState(false);

  useEffect(() => {
    api.get(`/topics/${topicId}`)
      .then(res => setTopic(res.data.topic || res.data))
      .catch(() => toast.error('Failed to load topic'))
      .finally(() => setLoading(false));
  }, [topicId]);

  useEffect(() => {
    if (activeTab === 'learn' && !content) {
      setContentLoading(true);
      api.get(`/topics/${topicId}/content`)
        .then(res => setContent(res.data.content))
        .catch(() => setContent({ wikipedia_summary: 'Content could not be loaded. Please try again later.', web_results: [], key_concepts: [], related_topics: [] }))
        .finally(() => setContentLoading(false));
    }
    if (activeTab === 'quiz') {
      api.get('/quiz/history')
        .then(res => {
          const filtered = (res.data.sessions || []).filter(s => s.topic_id === parseInt(topicId));
          setQuizHistory(filtered);
        })
        .catch(() => {});
    }
  }, [activeTab, topicId]);

  const startQuiz = async () => {
    setStartingQuiz(true);
    try {
      const res = await api.post('/quiz/start', { topic_id: parseInt(topicId) });
      navigate('/quiz', { state: res.data });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not start quiz');
    } finally {
      setStartingQuiz(false);
    }
  };

  if (loading) return <div className="p-12 text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div></div>;
  if (!topic) return <div className="p-8 text-center text-gray-500">Topic not found.</div>;

  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white py-10 px-4">
          <div className="max-w-5xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/70 hover:text-white mb-4 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{topic.name}</h1>
                <p className="text-white/80 max-w-2xl">{topic.description}</p>
                <div className="flex items-center gap-3 mt-4">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{topic.question_count || 0} Questions</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{topic.pyq_count || 0} PYQs</span>
                </div>
              </div>
              <BookmarkButton type="topic" itemId={topic.id} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-xl shadow-md p-1 -mt-5 relative z-10 border border-gray-100 dark:border-gray-700">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* LEARN TAB */}
          {activeTab === 'learn' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {contentLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Fetching content from the internet...</p>
                </div>
              ) : content ? (
                <div className="space-y-6">
                  {/* Wikipedia Summary */}
                  {content.wikipedia_summary && (
                    <GlassCard>
                      <div className="flex items-center gap-2 mb-4">
                        <Globe className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">About {topic.name}</h3>
                        {content.wikipedia_url && (
                          <a href={content.wikipedia_url} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-indigo-500 hover:underline flex items-center gap-1">
                            Wikipedia <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{content.wikipedia_summary}</p>
                    </GlassCard>
                  )}

                  {/* Key Concepts */}
                  {content.key_concepts?.length > 0 && (
                    <GlassCard>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-600" /> Key Concepts
                      </h3>
                      <ul className="space-y-2">
                        {content.key_concepts.map((concept, i) => (
                          <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                            <span className="mt-1 w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"></span>
                            {concept}
                          </li>
                        ))}
                      </ul>
                    </GlassCard>
                  )}

                  {/* Web Results */}
                  {content.web_results?.length > 0 && (
                    <GlassCard>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Additional Resources</h3>
                      <div className="space-y-3">
                        {content.web_results.map((result, i) => (
                          <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <h4 className="font-medium text-gray-800 dark:text-white">{result.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{result.text}</p>
                            {result.url && (
                              <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline mt-2 inline-flex items-center gap-1">
                                Read more <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  )}

                  {/* Related Topics */}
                  {content.related_topics?.length > 0 && (
                    <GlassCard>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Related Topics</h3>
                      <div className="space-y-2">
                        {content.related_topics.map((rt, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-indigo-500 mt-0.5">•</span>
                            <div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{rt.text}</p>
                              {rt.url && (
                                <a href={rt.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline">
                                  Learn more
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  )}

                  {/* CTA */}
                  {user?.role === 'student' && (
                    <div className="text-center py-4">
                      <button onClick={startQuiz} disabled={startingQuiz}
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 font-medium text-lg transition-colors disabled:opacity-50">
                        <Play className="w-5 h-5" /> {startingQuiz ? 'Starting...' : 'Start Quiz (10 Questions)'}
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </motion.div>
          )}

          {/* QUIZ TAB */}
          {activeTab === 'quiz' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {user?.role === 'student' && (
                <div className="text-center">
                  <GlassCard>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Ready to test your knowledge?</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Each quiz has 10 questions with adaptive difficulty</p>
                    <button onClick={startQuiz} disabled={startingQuiz}
                      className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50">
                      <Play className="w-5 h-5" /> {startingQuiz ? 'Starting...' : 'Start New Quiz'}
                    </button>
                  </GlassCard>
                </div>
              )}

              {quizHistory.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Your Quiz History</h3>
                  <div className="space-y-3">
                    {quizHistory.map(s => {
                      const pct = s.max_score > 0 ? Math.round(s.total_score / s.max_score * 100) : 0;
                      const color = pct >= 80 ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : pct >= 50 ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20';
                      return (
                        <div key={s.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">{new Date(s.completed_at || s.started_at).toLocaleDateString()}</span>
                              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500">Level {s.difficulty_level}</span>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-lg font-bold ${color}`}>
                            {pct}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {quizHistory.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No quiz attempts yet for this topic. Start your first quiz!</p>
              )}
            </motion.div>
          )}

          {/* PYQ TAB */}
          {activeTab === 'pyq' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <PYQSection topicId={parseInt(topicId)} topicName={topic.name} />
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
