import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Award,
  CheckCircle,
  XCircle,
  FileText,
  Brain,
  RefreshCw,
  BookOpen,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import PageTransition from '../components/ui/PageTransition';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

const gradeConfig = {
  'A+': { color: 'text-emerald-500', bg: 'from-emerald-500/20 to-green-500/10', border: 'border-emerald-500/30', ring: 'ring-emerald-500/30' },
  A:    { color: 'text-emerald-500', bg: 'from-emerald-500/20 to-green-500/10', border: 'border-emerald-500/30', ring: 'ring-emerald-500/30' },
  'B+': { color: 'text-blue-500',    bg: 'from-blue-500/20 to-indigo-500/10',   border: 'border-blue-500/30',    ring: 'ring-blue-500/30' },
  B:    { color: 'text-blue-500',    bg: 'from-blue-500/20 to-indigo-500/10',   border: 'border-blue-500/30',    ring: 'ring-blue-500/30' },
  C:    { color: 'text-yellow-500',  bg: 'from-yellow-500/20 to-amber-500/10',  border: 'border-yellow-500/30',  ring: 'ring-yellow-500/30' },
  D:    { color: 'text-red-500',     bg: 'from-red-500/20 to-orange-500/10',    border: 'border-red-500/30',     ring: 'ring-red-500/30' },
  F:    { color: 'text-red-600',     bg: 'from-red-600/20 to-red-500/10',       border: 'border-red-600/30',     ring: 'ring-red-600/30' },
};

const getGradeStyle = (grade) =>
  gradeConfig[grade] || gradeConfig['C'];

const getHeroGradient = (grade) => {
  if (grade === 'A+' || grade === 'A') return 'from-emerald-600 via-green-600 to-teal-600 dark:from-emerald-800 dark:via-green-800 dark:to-teal-800';
  if (grade === 'B+' || grade === 'B') return 'from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-800';
  if (grade === 'C') return 'from-yellow-600 via-amber-600 to-orange-600 dark:from-yellow-800 dark:via-amber-800 dark:to-orange-800';
  return 'from-red-600 via-orange-600 to-rose-600 dark:from-red-800 dark:via-orange-800 dark:to-rose-800';
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ExamResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [essayOpen, setEssayOpen] = useState(false);

  const data = location.state;

  if (!data) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">
              No Results Found
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              It looks like you haven't taken an exam yet.
            </p>
            <button
              onClick={() => navigate('/explore')}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              Explore Topics
            </button>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  const {
    topic,
    score = 0,
    grade = 'C',
    feedback = {},
    matched_count = 0,
    total_concepts = 0,
    xp_earned = 0,
    current_streak = 0,
    word_count = 0,
    time_taken_seconds = 0,
    essay_text = '',
  } = data;

  const gradeStyle = getGradeStyle(grade);
  const conceptPercentage =
    total_concepts > 0 ? Math.round((matched_count / total_concepts) * 100) : 0;

  const scoreBreakdown = feedback.score_breakdown || {};
  const radarData = [
    { subject: 'Coverage', value: scoreBreakdown.Coverage ?? scoreBreakdown.coverage ?? 0, fullMark: 100 },
    { subject: 'Depth', value: scoreBreakdown.Depth ?? scoreBreakdown.depth ?? 0, fullMark: 100 },
    { subject: 'Quality', value: scoreBreakdown.Quality ?? scoreBreakdown.quality ?? 0, fullMark: 100 },
    { subject: 'Vocabulary', value: scoreBreakdown.Vocabulary ?? scoreBreakdown.vocabulary ?? 0, fullMark: 100 },
  ];

  const coveredConcepts = feedback.covered_concepts || [];
  const missedConcepts = feedback.missed_concepts || [];
  const strengths = feedback.strengths || [];
  const weaknesses = feedback.weaknesses || [];
  const writingFeedback = feedback.writing_feedback || '';
  const overallFeedback = feedback.overall || '';

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`relative overflow-hidden bg-gradient-to-r ${getHeroGradient(grade)}`}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-white/15 backdrop-blur-sm rounded-xl">
                <Award className="w-6 h-6 text-white" />
              </div>
              <span className="text-white/80 text-sm font-medium tracking-wide uppercase">
                Exam Results
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {topic}
            </h1>

            {/* Score & Grade Row */}
            <div className="flex flex-wrap items-center gap-6 mt-6">
              {/* Grade Badge */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                className="flex items-center justify-center w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl"
              >
                <span className="text-5xl font-black text-white">{grade}</span>
              </motion.div>

              {/* Score */}
              <div className="space-y-1">
                <div className="text-5xl font-black text-white">
                  {score}
                  <span className="text-2xl font-medium text-white/70">/100</span>
                </div>
                <p className="text-white/70 text-sm">Overall Score</p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-3 ml-auto">
                {xp_earned > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20"
                  >
                    <TrendingUp className="w-4 h-4 text-yellow-300" />
                    <span className="text-white font-semibold text-sm">+{xp_earned} XP</span>
                  </motion.div>
                )}
                {current_streak > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20"
                  >
                    <span className="text-lg">🔥</span>
                    <span className="text-white font-semibold text-sm">{current_streak} streak</span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
        >
          {/* Stats Row */}
          <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <GlassCard className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{word_count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Words Written</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{formatTime(time_taken_seconds)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Time Taken</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{matched_count}/{total_concepts}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Concepts Covered</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{conceptPercentage}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Coverage Rate</p>
            </GlassCard>
          </motion.div>

          {/* Radar Chart */}
          <motion.div variants={item}>
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                  <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Score Breakdown
                </h3>
              </div>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid
                      stroke="#6366f130"
                      strokeDasharray="3 3"
                    />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: '#9ca3af', fontSize: 13, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      axisLine={false}
                    />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          {/* Concept Analysis */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Covered Concepts */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Concepts Covered
                </h3>
              </div>
              {coveredConcepts.length > 0 ? (
                <ul className="space-y-2.5">
                  {coveredConcepts.map((concept, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="flex items-start gap-2.5"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {typeof concept === 'string' ? concept : concept.name || concept.concept}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                  No concepts matched.
                </p>
              )}
            </GlassCard>

            {/* Missed Concepts */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Concepts Missed
                </h3>
              </div>
              {missedConcepts.length > 0 ? (
                <ul className="space-y-2.5">
                  {missedConcepts.map((concept, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="flex items-start gap-2.5"
                    >
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 block">
                          {typeof concept === 'string' ? concept : concept.name || concept.concept}
                        </span>
                        {concept.hint && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                            Hint: {concept.hint}
                          </span>
                        )}
                      </div>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-green-500 dark:text-green-400 font-medium">
                  All concepts covered! Great job!
                </p>
              )}
            </GlassCard>
          </motion.div>

          {/* Strengths & Weaknesses */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <GlassCard className="p-6 bg-gradient-to-br from-green-50/80 to-emerald-50/50 dark:from-green-950/30 dark:to-emerald-950/20 border-green-200/50 dark:border-green-800/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                  Strengths
                </h3>
              </div>
              {strengths.length > 0 ? (
                <ul className="space-y-2.5">
                  {strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                      <span className="text-sm text-green-700 dark:text-green-300">{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic">No strengths noted.</p>
              )}
            </GlassCard>

            {/* Weaknesses */}
            <GlassCard className="p-6 bg-gradient-to-br from-amber-50/80 to-yellow-50/50 dark:from-amber-950/30 dark:to-yellow-950/20 border-amber-200/50 dark:border-amber-800/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300">
                  Areas for Improvement
                </h3>
              </div>
              {weaknesses.length > 0 ? (
                <ul className="space-y-2.5">
                  {weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                      <span className="text-sm text-amber-700 dark:text-amber-300">{w}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic">No weaknesses noted.</p>
              )}
            </GlassCard>
          </motion.div>

          {/* Writing Feedback */}
          {writingFeedback && (
            <motion.div variants={item}>
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Writing Feedback
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {writingFeedback}
                </p>
              </GlassCard>
            </motion.div>
          )}

          {/* Overall Feedback */}
          {overallFeedback && (
            <motion.div variants={item}>
              <GlassCard className="p-6 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/20 border-indigo-200/50 dark:border-indigo-800/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-300">
                    Overall Feedback
                  </h3>
                </div>
                <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
                  {overallFeedback}
                </p>
              </GlassCard>
            </motion.div>
          )}

          {/* Collapsible Essay Section */}
          {essay_text && (
            <motion.div variants={item}>
              <GlassCard className="overflow-hidden">
                <button
                  onClick={() => setEssayOpen(!essayOpen)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      Your Essay
                    </span>
                  </div>
                  {essayOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: essayOpen ? 'auto' : 0,
                    opacity: essayOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pt-0">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {essay_text}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </GlassCard>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            variants={item}
            className="flex flex-wrap items-center justify-center gap-4 pt-4 pb-12"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/explore')}
              className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Try Another Topic
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/exam', { state: { topic } })}
              className="flex items-center gap-2.5 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Retake Exam
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/learning-dashboard')}
              className="flex items-center gap-2.5 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all"
            >
              <TrendingUp className="w-4 h-4" />
              View History
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/explore')}
              className="flex items-center gap-2.5 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all"
            >
              <Brain className="w-4 h-4" />
              Back to Explorer
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
