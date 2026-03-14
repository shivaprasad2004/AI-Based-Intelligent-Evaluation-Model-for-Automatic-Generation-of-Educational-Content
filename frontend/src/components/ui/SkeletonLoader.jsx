import { motion } from 'framer-motion';

const shimmerClasses =
  'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]';

function SkeletonBlock({ className = '' }) {
  return <div className={`${shimmerClasses} ${className}`} />;
}

export default function SkeletonLoader({
  variant = 'text',
  count = 1,
  className = '',
}) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'circle') {
    return (
      <div className={`flex gap-3 ${className}`}>
        {items.map((i) => (
          <SkeletonBlock key={i} className="w-12 h-12 rounded-full" />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        {items.map((i) => (
          <SkeletonBlock key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (variant === 'paragraph') {
    const widths = ['100%', '95%', '85%', '70%'];
    return (
      <div className={`space-y-4 ${className}`}>
        {items.map((i) => (
          <div key={i} className="space-y-2">
            {widths.map((w, j) => (
              <SkeletonBlock
                key={j}
                className="h-4 rounded"
                style={{ width: w }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Default: 'text'
  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((i) => (
        <SkeletonBlock key={i} className="h-4 w-full rounded" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preset: simulates the TopicContent layout
// ---------------------------------------------------------------------------
export function SkeletonTopicContent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-6"
    >
      {/* Title */}
      <SkeletonBlock className="h-8 w-3/5 rounded-lg" />

      {/* 3 paragraph blocks */}
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-2">
          <SkeletonBlock className="h-4 w-full rounded" />
          <SkeletonBlock className="h-4 w-[95%] rounded" />
          <SkeletonBlock className="h-4 w-[85%] rounded" />
          <SkeletonBlock className="h-4 w-[70%] rounded" />
        </div>
      ))}

      {/* Concept list */}
      <div className="space-y-3 pt-2">
        <SkeletonBlock className="h-5 w-40 rounded" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonBlock className="w-5 h-5 rounded-full" />
            <SkeletonBlock className="h-4 flex-1 rounded" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Preset: simulates a quiz question card
// ---------------------------------------------------------------------------
export function SkeletonQuizCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5"
    >
      {/* Question number badge */}
      <SkeletonBlock className="h-6 w-24 rounded-full" />

      {/* Question text */}
      <div className="space-y-2">
        <SkeletonBlock className="h-5 w-full rounded" />
        <SkeletonBlock className="h-5 w-4/5 rounded" />
      </div>

      {/* Answer options */}
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonBlock key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>

      {/* Action button */}
      <div className="flex justify-end">
        <SkeletonBlock className="h-10 w-32 rounded-lg" />
      </div>
    </motion.div>
  );
}
