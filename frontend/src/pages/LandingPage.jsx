import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Globe, Brain, BookOpen, TrendingUp, BarChart3, Trophy, Play,
  ArrowRight, CheckCircle, Sparkles, Users, Zap, GraduationCap,
  MessageSquare, Shield, Target, ChevronRight, Star
} from 'lucide-react';

function Section({ children, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// SVG Illustrations
function HeroIllustration() {
  return (
    <svg viewBox="0 0 500 400" className="w-full max-w-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Screen/Monitor */}
      <rect x="120" y="60" width="260" height="180" rx="12" fill="#312e81" stroke="#6366f1" strokeWidth="2"/>
      <rect x="130" y="70" width="240" height="155" rx="8" fill="#1e1b4b"/>
      {/* Screen content - quiz */}
      <rect x="145" y="85" width="210" height="20" rx="4" fill="#4f46e5" opacity="0.6"/>
      <rect x="145" y="115" width="180" height="12" rx="3" fill="#6366f1" opacity="0.4"/>
      <rect x="145" y="135" width="90" height="25" rx="5" fill="#10b981" opacity="0.5"/>
      <rect x="245" y="135" width="90" height="25" rx="5" fill="#6366f1" opacity="0.3"/>
      <rect x="145" y="170" width="90" height="25" rx="5" fill="#6366f1" opacity="0.3"/>
      <rect x="245" y="170" width="90" height="25" rx="5" fill="#f59e0b" opacity="0.4"/>
      {/* Monitor stand */}
      <rect x="220" y="240" width="60" height="15" rx="2" fill="#4338ca"/>
      <rect x="200" y="255" width="100" height="8" rx="4" fill="#4338ca"/>
      {/* Brain icon floating */}
      <motion.g animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
        <circle cx="420" cy="100" r="30" fill="#6366f1" opacity="0.15"/>
        <circle cx="420" cy="100" r="20" fill="#6366f1" opacity="0.3"/>
        <text x="420" y="106" textAnchor="middle" fill="#a5b4fc" fontSize="18" fontWeight="bold">AI</text>
      </motion.g>
      {/* Book floating */}
      <motion.g animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}>
        <rect x="50" y="120" width="45" height="35" rx="4" fill="#8b5cf6" opacity="0.25"/>
        <rect x="55" y="125" width="35" height="3" rx="1" fill="#c4b5fd" opacity="0.5"/>
        <rect x="55" y="131" width="25" height="3" rx="1" fill="#c4b5fd" opacity="0.4"/>
        <rect x="55" y="137" width="30" height="3" rx="1" fill="#c4b5fd" opacity="0.3"/>
      </motion.g>
      {/* Chart floating */}
      <motion.g animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}>
        <rect x="400" y="220" width="60" height="50" rx="6" fill="#10b981" opacity="0.15"/>
        <rect x="410" y="248" width="8" height="15" rx="2" fill="#10b981" opacity="0.5"/>
        <rect x="422" y="238" width="8" height="25" rx="2" fill="#10b981" opacity="0.6"/>
        <rect x="434" y="230" width="8" height="33" rx="2" fill="#10b981" opacity="0.7"/>
        <rect x="446" y="242" width="8" height="21" rx="2" fill="#10b981" opacity="0.5"/>
      </motion.g>
      {/* Sparkle particles */}
      <motion.circle cx="100" cy="80" r="3" fill="#f59e0b" animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 2, repeat: Infinity }}/>
      <motion.circle cx="450" cy="170" r="2" fill="#ec4899" animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}/>
      <motion.circle cx="80" cy="200" r="2.5" fill="#06b6d4" animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 1.8, repeat: Infinity, delay: 1 }}/>
      {/* Person studying */}
      <circle cx="70" cy="290" r="15" fill="#6366f1" opacity="0.3"/>
      <rect x="55" y="305" width="30" height="40" rx="8" fill="#6366f1" opacity="0.2"/>
      {/* Checkmarks */}
      <motion.g animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}>
        <circle cx="370" cy="310" r="12" fill="#10b981" opacity="0.3"/>
        <path d="M364 310l4 4 8-8" stroke="#10b981" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
      </motion.g>
    </svg>
  );
}

function FeatureIcon({ icon: Icon, color }) {
  const colors = {
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
    emerald: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600',
  };
  return (
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  );
}

const features = [
  { icon: Globe, color: 'indigo', title: 'Real-time Internet Learning', desc: 'Browse any topic and get instant, up-to-date information from Wikipedia and the web. Learn before you quiz.' },
  { icon: Brain, color: 'purple', title: 'AI-Powered Quizzes', desc: 'Smart question generation with adaptive difficulty. 10 questions per quiz tailored to your level.' },
  { icon: BookOpen, color: 'emerald', title: 'Previous Year Questions', desc: 'Practice with real exam questions from JEE, NEET, GATE and more. Exam-ready preparation.' },
  { icon: TrendingUp, color: 'blue', title: 'Adaptive Difficulty', desc: 'Scoring 80%+? Level up automatically. Struggling? Get easier questions and targeted study material.' },
  { icon: BarChart3, color: 'orange', title: 'Smart Analytics', desc: 'Visual dashboards showing score trends, topic strengths, knowledge gaps, and learning progress.' },
  { icon: MessageSquare, color: 'pink', title: 'AI Tutor Chatbot', desc: 'Ask doubts, get explanations, generate practice questions. Your personal AI tutor available 24/7.' },
];

const steps = [
  { num: '01', title: 'Browse & Learn', desc: 'Choose a subject and topic. Get real-time content from the internet with key concepts and explanations.', icon: Globe },
  { num: '02', title: 'Take Smart Quizzes', desc: '10 AI-generated questions at your level. Get instant feedback with detailed explanations for every answer.', icon: Target },
  { num: '03', title: 'Track & Improve', desc: 'View analytics, identify knowledge gaps, get personalized study materials, and climb the leaderboard.', icon: TrendingUp },
];

const subjects = [
  { name: 'Mathematics', icon: '∑', topics: 6, gradient: 'from-blue-500 to-indigo-600' },
  { name: 'Science', icon: '⚗', topics: 4, gradient: 'from-emerald-500 to-teal-600' },
  { name: 'Programming', icon: '</>', topics: 7, gradient: 'from-purple-500 to-pink-600' },
  { name: 'Computer Science', icon: 'CS', topics: 4, gradient: 'from-orange-500 to-red-600' },
  { name: 'General Knowledge', icon: '🌍', topics: 4, gradient: 'from-cyan-500 to-blue-600' },
];

const stats = [
  { value: '5+', label: 'Subjects', icon: BookOpen },
  { value: '25+', label: 'Topics', icon: GraduationCap },
  { value: '250+', label: 'Questions', icon: Target },
  { value: 'AI', label: 'Powered', icon: Sparkles },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-strong shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold gradient-text">EvalAI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" /> AI-Powered Learning Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                Master Any Subject with{' '}
                <span className="gradient-text">Intelligent</span>{' '}
                Learning
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg leading-relaxed">
                Real-time internet content, AI-generated quizzes, adaptive difficulty,
                smart analytics, and a personal AI tutor — all in one platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium text-lg hover:from-indigo-700 hover:to-purple-700 shadow-xl shadow-indigo-500/30 transition-all card-hover-lift">
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-medium text-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-md transition-all">
                  <Play className="w-5 h-5 text-indigo-500" /> Sign In
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8">
                <div className="flex -space-x-2">
                  {['bg-indigo-500', 'bg-purple-500', 'bg-emerald-500', 'bg-pink-500'].map((c, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-xs font-bold`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="ml-1">Students love it</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <HeroIllustration />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <Section className="py-12 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <s.icon className="w-8 h-8 text-indigo-200 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{s.value}</div>
                <div className="text-indigo-200 text-sm">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Features Grid */}
      <Section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4" /> Why EvalAI?
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to <span className="gradient-text">Excel</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              A complete learning ecosystem powered by AI, designed to help you learn faster and smarter.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 card-hover-lift group"
              >
                <FeatureIcon icon={f.icon} color={f.color} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">{f.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* How It Works */}
      <Section className="py-20 lg:py-28 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Three simple steps to start learning smarter</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-indigo-300 via-purple-300 to-emerald-300 dark:from-indigo-800 dark:via-purple-800 dark:to-emerald-800" />

            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30 relative z-10">
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-xs font-bold text-indigo-500 mb-2">STEP {step.num}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Subjects Preview */}
      <Section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explore <span className="gradient-text">Subjects</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">5 categories, 25+ topics, hundreds of questions across all major subjects</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {subjects.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`bg-gradient-to-br ${s.gradient} rounded-2xl p-5 text-white card-hover-lift cursor-pointer`}
              >
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{s.name}</h3>
                <p className="text-white/70 text-xs">{s.topics} Topics</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* AI Features Showcase */}
      <Section className="py-20 lg:py-28 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <Brain className="w-4 h-4" /> AI-Powered Features
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Your Personal <span className="gradient-text">AI Tutor</span>
              </h2>
              <div className="space-y-5">
                {[
                  { icon: MessageSquare, title: 'Ask Anything', desc: 'Get instant answers and detailed explanations for any concept' },
                  { icon: Target, title: 'Knowledge Gap Detection', desc: 'AI analyzes your mistakes to pinpoint exactly what you need to study' },
                  { icon: BookOpen, title: 'Auto Study Material', desc: 'Struggling? Get personalized revision notes and memory aids generated for you' },
                  { icon: Shield, title: 'Smart Feedback', desc: 'Not just right or wrong — detailed explanations for every answer with learning tips' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    viewport={{ once: true }}
                    className="flex gap-4 items-start"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Chat preview mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-md mx-auto"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">EvalAI Tutor</h4>
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span> Online
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-br-md text-sm max-w-[80%]">
                    Explain Newton's second law of motion
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded-2xl rounded-bl-md text-sm max-w-[85%]">
                    <p className="font-medium mb-1">Newton's Second Law: F = ma</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">Example: Push a cart harder → it accelerates faster!</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-br-md text-sm max-w-[80%]">
                    Give me practice questions on this
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded-2xl rounded-bl-md text-sm max-w-[85%]">
                    <p className="font-medium text-xs">Practice Q: A 5kg object has F=20N. Find acceleration.</p>
                    <p className="text-xs text-emerald-600 mt-1">a = F/m = 20/5 = 4 m/s²</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Start Learning Smarter Today
            </h2>
            <p className="text-xl text-indigo-200 mb-8 max-w-2xl mx-auto">
              Join EvalAI and experience the future of education. AI-powered quizzes,
              real-time content, and personalized learning paths.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-indigo-700 rounded-xl font-bold text-lg hover:bg-gray-50 shadow-2xl transition-all card-hover-lift">
              Create Free Account <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span className="text-xl font-bold text-white">EvalAI</span>
              </div>
              <p className="text-gray-400 text-sm">AI-Based Intelligent Evaluation System. Learn smarter with adaptive quizzes and real-time content.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>AI-Powered Quizzes</li>
                <li>Real-time Learning</li>
                <li>Smart Analytics</li>
                <li>AI Tutor Chatbot</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Subjects</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Mathematics</li>
                <li>Science</li>
                <li>Programming</li>
                <li>Computer Science</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} EvalAI. All rights reserved. Built with AI for smarter learning.
          </div>
        </div>
      </footer>
    </div>
  );
}
