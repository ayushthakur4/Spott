import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, User } from 'lucide-react';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import logo from '../assets/logo.png';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const navLinks = [
    { name: 'Home Feed', icon: Home,    path: '/' },
    { name: 'Explore',   icon: Compass, path: '/explore' },
    ...(user ? [{ name: 'My Profile', icon: User, path: `/profile/${user._id}` }] : []),
  ];

  return (
    <div className="h-full py-6 px-4 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-2 hover:opacity-80 transition">
          <img src={logo} alt="Spott" className="h-10 w-auto object-contain" />
          <span className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500 tracking-tight">
            Spott
          </span>
        </Link>
        <div className="space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-slate-500'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {!user && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <p className="text-sm text-slate-600 text-center font-medium">Join the Spott community</p>
            <p className="text-xs text-slate-500 text-center mb-3">Post alerts, comment, and save locations.</p>
            <Link to="/register" className="w-full block text-center bg-primary-600 text-white rounded-xl py-2 font-medium hover:bg-primary-700 transition">
              Sign Up
            </Link>
            <Link to="/login" className="w-full block text-center bg-white text-slate-700 border border-slate-300 rounded-xl py-2 font-medium hover:bg-slate-50 transition">
              Log In
            </Link>
          </div>
        )}

        {/* Copyright */}
        <p className="text-[11px] text-slate-400 text-center leading-relaxed px-2">
          © {new Date().getFullYear()} <span className="font-semibold text-slate-500">Ayush Thakur</span><br />
          All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Sidebar;

