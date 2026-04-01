import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { MapPin, LogOut, User, Menu } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm px-4 md:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="bg-primary-600 p-2 rounded-xl">
            <MapPin className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500 hidden sm:block">
            RoadAlert
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <Link to={`/profile/${user._id}`} className="flex items-center gap-2 hover:bg-slate-100 p-1 pr-3 rounded-full transition">
              <img src={user.profileImage} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
              <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-600 transition p-2 rounded-full hover:bg-slate-100"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-slate-600 font-medium hover:text-primary-600 transition px-2">
              Log in
            </Link>
            <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-primary-700 transition">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
