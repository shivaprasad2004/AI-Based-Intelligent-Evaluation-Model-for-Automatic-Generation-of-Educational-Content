import clsx from 'clsx';

const positionClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowClasses = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-800 dark:border-t-gray-700 border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 dark:border-b-gray-700 border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-800 dark:border-l-gray-700 border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-800 dark:border-r-gray-700 border-y-transparent border-l-transparent',
};

export default function Tooltip({ children, text, position = 'top', className = '' }) {
  return (
    <div className={clsx('relative group inline-flex', className)}>
      {children}
      <div
        className={clsx(
          'absolute z-50 pointer-events-none',
          'invisible opacity-0 group-hover:visible group-hover:opacity-100',
          'transition-all duration-200 scale-95 group-hover:scale-100',
          positionClasses[position]
        )}
      >
        <div className="bg-gray-800 dark:bg-gray-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
          {text}
        </div>
        <div
          className={clsx(
            'absolute w-0 h-0 border-4',
            arrowClasses[position]
          )}
        />
      </div>
    </div>
  );
}
