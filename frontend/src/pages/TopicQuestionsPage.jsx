import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function TopicQuestionsPage() {
  const { topicId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = () => {
    Promise.all([
      api.get(`/topics/${topicId}`),
      api.get(`/questions/topic/${topicId}`)
    ]).then(([topicRes, qRes]) => {
      setTopic(topicRes.data.topic);
      setQuestions(qRes.data.questions);
    }).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [topicId]);

  const deleteQuestion = async (qId) => {
    try {
      await api.delete(`/questions/${qId}`);
      toast.success('Question deleted');
      loadData();
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/topics')} className="text-indigo-600 hover:underline mb-4 inline-block">&larr; Back to Topics</button>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{topic?.name}</h1>
      <p className="text-gray-500 mb-6">{questions.length} questions</p>

      <div className="space-y-4">
        {questions.map(q => (
          <div key={q.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                    {q.question_type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">Difficulty: {q.difficulty}/5</span>
                </div>
                <p className="text-gray-800">{q.question_text}</p>
                {q.options && (
                  <div className="mt-2 text-sm text-gray-600">
                    Options: {q.options.join(' | ')}
                  </div>
                )}
                {q.correct_answer && (
                  <p className="mt-1 text-sm text-green-700">Answer: {q.correct_answer}</p>
                )}
              </div>
              <button
                onClick={() => deleteQuestion(q.id)}
                className="text-red-500 hover:text-red-700 text-sm ml-4"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
