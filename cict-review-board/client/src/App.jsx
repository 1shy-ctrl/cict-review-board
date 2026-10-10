import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <Login />;
}
