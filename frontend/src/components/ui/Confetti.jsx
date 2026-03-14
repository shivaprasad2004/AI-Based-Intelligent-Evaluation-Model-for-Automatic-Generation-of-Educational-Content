import { useEffect, useMemo } from 'react';

const COLORS = [
  '#6366f1', // indigo
  '#a855f7', // purple
  '#ec4899', // pink
  '#22c55e', // green
  '#eab308', // yellow
  '#3b82f6', // blue
  '#f97316', // orange
];

const PARTICLE_COUNT = 60;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export default function Confetti({ show = false, onComplete }) {
  // Build particle data once per "show" cycle
  const particles = useMemo(() => {
    if (!show) return [];
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: randomBetween(0, 100),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: randomBetween(4, 10),
      rotation: randomBetween(0, 360),
      delay: randomBetween(0, 1.2),
    }));
  }, [show]);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confettifall"
          style={{
            left: `${p.x}%`,
            top: '-2%',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.size > 7 ? '2px' : '50%',
            transform: `rotate(${p.rotation}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${randomBetween(2.2, 3.5)}s`,
          }}
        />
      ))}
    </div>
  );
}
