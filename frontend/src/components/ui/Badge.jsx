import clsx from 'clsx';

const variants = {
  difficulty: {
    1: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    2: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    3: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    4: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    5: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  type: {
    mcq: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    short_answer: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    essay: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    fill_blank: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    true_false: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  }
};

const difficultyLabels = { 1: 'Easy', 2: 'Medium', 3: 'Hard', 4: 'Expert', 5: 'Master' };

export default function Badge({ type, value, className }) {
  const colorClass = variants[type]?.[value] || 'bg-gray-100 text-gray-700';
  const label = type === 'difficulty' ? (difficultyLabels[value] || `Lvl ${value}`) : value?.replace('_', ' ');

  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
      colorClass,
      className
    )}>
      {label}
    </span>
  );
}
