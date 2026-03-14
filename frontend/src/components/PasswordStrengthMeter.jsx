import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const requirements = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Number', test: (p) => /\d/.test(p) },
  { label: 'Special character', test: (p) => /[!@#$%^&*()\-_=+\[\]{};:,.<>?/\\|`~]/.test(p) },
];

const strengthConfig = {
  0: { label: '', color: 'bg-gray-200 dark:bg-gray-700', text: 'text-gray-400', width: '0%' },
  1: { label: 'Very Weak', color: 'bg-red-500', text: 'text-red-500', width: '20%' },
  2: { label: 'Weak', color: 'bg-orange-500', text: 'text-orange-500', width: '40%' },
  3: { label: 'Fair', color: 'bg-yellow-500', text: 'text-yellow-500', width: '60%' },
  4: { label: 'Strong', color: 'bg-green-500', text: 'text-green-500', width: '80%' },
  5: { label: 'Very Strong', color: 'bg-emerald-500', text: 'text-emerald-500', width: '100%' },
};

export default function PasswordStrengthMeter({ password }) {
  const analysis = useMemo(() => {
    if (!password) return { score: 0, passed: [] };
    const passed = requirements.map(r => r.test(password));
    const score = passed.filter(Boolean).length;
    return { score, passed };
  }, [password]);

  const config = strengthConfig[analysis.score];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-2 space-y-2"
    >
      {/* Strength bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${config.color}`}
            initial={{ width: '0%' }}
            animate={{ width: config.width }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className={`text-xs font-semibold min-w-[80px] text-right ${config.text}`}>
          {config.label}
        </span>
      </div>

      {/* Requirements checklist */}
      <div className="grid grid-cols-1 gap-1">
        {requirements.map((req, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {analysis.passed[i] ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <X className="w-3.5 h-3.5 text-gray-400" />
            )}
            <span className={`text-xs ${analysis.passed[i] ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function getPasswordStrength(password) {
  if (!password) return 0;
  return requirements.filter(r => r.test(password)).length;
}
