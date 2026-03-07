import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Brain } from 'lucide-react';
import api from '../services/api';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setSuggestions(null); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/search/?q=${encodeURIComponent(query)}`);
        setSuggestions(res.data);
        setOpen(true);
      } catch { setSuggestions(null); }
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => suggestions && setOpen(true)}
          placeholder="Search topics, quizzes, questions..."
          className="w-full pl-10 pr-8 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); setSuggestions(null); }} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-white/50 hover:text-white" />
          </button>
        )}
      </form>

      {open && suggestions && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {suggestions.categories?.length > 0 && (
            <div className="p-2">
              <p className="text-xs font-medium text-gray-400 px-2 mb-1">Categories</p>
              {suggestions.categories.slice(0, 3).map(c => (
                <button key={c.id} onClick={() => { navigate(`/categories/${c.id}`); setOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          )}
          {suggestions.topics?.length > 0 && (
            <div className="p-2 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-400 px-2 mb-1">Topics</p>
              {suggestions.topics.slice(0, 5).map(t => (
                <button key={t.id} onClick={() => { navigate(`/categories/${t.category_id || 0}`); setOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">
                  {t.name} <span className="text-gray-400">- {t.question_count} questions</span>
                </button>
              ))}
            </div>
          )}
          <button onClick={() => { navigate(`/explore`, { state: { retryTopic: query.trim() } }); setOpen(false); }}
            className="w-full text-center py-2.5 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-t border-gray-100 dark:border-gray-700 flex items-center justify-center gap-2">
            <Brain className="w-4 h-4" /> Explore "{query}" with AI
          </button>
          <button onClick={handleSubmit}
            className="w-full text-center py-2.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-t border-gray-100 dark:border-gray-700">
            View all results for "{query}"
          </button>
        </div>
      )}
    </div>
  );
}
