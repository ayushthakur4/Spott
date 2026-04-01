import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { LogOut, Bell } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200/60 shadow-soft">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">

        {/* ── Brand ── */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0 group btn-press"
          aria-label="Go home"
        >
          {/* Logo bubble — fixed size container so the PNG scales cleanly */}
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shrink-0 shadow-glow-sm group-hover:shadow-glow transition-all duration-300">
            {/* Cyan glow ring on hover */}
            <div className="absolute inset-0 gradient-brand opacity-10 group-hover:opacity-20 transition-opacity duration-300 z-0" />
            <img
              src={logo}
              alt="Spott logo"
              className="absolute inset-0 w-full h-full object-contain p-0.5 z-10"
            />
          </div>

          {/* App name */}
          <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-gradient">
            Spott
          </span>
        </Link>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {user ? (
            <>
              {/* Bell */}
              <button
                className="relative p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all duration-200"
                title="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full ring-1 ring-white" />
              </button>

              {/* Avatar pill */}
              <Link
                to={`/profile/${user._id}`}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-slate-200 hover:border-primary-300 hover:bg-white transition-all duration-200 group"
              >
                <div className="relative shrink-0">
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-primary-200 group-hover:ring-primary-400 transition-all"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full ring-1 ring-white" />
                </div>
                <span className="text-sm font-semibold text-slate-700 hidden sm:block max-w-[80px] truncate">
                  {user.name}
                </span>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                title="Log out"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-600 hover:text-primary-600 px-3 py-1.5 rounded-xl hover:bg-primary-50 transition-all duration-200"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="gradient-brand text-white text-sm font-bold px-4 py-2 rounded-xl shadow-glow-sm hover:shadow-glow transition-all duration-200 btn-press"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
