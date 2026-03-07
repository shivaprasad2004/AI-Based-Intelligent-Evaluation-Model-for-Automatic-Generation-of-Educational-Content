import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import CategoryCard from '../components/CategoryCard';
import PageTransition from '../components/ui/PageTransition';
import { Search } from 'lucide-react';

export default function BrowsePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get('/categories/')
      .then(res => setCategories(res.data.categories))
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter
    ? categories.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))
    : categories;

  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Hero */}
        <div className="gradient-hero text-white py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
              Explore Subjects
            </h1>
            <p className="text-lg text-indigo-200 mb-8 animate-fade-in">
              Browse categories, take quizzes, and improve your knowledge
            </p>
            <div className="max-w-md mx-auto relative animate-slide-up">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Filter categories..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No categories found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((cat, i) => (
                <CategoryCard key={cat.id} category={cat} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
