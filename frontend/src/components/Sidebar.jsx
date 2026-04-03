import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Sidebar = ({ setIsCreateModalOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-[var(--color-surface-container-low)] shadow-2xl shadow-black font-['Inter'] tracking-tight z-40 pt-[var(--navbar-height)]">
      <div className="flex flex-col p-6 space-y-8 h-full">
        
        <div className="space-y-1">
          <h2 className="text-[var(--color-on-surface)] text-xl font-bold">Navigator</h2>
          <p className="text-[var(--color-on-surface-variant)] text-xs uppercase tracking-widest opacity-60">The Luminescent Path</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link 
            to="/" 
            className={`flex items-center gap-4 px-4 py-3 rounded-xl hover:translate-x-1 transition-all duration-200 cursor-pointer active:opacity-80 ${isActive('/') ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold' : 'text-[var(--color-on-surface-variant)] hover:bg-white/5 font-medium'}`}
          >
            <span className="material-symbols-outlined" data-icon="home">home</span>
            <span>Home</span>
          </Link>
          
          <Link 
            to="/explore" 
            className={`flex items-center gap-4 px-4 py-3 rounded-xl hover:translate-x-1 transition-all duration-200 cursor-pointer active:opacity-80 ${isActive('/explore') ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold' : 'text-[var(--color-on-surface-variant)] hover:bg-white/5 font-medium'}`}
          >
            <span className="material-symbols-outlined" data-icon="explore">explore</span>
            <span>Explore</span>
          </Link>
          
          <Link 
            to="/explore?filter=hazard"
            className="flex items-center gap-4 px-4 py-3 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-secondary)]/10 hover:text-[var(--color-secondary)] rounded-xl hover:translate-x-1 transition-all duration-200 cursor-pointer font-medium"
          >
            <span className="material-symbols-outlined" data-icon="warning">warning</span>
            <span>Road Hazards</span>
          </Link>
          
          <Link 
            to="/explore?filter=chill"
            className="flex items-center gap-4 px-4 py-3 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-tertiary)]/10 hover:text-[var(--color-tertiary)] rounded-xl hover:translate-x-1 transition-all duration-200 cursor-pointer font-medium"
          >
            <span className="material-symbols-outlined" data-icon="local_cafe">local_cafe</span>
            <span>Chill Spots</span>
          </Link>
          
          <Link 
            to="/explore?filter=police"
            className="flex items-center gap-4 px-4 py-3 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] rounded-xl hover:translate-x-1 transition-all duration-200 cursor-pointer font-medium"
          >
            <span className="material-symbols-outlined" data-icon="local_police">local_police</span>
            <span>Police Activity</span>
          </Link>
        </nav>
        
        <button 
          onClick={() => setIsCreateModalOpen && setIsCreateModalOpen(true)}
          className="w-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(122,175,255,0.2)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 tracking-wide"
        >
          <span className="material-symbols-outlined max-w-none text-xl">add_circle</span> Report Hazard
        </button>
        
        <div className="pt-6 border-t border-white/5 space-y-2">
          <Link to="/profile" className="flex items-center gap-4 px-4 py-2 text-[var(--color-on-surface-variant)] hover:text-white transition-colors text-sm">
            <span className="material-symbols-outlined text-[20px]" data-icon="settings">settings</span>
            <span>Profile Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-2 text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded-xl transition-colors text-sm w-full text-left font-medium"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
