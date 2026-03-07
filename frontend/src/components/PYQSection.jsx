import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';
import BookmarkButton from './BookmarkButton';
import Badge from './ui/Badge';

export default function PYQSection({ topicId, topicName }) {
  const [pyqs, setPyqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [examFilter, setExamFilter] = useState('');

  useEffect(() => {
    if (!topicId) return;
    setLoading(true);
    const params = examFilter ? `?exam=${encodeURIComponent(examFilter)}` : '';
    api.get(`/pyq/topic/${topicId}${params}`)
      .then(res => setPyqs(res.data.pyqs))
      .catch(() => setPyqs([]))
      .finally(() => setLoading(false));
  }, [topicId, examFilter]);

  const exams = [...new Set(pyqs.map(p => p.exam_name))];

  if (loading) return <div className="text-center py-4 text-gray-400">Loading PYQs...</div>;
  if (pyqs.length === 0) return <div className="text-center py-4 text-gray-400">No previous year questions available.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Previous Year Questions {topicName && `- ${topicName}`}
        </h3>
        {exams.length > 1 && (
          <select
            value={examFilter}
            onChange={e => setExamFilter(e.target.value)}
            className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <option value="">All Exams</option>
            {exams.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        )}
      </div>
      <div className="space-y-3">
        {pyqs.map(pyq => (
          <div key={pyq.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all">
            <button
              onClick={() => setExpandedId(expandedId === pyq.id ? null : pyq.id)}
              className="w-full text-left p-4 flex items-start justify-between gap-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{pyq.exam_name} {pyq.year}</span>
                  <Badge type="difficulty" value={pyq.difficulty} />
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200">{pyq.question_text}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <BookmarkButton type="pyq" itemId={pyq.id} />
                {expandedId === pyq.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </button>
            {expandedId === pyq.id && (
              <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 animate-fade-in">
                {pyq.options && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {pyq.options.map((opt, i) => (
                      <div key={i} className={`px-3 py-2 rounded-lg text-sm ${opt === pyq.correct_answer ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300'}`}>
                        {String.fromCharCode(65 + i)}. {opt}
                      </div>
                    ))}
                  </div>
                )}
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Answer: {pyq.correct_answer}</p>
                  {pyq.explanation && <p className="text-sm text-emerald-600 dark:text-emerald-300 mt-1">{pyq.explanation}</p>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
