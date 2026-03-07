import clsx from 'clsx';

const colorMap = {
  indigo: 'from-indigo-500 to-purple-500 text-white',
  green: 'from-emerald-500 to-teal-500 text-white',
  orange: 'from-orange-500 to-amber-500 text-white',
  pink: 'from-pink-500 to-rose-500 text-white',
  blue: 'from-blue-500 to-cyan-500 text-white',
};

export default function StatCard({ label, value, icon, color = 'indigo' }) {
  return (
    <div className={clsx(
      'rounded-2xl p-6 bg-gradient-to-br shadow-lg',
      colorMap[color] || colorMap.indigo
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{label}</p>
          <p className="text-3xl font-bold mt-1 animate-count-up">{value}</p>
        </div>
        {icon && <span className="text-3xl opacity-80">{icon}</span>}
      </div>
    </div>
  );
}
