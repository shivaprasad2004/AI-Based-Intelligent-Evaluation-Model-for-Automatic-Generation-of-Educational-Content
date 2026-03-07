import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function TopicManagePage() {
  const [topics, setTopics] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState({});
  const navigate = useNavigate();

  const loadTopics = () => {
    api.get('/topics/').then(res => setTopics(res.data.topics))
      .catch(() => toast.error('Failed to load topics'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTopics(); }, []);

  const createTopic = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Topic name is required');
    try {
      await api.post('/topics/', { name, description });
      setName(''); setDescription('');
      toast.success('Topic created');
      loadTopics();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create topic');
    }
  };

  const deleteTopic = async (id) => {
    if (!window.confirm('Delete this topic and all its questions?')) return;
    try {
      await api.delete(`/topics/${id}`);
      toast.success('Topic deleted');
      loadTopics();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const generateQuestions = async (topicId, difficulty) => {
    setGenerating(g => ({ ...g, [topicId]: true }));
    try {
      const res = await api.post('/questions/generate', {
        topic_id: topicId,
        difficulty,
        count: 5,
        types: ['mcq', 'short_answer', 'essay', 'fill_blank', 'true_false']
      });
      toast.success(res.data.message);
      loadTopics();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Generation failed');
    } finally {
      setGenerating(g => ({ ...g, [topicId]: false }));
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Topics</h1>

      {/* Create form */}
      <form onSubmit={createTopic} className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Create New Topic</h2>
        <div className="space-y-3">
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Topic name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <textarea
            value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Description (optional)" rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium">
            Create Topic
          </button>
        </div>
      </form>

      {/* Topic list */}
      <div className="space-y-4">
        {topics.map(topic => (
          <div key={topic.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{topic.name}</h3>
                <p className="text-sm text-gray-500">{topic.description || 'No description'}</p>
                <p className="text-sm text-indigo-600 mt-1">{topic.question_count} questions</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/topics/${topic.id}/questions`)}
                  className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                >
                  View Questions
                </button>
                <button
                  onClick={() => deleteTopic(topic.id)}
                  className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Generate questions at difficulty:</span>
              {[1, 2, 3, 4, 5].map(d => (
                <button
                  key={d}
                  onClick={() => generateQuestions(topic.id, d)}
                  disabled={generating[topic.id]}
                  className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium hover:bg-indigo-200 disabled:opacity-50"
                >
                  {d}
                </button>
              ))}
              {generating[topic.id] && <span className="text-sm text-gray-500 ml-2">Generating...</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
