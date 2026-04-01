import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, User, Zap } from 'lucide-react';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import logo from '../assets/logo.png';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const navLinks = [
    { name: 'Home',     icon: Home,    path: '/',        emoji: '🏠' },
    { name: 'Explore',  icon: Compass, path: '/explore', emoji: '🧭' },
    ...(user ? [{ name: 'Profile', icon: User, path: `/profile/${user._id}`, emoji: '👤' }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex flex-col h-full py-4 px-3 overflow-y-auto no-scrollbar">

      {/* Brand in sidebar */}
      <Link to="/" className="flex items-center gap-2.5 px-2 mb-6 group btn-press">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-400/25 blur-md rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <img src={logo} alt="Spott" className="relative h-8 w-auto object-contain z-10" />
        </div>
        <span className="font-display font-bold text-lg text-gradient tracking-tight">Spott</span>
      </Link>

      {/* Section label */}
      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 px-3 mb-2">Navigation</p>

      {/* Nav links */}
      <nav className="space-y-1 flex-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-200 group ${
                active
                  ? 'text-white gradient-brand shadow-glow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className={`flex items-center justify-center w-7 h-7 rounded-xl transition-all duration-200 ${
                active ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-slate-200'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span>{link.name}</span>
              {active && (
                <span className="ml-auto text-white/70 text-xs">●</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom CTA / copyright */}
      <div className="mt-6 space-y-4">
        {!user && (
          <div className="relative overflow-hidden rounded-2xl p-4 gradient-brand text-white">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-8 translate-x-8 blur-xl" />
            <Zap className="w-5 h-5 mb-2 opacity-80" />
            <p className="font-display font-bold text-sm leading-snug mb-1">Join Spott</p>
            <p className="text-xs text-white/75 mb-3 leading-relaxed">Report alerts & discover hidden spots near you.</p>
            <Link
              to="/register"
              className="block w-full text-center bg-white text-primary-600 font-bold text-xs py-2 rounded-xl hover:bg-primary-50 transition btn-press"
            >
              Get Started Free →
            </Link>
          </div>
        )}

        <p className="text-[10px] text-slate-400 text-center leading-loose px-2">
          © {new Date().getFullYear()} <span className="font-semibold text-slate-500">Ayush Thakur</span>
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
