import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import DriverDashboard from './components/DriverDashboard';
import StudentDashboard from './components/StudentDashboard';

// Protected Route component
const ProtectedRoute = ({ children, requiredRole }: { children: JSX.Element, requiredRole?: 'driver' | 'student' }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return null;
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // For driver route, check if user has driver email
  if (requiredRole === 'driver' && currentUser.email !== 'driver@college.edu') {
    return <Navigate to="/student" />;
  }

  return children;
};

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/driver" 
              element={
                <ProtectedRoute requiredRole="driver">
                  <DriverDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student" 
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App; 