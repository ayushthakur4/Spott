import { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

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
                <div className="relative group cursor-pointer">
                  <img 
                    alt="User profile avatar" 
                    className="w-8 h-8 rounded-full border border-white/10" 
                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user?.name}`}
                  />
                  <div className="absolute right-0 top-full mt-2 w-40 bg-[var(--color-surface-container-highest)] rounded-xl border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50 overflow-hidden">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-[var(--color-on-surface)] hover:bg-[var(--color-primary)]/10 font-bold tracking-wide">MY PROFILE</Link>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-[var(--color-error)] hover:bg-[var(--color-error)]/10 font-bold tracking-wide">LOGOUT</button>
                  </div>
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
