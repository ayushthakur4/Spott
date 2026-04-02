import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const BottomNav = ({ setIsCreateModalOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-[#0e0e0e]/90 backdrop-blur-xl border-t border-white/5 z-50 flex justify-around items-center py-3 px-4 pb-safe">
      <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)]'}`}>
        <span className="material-symbols-outlined" data-icon="home">home</span>
        <span className={`text-[10px] ${isActive('/') ? 'font-bold' : ''}`}>Home</span>
      </Link>
      
      <Link to="/explore" className={`flex flex-col items-center gap-1 ${isActive('/explore') ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)]'}`}>
        <span className="material-symbols-outlined" data-icon="explore" style={isActive('/explore') ? { fontVariationSettings: "'FILL' 1" } : {}}>explore</span>
        <span className={`text-[10px] ${isActive('/explore') ? 'font-bold' : ''}`}>Explore</span>
      </Link>
      
      <div className="relative -top-6">
        <button 
          onClick={() => setIsCreateModalOpen && setIsCreateModalOpen(true)}
          className="w-14 h-14 bg-[var(--color-primary)] rounded-full shadow-lg shadow-[var(--color-primary)]/30 flex items-center justify-center text-[var(--color-on-primary)] active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined" data-icon="add">add</span>
        </button>
      </div>
      
      <Link to="/explore?filter=hazard" className={`flex flex-col items-center gap-1 ${location.search.includes('hazard') ? 'text-[var(--color-secondary)]' : 'text-[var(--color-on-surface-variant)]'}`}>
        <span className="material-symbols-outlined" data-icon="warning">warning</span>
        <span className="text-[10px]">Alerts</span>
      </Link>
      
      <Link to="/profile" className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)]'}`}>
        <span className="material-symbols-outlined" data-icon="person">person</span>
        <span className={`text-[10px] ${isActive('/profile') ? 'font-bold' : ''}`}>Profile</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
