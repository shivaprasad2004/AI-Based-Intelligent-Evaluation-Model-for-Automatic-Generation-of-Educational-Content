import { useAuth } from '../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import EducatorDashboard from './EducatorDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  return user.role === 'educator' ? <EducatorDashboard /> : <StudentDashboard />;
}
