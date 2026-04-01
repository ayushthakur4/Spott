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
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
          <Navbar />

          <div className="flex flex-1 overflow-hidden">
            {/* Desktop Sidebar — hidden on mobile */}
            <div className="hidden md:block w-64 border-r border-slate-200 bg-white shadow-soft z-20 shrink-0">
              <Sidebar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-y-auto no-scrollbar pb-16 md:pb-0">
              <Routes>
                <Route path="/"              element={<Home />} />
                <Route path="/explore"       element={<Explore />} />
                <Route path="/login"         element={<Login />} />
                <Route path="/register"      element={<Register />} />
                <Route path="/profile/:id"   element={<Profile />} />
                <Route path="*"             element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>

          {/* Mobile Bottom Tab Bar — hidden on md+ */}
          <BottomNav />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
