import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';

function App() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <div className="bg-[var(--color-background)] text-[var(--color-on-surface)] min-h-screen font-['Inter'] relative">
          
          <Navbar />
          <Sidebar setIsCreateModalOpen={setIsCreateModalOpen} />
          
          <Routes>
            <Route path="/"            element={<Home isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen} />} />
            <Route path="/explore"     element={<Explore />} />
            <Route path="/login"       element={<Login />} />
            <Route path="/register"    element={<Register />} />
            <Route path="/profile"     element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>

          <BottomNav setIsCreateModalOpen={setIsCreateModalOpen} />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
