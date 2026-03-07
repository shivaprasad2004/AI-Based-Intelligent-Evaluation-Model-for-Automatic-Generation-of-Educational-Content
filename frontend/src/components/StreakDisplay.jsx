import { Flame } from 'lucide-react';
import clsx from 'clsx';

export default function StreakDisplay({ streak = 0, compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <Flame className={clsx('w-4 h-4', streak > 0 ? 'text-orange-500' : 'text-gray-400')} />
        <span className={clsx('text-sm font-bold', streak > 0 ? 'text-orange-500' : 'text-gray-400')}>
          {streak}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-amber-500/20 rounded-xl px-4 py-3">
      <div className={clsx(
        'w-10 h-10 rounded-full flex items-center justify-center',
        streak > 0 ? 'bg-orange-500 animate-pulse-glow' : 'bg-gray-300 dark:bg-gray-600'
      )}>
        <Flame className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800 dark:text-white">{streak}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">day streak</p>
      </div>
    </div>
  );
}
