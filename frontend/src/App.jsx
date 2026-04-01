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
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#f0f6ff' }}>
          <Navbar />

          <div className="flex flex-1 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-60 lg:w-64 shrink-0 border-r border-slate-200/70 bg-white/80 backdrop-blur-sm z-20">
              <Sidebar />
            </aside>

            {/* Main scroll area */}
            <main className="flex-1 relative overflow-y-auto no-scrollbar pb-24 md:pb-4">
              <Routes>
                <Route path="/"            element={<Home />} />
                <Route path="/explore"     element={<Explore />} />
                <Route path="/login"       element={<Login />} />
                <Route path="/register"    element={<Register />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="*"            element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>

          {/* Mobile floating bottom nav */}
          <BottomNav />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
