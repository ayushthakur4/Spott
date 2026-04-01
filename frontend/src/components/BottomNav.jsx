import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, User, LogIn } from 'lucide-react';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

/**
 * BottomNav — Mobile-only bottom tab bar.
 * Hidden on md and above (desktop shows the Sidebar instead).
 */
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
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-stretch h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.name}
              to={tab.path}
              className={`flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold tracking-wide transition-colors ${
                isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span>{tab.name}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-primary-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
