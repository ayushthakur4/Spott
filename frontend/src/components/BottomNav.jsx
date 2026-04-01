import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, User, LogIn } from 'lucide-react';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const tabs = [
    { name: 'Home',    icon: Home,    path: '/' },
    { name: 'Explore', icon: Compass, path: '/explore' },
    user
      ? { name: 'Profile', icon: User,  path: `/profile/${user._id}` }
      : { name: 'Login',   icon: LogIn, path: '/login' },
  ];

  return (
    /* Floating pill nav — only on mobile */
    <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-xs">
      <div className="glass border border-white/60 rounded-3xl shadow-soft px-2 py-1 flex items-center justify-around pb-safe">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`relative flex flex-col items-center justify-center gap-1 px-5 py-2 rounded-2xl transition-all duration-250 btn-press ${
                isActive
                  ? 'text-white gradient-brand shadow-glow-sm scale-105'
                  : 'text-slate-500 hover:text-primary-500'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'text-white' : ''}`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
