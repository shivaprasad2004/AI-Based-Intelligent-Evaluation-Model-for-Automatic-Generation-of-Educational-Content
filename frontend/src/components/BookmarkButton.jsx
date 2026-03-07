import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';

export default function BookmarkButton({ type, itemId, className }) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    api.get(`/bookmarks/check?type=${type}&item_id=${itemId}`)
      .then(res => setBookmarked(res.data.bookmarked))
      .catch(() => {});
  }, [type, itemId]);

  const toggle = async (e) => {
    e.stopPropagation();
    setBookmarked(!bookmarked); // Optimistic
    try {
      const res = await api.post('/bookmarks/toggle', { bookmark_type: type, item_id: itemId });
      setBookmarked(res.data.bookmarked);
    } catch {
      setBookmarked(bookmarked); // Revert
    }
  };

  return (
    <button onClick={toggle} className={clsx('transition-all duration-200', className)}>
      <Bookmark
        className={clsx(
          'w-5 h-5 transition-all',
          bookmarked
            ? 'fill-indigo-500 text-indigo-500 scale-110'
            : 'text-gray-400 hover:text-indigo-400'
        )}
      />
    </button>
  );
}
