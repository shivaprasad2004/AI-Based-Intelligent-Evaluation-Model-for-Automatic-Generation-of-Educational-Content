import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { UserPlus, GraduationCap, BookOpen } from 'lucide-react';
import PasswordStrengthMeter, { getPasswordStrength } from '../components/PasswordStrengthMeter';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const passwordStrength = getPasswordStrength(form.password);
  const isPasswordStrong = passwordStrength >= 3; // At least "fair"

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) return toast.error('Fill in all fields');
    if (!isPasswordStrong) return toast.error('Please choose a stronger password');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.role);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.details) {
        toast.error(errorData.details[0]);
      } else {
        toast.error(errorData?.error || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-32 right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 left-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-3 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">E</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Join EvalAI</h2>
          <p className="text-xl text-indigo-200 mb-2">Start your learning journey</p>
          <p className="text-indigo-300/80 max-w-sm">Categories, quizzes, analytics, and AI-powered feedback await you.</p>
        </motion.div>
      </div>

      {/* Right side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Create Account</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Sign up to get started</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Username</label>
                <input type="text" value={form.username} onChange={update('username')}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" placeholder="Choose a username" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={update('email')}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <input type="password" value={form.password} onChange={update('password')}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" placeholder="Create a strong password" />
                <PasswordStrengthMeter password={form.password} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setForm(f => ({ ...f, role: 'student' }))}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${form.role === 'student' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:border-gray-300'}`}>
                    <GraduationCap className="w-5 h-5" /> Student
                  </button>
                  <button type="button" onClick={() => setForm(f => ({ ...f, role: 'educator' }))}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${form.role === 'educator' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:border-gray-300'}`}>
                    <BookOpen className="w-5 h-5" /> Educator
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading || !isPasswordStrong}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all">
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <><UserPlus className="w-4 h-4" /> Create Account</>}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
