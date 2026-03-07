import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const gradients = [
  'from-blue-600 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-purple-600 to-pink-500',
  'from-orange-500 to-red-500',
  'from-cyan-500 to-blue-500',
  'from-rose-500 to-pink-500',
];

const icons = {
  'Mathematics': '+-',
  'Science': 'Sc',
  'Programming': '</>',
  'Computer Science': 'CS',
  'General Knowledge': 'GK',
};

export default function CategoryCard({ category, index = 0 }) {
  const navigate = useNavigate();
  const gradient = gradients[index % gradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      onClick={() => navigate(`/categories/${category.id}`)}
      className="cursor-pointer group"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl border border-gray-100 dark:border-gray-700">
        <div className={`bg-gradient-to-r ${gradient} p-6 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-6 -translate-x-6" />
          <span className="text-3xl font-bold text-white/90 relative z-10">
            {icons[category.name] || category.icon || category.name?.[0] || 'C'}
          </span>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {category.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
            {category.description || 'Explore topics and take quizzes'}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full">
              {category.topic_count} topics
            </span>
            <span className="text-xs text-gray-400 group-hover:text-indigo-500 transition-colors">
              Explore &rarr;
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
