import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Award,
  CheckCircle,
  XCircle,
  MessageSquare,
  Brain,
  RefreshCw,
  BookOpen,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Tag,
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import PageTransition from '../components/ui/PageTransition';

const gradeConfig = {
  'A+': { color: 'text-emerald-500', bg: 'from-emerald-500/20 to-green-500/10' },
  A:    { color: 'text-emerald-500', bg: 'from-emerald-500/20 to-green-500/10' },
  'B+': { color: 'text-blue-500',    bg: 'from-blue-500/20 to-indigo-500/10' },
  B:    { color: 'text-blue-500',    bg: 'from-blue-500/20 to-indigo-500/10' },
  C:    { color: 'text-yellow-500',  bg: 'from-yellow-500/20 to-amber-500/10' },
  D:    { color: 'text-red-500',     bg: 'from-red-500/20 to-orange-500/10' },
  F:    { color: 'text-red-600',     bg: 'from-red-600/20 to-red-500/10' },
};

const getGradeStyle = (grade) => gradeConfig[grade] || gradeConfig['C'];

const getHeroGradient = (grade) => {
  if (grade === 'A+' || grade === 'A') return 'from-emerald-600 via-green-600 to-teal-600 dark:from-emerald-800 dark:via-green-800 dark:to-teal-800';
  if (grade === 'B+' || grade === 'B') return 'from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-800';
  if (grade === 'C') return 'from-yellow-600 via-amber-600 to-orange-600 dark:from-yellow-800 dark:via-amber-800 dark:to-orange-800';
  return 'from-red-600 via-orange-600 to-rose-600 dark:from-red-800 dark:via-orange-800 dark:to-rose-800';
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ShortAnswerResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedQ, setExpandedQ] = useState(null);

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
            <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">No Results Found</h2>
            <p className="text-gray-500 dark:text-gray-400">
              It looks like you haven't taken a short answer exam yet.
            </p>
            <button
              onClick={() => navigate('/explore')}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all"
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
    total_score = 0,
    grade = 'C',
    total_questions = 0,
    correct_count = 0,
    results = [],
    feedback = {},
    time_taken_seconds = 0,
    xp_earned = 0,
    current_streak = 0,
  } = data;

  const strengths = feedback.strengths || [];
  const weaknesses = feedback.weaknesses || [];
  const overallFeedback = feedback.overall || '';
  const scoreBreakdown = feedback.score_breakdown || {};

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-emerald-500';
    if (score >= 0.6) return 'text-blue-500';
    if (score >= 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score) => {
    if (score >= 0.8) return 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800';
    if (score >= 0.6) return 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
    if (score >= 0.4) return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
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
                Short Answer Results
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{topic}</h1>

            <div className="flex flex-wrap items-center gap-6 mt-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                className="flex items-center justify-center w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl"
              >
                <span className="text-5xl font-black text-white">{grade}</span>
              </motion.div>

              <div className="space-y-1">
                <div className="text-5xl font-black text-white">
                  {total_score}
                  <span className="text-2xl font-medium text-white/70">/100</span>
                </div>
                <p className="text-white/70 text-sm">Overall Score</p>
              </div>

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
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {correct_count}/{total_questions}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Correct Answers</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {formatTime(time_taken_seconds)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Time Taken</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{scoreBreakdown.correct || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Fully Correct</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{scoreBreakdown.partial || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Partially Correct</p>
            </GlassCard>
          </motion.div>

          {/* Question Results */}
          <motion.div variants={item}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                <MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Question-by-Question Results
              </h3>
            </div>
            <div className="space-y-4">
              {results.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  <GlassCard className="overflow-hidden">
                    <button
                      onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                            r.is_correct
                              ? 'bg-emerald-100 dark:bg-emerald-900/50'
                              : r.score >= 0.3
                              ? 'bg-yellow-100 dark:bg-yellow-900/50'
                              : 'bg-red-100 dark:bg-red-900/50'
                          }`}
                        >
                          {r.is_correct ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          ) : r.score >= 0.3 ? (
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                            Q{i + 1}: {r.question_text}
                          </p>
                        </div>
                        <div className={`flex-shrink-0 px-3 py-1 rounded-full border text-sm font-bold ${getScoreBg(r.score)} ${getScoreColor(r.score)}`}>
                          {Math.round(r.score * 100)}%
                        </div>
                      </div>
                      {expandedQ === i ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
                      )}
                    </button>

                    <motion.div
                      initial={false}
                      animate={{
                        height: expandedQ === i ? 'auto' : 0,
                        opacity: expandedQ === i ? 1 : 0,
                      }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                        {/* Your Answer */}
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Your Answer:</p>
                          <p className={`text-sm font-medium ${r.is_correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                            {r.student_answer || '(No answer)'}
                          </p>
                        </div>

                        {/* Correct Answer */}
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Correct Answer:</p>
                          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                            {r.correct_answer}
                          </p>
                        </div>

                        {/* Keywords */}
                        <div className="flex flex-wrap gap-4">
                          {r.matched_keywords && r.matched_keywords.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1.5 flex items-center gap-1">
                                <Tag className="w-3 h-3" /> Matched Keywords:
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {r.matched_keywords.map((kw, j) => (
                                  <span
                                    key={j}
                                    className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium border border-green-200 dark:border-green-800"
                                  >
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {r.missed_keywords && r.missed_keywords.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1.5 flex items-center gap-1">
                                <Tag className="w-3 h-3" /> Missed Keywords:
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {r.missed_keywords.map((kw, j) => (
                                  <span
                                    key={j}
                                    className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-xs font-medium border border-red-200 dark:border-red-800"
                                  >
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Feedback */}
                        {r.feedback && (
                          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                            <p className="text-sm text-indigo-700 dark:text-indigo-300">{r.feedback}</p>
                          </div>
                        )}

                        {/* Explanation */}
                        {r.explanation && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Explanation:</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{r.explanation}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Strengths & Weaknesses */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-6 bg-gradient-to-br from-green-50/80 to-emerald-50/50 dark:from-green-950/30 dark:to-emerald-950/20 border-green-200/50 dark:border-green-800/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">Strengths</h3>
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

            <GlassCard className="p-6 bg-gradient-to-br from-amber-50/80 to-yellow-50/50 dark:from-amber-950/30 dark:to-yellow-950/20 border-amber-200/50 dark:border-amber-800/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300">Areas for Improvement</h3>
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

          {/* Overall Feedback */}
          {overallFeedback && (
            <motion.div variants={item}>
              <GlassCard className="p-6 bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/20 border-amber-200/50 dark:border-amber-800/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300">Overall Feedback</h3>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">{overallFeedback}</p>
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
              className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-2xl shadow-lg shadow-amber-500/25 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Try Another Topic
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/short-answer-exam', { state: { topic } })}
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
              View Dashboard
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
