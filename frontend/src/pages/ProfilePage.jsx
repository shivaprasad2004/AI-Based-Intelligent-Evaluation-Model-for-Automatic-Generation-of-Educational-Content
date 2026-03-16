import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Lock, Eye, EyeOff, Edit3, Check, X } from 'lucide-react';
import PasswordStrengthMeter, { getPasswordStrength } from '../components/PasswordStrengthMeter';
import PageTransition from '../components/ui/PageTransition';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Profile editing state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: user?.username || '', email: user?.email || '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  const newPasswordStrength = getPasswordStrength(passwordForm.new);
  const isNewPasswordStrong = newPasswordStrength >= 3;

  const handleProfileSave = async () => {
    if (!editForm.username.trim() || !editForm.email.trim()) {
      return toast.error('Username and email are required');
    }
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        username: editForm.username.trim(),
        email: editForm.email.trim()
      });
      if (setUser && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const cancelEdit = () => {
    setEditForm({ username: user?.username || '', email: user?.email || '' });
    setEditing(false);
  };

  useEffect(() => {
    if (user.role === 'student') {
      api.get('/quiz/history')
        .then(res => setSessions(res.data.sessions))
        .catch(() => toast.error('Failed to load history'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      return toast.error('All password fields are required');
    }
    if (passwordForm.new !== passwordForm.confirm) {
      return toast.error('New passwords do not match');
    }
    if (!isNewPasswordStrong) {
      return toast.error('Please choose a stronger password');
    }

    setChangingPassword(true);
    try {
      await api.post('/auth/change-password', {
        current_password: passwordForm.current,
        new_password: passwordForm.new
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ current: '', new: '', confirm: '' });
      setShowPasswordChange(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const PasswordInput = ({ label, value, field }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={showPasswords[field] ? 'text' : 'password'}
          value={value}
          onChange={(e) => setPasswordForm(f => ({ ...f, [field]: e.target.value }))}
          className="w-full px-4 py-2.5 pr-10 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
        <button type="button" onClick={() => setShowPasswords(s => ({ ...s, [field]: !s[field] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {showPasswords[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Profile</h1>
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={handleProfileSave} disabled={savingProfile}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                  <Check className="w-3.5 h-3.5" /> {savingProfile ? 'Saving...' : 'Save'}
                </button>
                <button onClick={cancelEdit}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Username</p>
                {editing ? (
                  <input type="text" value={editForm.username} onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
                    className="w-full text-lg font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                ) : (
                  <p className="text-lg font-medium text-gray-800 dark:text-white">{user.username || 'User'}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                {editing ? (
                  <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full text-lg font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                ) : (
                  <p className="text-lg font-medium text-gray-800 dark:text-white">{user.email || 'N/A'}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
                <p className="text-lg font-medium capitalize text-gray-800 dark:text-white">{user.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
                <p className="text-lg font-medium text-gray-800 dark:text-white">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Change Password Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Security</h2>
            </div>
            <button onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              {showPasswordChange ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {showPasswordChange && (
            <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handlePasswordChange} className="space-y-4 mt-4">
              <PasswordInput label="Current Password" value={passwordForm.current} field="current" />
              <div>
                <PasswordInput label="New Password" value={passwordForm.new} field="new" />
                <PasswordStrengthMeter password={passwordForm.new} />
              </div>
              <PasswordInput label="Confirm New Password" value={passwordForm.confirm} field="confirm" />
              {passwordForm.new && passwordForm.confirm && passwordForm.new !== passwordForm.confirm && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
              <button type="submit" disabled={changingPassword || !isNewPasswordStrong || passwordForm.new !== passwordForm.confirm}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 font-medium transition-all">
                {changingPassword ? 'Changing...' : 'Update Password'}
              </button>
            </motion.form>
          )}
        </motion.div>

        {/* Quiz history for students */}
        {user.role === 'student' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Quiz History</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto" />
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No quizzes taken yet.</p>
            ) : (
              <div className="space-y-3">
                {sessions.map(s => (
                  <div
                    key={s.id}
                    onClick={() => s.completed_at && navigate('/results', { state: { session: s, percentage: s.percentage } })}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center justify-between cursor-pointer hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700"
                  >
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{s.topic_name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(s.started_at).toLocaleDateString()} - Level {s.difficulty_level}
                      </p>
                    </div>
                    <div className="text-right">
                      {s.percentage !== null ? (
                        <p className={`text-xl font-bold ${
                          s.percentage >= 80 ? 'text-green-600' : s.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {s.percentage}%
                        </p>
                      ) : (
                        <p className="text-gray-400">In progress</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
