import { useState, useEffect } from 'react';

export default function Timer({ duration = 600, onTimeUp }) {
  const [seconds, setSeconds] = useState(duration);

  useEffect(() => {
    if (seconds <= 0) {
      onTimeUp?.();
      return;
    }
    const timer = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds, onTimeUp]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isLow = seconds < 60;

  return (
    <div className={`text-lg font-mono font-bold ${isLow ? 'text-red-600' : 'text-gray-700'}`}>
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  );
}
