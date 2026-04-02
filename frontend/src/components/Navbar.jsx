import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0e0e0e]/60 backdrop-blur-[40px] border-b-[0.5px] border-white/10 shadow-[0_0_60px_rgba(122,175,255,0.04)] font-['Inter'] antialiased specular-edge">
      <div className="flex items-center justify-between px-6 py-4 w-full">
        
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-black tracking-tighter text-[var(--color-primary)]">
            Spott
          </Link>
          
          <div className="hidden md:flex items-center bg-[var(--color-surface-container-highest)] px-4 py-2 rounded-full gap-3 group border border-white/5 focus-within:border-[var(--color-primary)]/40 transition-all">
            <span className="material-symbols-outlined text-[var(--color-on-surface-variant)] group-focus-within:text-[var(--color-primary)]">search</span>
            <input 
              className="bg-transparent border-none focus:ring-0 text-sm w-64 placeholder:text-[var(--color-on-surface-variant)] outline-none" 
              placeholder="Search the void..." 
              type="text"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-8">
            <Link to="/" className="text-[var(--color-on-surface-variant)] hover:text-white transition-colors duration-300 active:scale-95 text-sm font-medium">Dashboard</Link>
            <Link to="/explore" className="text-[var(--color-primary)] font-bold hover:text-white transition-colors duration-300 active:scale-95 text-sm">Explore</Link>
            <Link to="/profile" className="text-[var(--color-on-surface-variant)] hover:text-white transition-colors duration-300 active:scale-95 text-sm font-medium">Community</Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <button className="relative text-[var(--color-on-surface-variant)] hover:text-white transition-colors">
                  <span className="material-symbols-outlined max-w-none">notifications</span>
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--color-error)] rounded-full"></span>
                </button>
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="focus:outline-none cursor-pointer"
                    aria-label="User menu"
                  >
                    <img 
                      alt="User profile avatar" 
                      className={`w-8 h-8 rounded-full border transition-colors ${menuOpen ? 'border-[var(--color-primary)]' : 'border-white/10 hover:border-white/30'}`}
                      src={user?.profileImage || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.name}`}
                    />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--color-surface-container-high)] rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden animate-pop-in ghost-border">
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-sm font-bold text-[var(--color-on-surface)] truncate">{user?.name}</p>
                        <p className="text-[10px] text-[var(--color-on-surface-variant)] truncate mt-0.5">{user?.email}</p>
                      </div>
                      <Link 
                        to="/profile" 
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-on-surface)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] font-bold tracking-wide transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">person</span>
                        MY PROFILE
                      </Link>
                      <button 
                        onClick={handleLogout} 
                        className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-error)] hover:bg-[var(--color-error)]/10 font-bold tracking-wide transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        LOGOUT
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
             <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">LOGIN</Link>
                <Link to="/register" className="text-[10px] px-4 py-2 rounded-full font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 transition-colors uppercase tracking-widest border border-[var(--color-primary)]/30">REGISTER</Link>
             </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
