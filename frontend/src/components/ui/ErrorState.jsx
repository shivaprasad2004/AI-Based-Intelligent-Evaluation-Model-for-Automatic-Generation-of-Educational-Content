export default function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-6 py-12 ${className}`}
    >
      {/* Inline SVG — broken-lightbulb / error icon */}
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-6"
        aria-hidden="true"
      >
        {/* Outer glow circle */}
        <circle
          cx="60"
          cy="60"
          r="56"
          className="stroke-gray-200 dark:stroke-gray-700"
          strokeWidth="2"
        />
        {/* Inner filled circle */}
        <circle
          cx="60"
          cy="60"
          r="44"
          className="fill-gray-100 dark:fill-gray-800"
        />
        {/* Lightbulb body */}
        <path
          d="M60 30C47.85 30 38 39.85 38 52c0 7.45 3.7 14.03 9.36 18H52v8h16v-8h4.64C78.3 66.03 82 59.45 82 52c0-12.15-9.85-22-22-22z"
          className="fill-indigo-100 stroke-indigo-500 dark:fill-indigo-900/40 dark:stroke-indigo-400"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Filament lines */}
        <line
          x1="52"
          y1="78"
          x2="68"
          y2="78"
          className="stroke-indigo-400 dark:stroke-indigo-500"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="54"
          y1="83"
          x2="66"
          y2="83"
          className="stroke-indigo-400 dark:stroke-indigo-500"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Crack / break line */}
        <path
          d="M54 45L60 52L54 59"
          className="stroke-red-400 dark:stroke-red-500"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Small spark lines */}
        <line
          x1="30"
          y1="40"
          x2="24"
          y2="36"
          className="stroke-gray-400 dark:stroke-gray-500"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="90"
          y1="40"
          x2="96"
          y2="36"
          className="stroke-gray-400 dark:stroke-gray-500"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="28"
          y1="58"
          x2="22"
          y2="58"
          className="stroke-gray-400 dark:stroke-gray-500"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="92"
          y1="58"
          x2="98"
          y2="58"
          className="stroke-gray-400 dark:stroke-gray-500"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
        {description}
      </p>

      {/* Retry button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 transition-all duration-200 cursor-pointer"
        >
          {/* Refresh icon */}
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Try Again
        </button>
      )}
    </div>
  );
}
