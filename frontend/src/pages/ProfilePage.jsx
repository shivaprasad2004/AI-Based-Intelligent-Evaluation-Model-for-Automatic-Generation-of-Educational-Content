import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile card */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile</h1>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Username</p>
            <p className="text-lg font-medium">{user.username || 'User'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-medium">{user.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="text-lg font-medium capitalize">{user.role}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="text-lg font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Quiz history for students */}
      {user.role === 'student' && (
        <>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quiz History</h2>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : sessions.length === 0 ? (
            <p className="text-gray-500">No quizzes taken yet.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map(s => (
                <div
                  key={s.id}
                  onClick={() => s.completed_at && navigate('/results', { state: { session: s, percentage: s.percentage } })}
                  className="bg-white rounded-lg shadow p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="font-medium text-gray-800">{s.topic_name}</p>
                    <p className="text-sm text-gray-500">
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
        </>
      )}
    </div>
  );
}
