import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SearchBar from './SearchBar';
import StreakDisplay from './StreakDisplay';
import { Sun, Moon, LogOut, Menu, X, LayoutDashboard, Compass, Trophy, Bookmark, BarChart3, User, BookOpen, Brain } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  if (!user) return null;

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/explore', label: 'Explore', icon: Brain },
    { to: '/browse', label: 'Browse', icon: Compass },
    ...(user.role === 'educator' ? [{ to: '/topics', label: 'Topics', icon: BookOpen }] : []),
    ...(user.role === 'student' ? [{ to: '/learning-dashboard', label: 'Progress', icon: BarChart3 }] : []),
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass shadow-lg shadow-indigo-500/5">
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Nav */}
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="text-xl font-bold text-white flex items-center gap-2">
                <span className="bg-white/20 rounded-lg px-2 py-1 text-sm">E</span>
                EvalAI
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
              <button onClick={toggle} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <div className="flex items-center gap-2 pl-3 border-l border-white/20">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm text-white/80 hidden xl:block">{user.username || 'User'}</span>
                <button onClick={handleLogout} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-white">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 py-3 px-4 space-y-1 animate-fade-in">
            {links.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  isActive(l.to) ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'
                }`}>
                <l.icon className="w-4 h-4" /> {l.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button onClick={toggle} className="p-2 text-white/70 hover:text-white">
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-white/70 hover:text-white">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
