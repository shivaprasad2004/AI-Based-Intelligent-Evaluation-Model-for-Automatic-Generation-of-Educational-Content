import clsx from 'clsx';

export default function GlassCard({ children, className, hover = true, premium = false, ...props }) {
  return (
    <div
      className={clsx(
        premium
          ? 'card-premium p-6'
          : [
              'bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl',
              'rounded-2xl border border-white/20 dark:border-gray-700/50',
              'shadow-lg shadow-indigo-500/5',
              'p-6',
            ],
        hover && !premium && 'transition-all duration-300 hover:scale-[1.02] hover:shadow-xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
