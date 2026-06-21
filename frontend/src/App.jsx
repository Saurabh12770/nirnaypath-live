import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import LearnHub from './pages/LearnHub';
import TestCenter from './pages/TestCenter';
import AdminPanel from './pages/AdminPanel';
import About from './pages/About';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--color-bg-base)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:48, height:48, border:'3px solid rgba(249,115,22,0.3)', borderTop:'3px solid var(--color-accent-primary)', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }} />
        <p style={{ color:'var(--color-accent-primary)', fontFamily:'Inter,sans-serif', fontWeight:600 }}>Loading NirnayPath...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  return user ? children : <Navigate to="/" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/learn" element={<ProtectedRoute><LearnHub /></ProtectedRoute>} />
      <Route path="/learn/:exam" element={<ProtectedRoute><LearnHub /></ProtectedRoute>} />
      <Route path="/learn/:exam/:subject" element={<ProtectedRoute><LearnHub /></ProtectedRoute>} />
      <Route path="/learn/:exam/:subject/:topic" element={<ProtectedRoute><LearnHub /></ProtectedRoute>} />
      <Route path="/learn/:exam/:subject/:topic/:subtopic" element={<ProtectedRoute><LearnHub /></ProtectedRoute>} />
      <Route path="/test" element={<ProtectedRoute><TestCenter /></ProtectedRoute>} />
      <Route path="/test/session/:sessionId" element={<ProtectedRoute><TestCenter /></ProtectedRoute>} />
      <Route path="/test/result/:resultId" element={<ProtectedRoute><TestCenter /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminPanel /></AdminRoute></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
