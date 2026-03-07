import { useState, useEffect } from 'react';
import { Bookmark, BookOpen, HelpCircle, FileText, Trash2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import PageTransition from '../components/ui/PageTransition';
import { motion } from 'framer-motion';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('topic');

  const fetchBookmarks = () => {
    setLoading(true);
    api.get(`/bookmarks/?type=${tab}`)
      .then(res => setBookmarks(res.data.bookmarks))
      .catch(() => toast.error('Failed to load bookmarks'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookmarks(); }, [tab]);

  const removeBookmark = async (type, itemId) => {
    try {
      await api.post('/bookmarks/toggle', { bookmark_type: type, item_id: itemId });
      setBookmarks(prev => prev.filter(b => !(b.bookmark_type === type && b.item_id === itemId)));
      toast.success('Bookmark removed');
    } catch { toast.error('Failed to remove'); }
  };

  const tabs = [
    { key: 'topic', label: 'Topics', icon: BookOpen },
    { key: 'question', label: 'Questions', icon: HelpCircle },
    { key: 'pyq', label: 'PYQs', icon: FileText },
  ];

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="w-7 h-7 text-indigo-500" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bookmarks</h1>
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}</div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No bookmarked {tab}s yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between">
                <div className="flex-1">
                  {b.item ? (
                    <>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {b.item.name || b.item.question_text || 'Item'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {b.item.description || b.item.exam_name || b.item.question_type || ''}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-400">Item no longer available</p>
                  )}
                </div>
                <button onClick={() => removeBookmark(b.bookmark_type, b.item_id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
