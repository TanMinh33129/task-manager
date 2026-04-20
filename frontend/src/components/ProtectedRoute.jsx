import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{textAlign:'center',padding:'40px',fontSize:'16px'}}>Đang tải...</div>;
  return user ? children : <Navigate to="/login" />;
};

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{textAlign:'center',padding:'40px',fontSize:'16px'}}>Đang tải...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};
