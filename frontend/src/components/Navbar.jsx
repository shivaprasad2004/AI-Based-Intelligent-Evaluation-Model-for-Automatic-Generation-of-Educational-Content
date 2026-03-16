import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SearchBar from './SearchBar';
import StreakDisplay from './StreakDisplay';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, LogOut, Menu, X, LayoutDashboard, Compass, Trophy, Bookmark, BarChart3, User, BookOpen, Brain, ChevronDown, Shield, Settings, FileText, Search } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef(null);

  const handleLogout = () => {
    setAvatarOpen(false);
    setMobileOpen(false);
    logout();
    navigate('/login');
  };

  // Close avatar dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setAvatarOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/explore', label: 'Explore', icon: Brain },
    { to: '/browse', label: 'Browse', icon: Compass },
    ...(user.role === 'educator' ? [{ to: '/topics', label: 'Topics', icon: BookOpen }] : []),
    ...(user.role === 'student' ? [{ to: '/learning-dashboard', label: 'Progress', icon: BarChart3 }] : []),
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { to: '/notes', label: 'Notes', icon: FileText },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const isActive = (path) => location.pathname === path;

  const avatarMenuItems = [
    { label: 'Profile', icon: User, action: () => navigate('/profile') },
    { label: 'Change Password', icon: Shield, action: () => navigate('/profile', { state: { openSecurity: true } }) },
    { label: 'Settings', icon: Settings, action: () => navigate('/profile') },
  ];

  return (
    <nav className="sticky top-0 z-50 glass shadow-lg shadow-indigo-500/5" aria-label="Main navigation">
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Nav */}
            <div className="flex items-center gap-6">
              <Link
                to="/dashboard"
                className="text-xl font-bold text-white flex items-center gap-2 group"
              >
                <span className="bg-white/20 rounded-lg px-2 py-1 text-sm group-hover:bg-white/30 transition-colors">
                  E
                </span>
                <span className="bg-gradient-to-r from-white to-white group-hover:from-yellow-200 group-hover:to-pink-200 bg-clip-text text-transparent transition-all duration-300">
                  EvalAI
                </span>
              </Link>
              <div className="hidden lg:flex items-center gap-1">
                {links.map(l => (
                  <Link key={l.to} to={l.to}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                      isActive(l.to)
                        ? 'bg-white/20 text-white font-medium'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}>
                    <l.icon className="w-4 h-4" />
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Search + Actions */}
            <div className="hidden md:flex items-center gap-4">
              <SearchBar />
              <StreakDisplay streak={user.current_streak} compact />
              <NotificationCenter />
              <button onClick={toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Avatar Dropdown */}
              <div className="relative pl-3 border-l border-white/20" ref={avatarRef}>
                <button
                  onClick={() => setAvatarOpen(!avatarOpen)}
                  aria-label="User menu"
                  aria-expanded={avatarOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2 hover:bg-white/10 rounded-lg px-2 py-1.5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-white/80 hidden xl:block max-w-[100px] truncate">{user.username || 'User'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-white/60 transition-transform duration-200 ${avatarOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {avatarOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                      {/* User info header */}
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{user.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email || user.role}</p>
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        {avatarMenuItems.map((item) => (
                          <button
                            key={item.label}
                            onClick={() => { setAvatarOpen(false); item.action(); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <item.icon className="w-4 h-4 text-gray-400" />
                            {item.label}
                          </button>
                        ))}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 dark:border-gray-700 py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} className="lg:hidden p-2 text-white">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="lg:hidden overflow-hidden border-t border-white/10"
            >
              <div className="py-3 px-4 space-y-1">
                {links.map((l, idx) => (
                  <motion.div
                    key={l.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Link to={l.to} onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm ${
                        isActive(l.to) ? 'bg-white/20 text-white font-medium' : 'text-white/70 hover:bg-white/10'
                      }`}>
                      <l.icon className="w-4 h-4" /> {l.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile profile section */}
                <div className="pt-3 mt-2 border-t border-white/10 space-y-1">
                  <Link to="/profile" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <Link to="/profile" onClick={() => setMobileOpen(false)} state={{ openSecurity: true }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10">
                    <Shield className="w-4 h-4" /> Change Password
                  </Link>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <button onClick={toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                    {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-300 hover:text-red-200 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
