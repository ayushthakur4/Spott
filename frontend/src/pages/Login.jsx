import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login, user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => { if (user && !loading) navigate('/'); }, [user, loading, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    const res = await login(formData);
    if (res.success) navigate('/');
    else { setError(res.message); setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row animate-fade-in">

      {/* ── Left decorative panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] gradient-brand relative overflow-hidden flex-col items-center justify-center p-12 text-white">
        {/* Decorative orbs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -right-12 w-64 h-64 bg-primary-700/40 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-400/15 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo with glow */}
          <div className="relative flex justify-center mb-6">
            <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150" />
            <img src={logo} alt="Spott" className="relative h-20 w-auto object-contain drop-shadow-xl z-10" />
          </div>

          <h1 className="font-display font-bold text-4xl xl:text-5xl mb-3 tracking-tight leading-tight">
            Real-time alerts,<br />real places. 📍
          </h1>
          <p className="text-primary-100/80 text-base leading-relaxed">
            Join thousands of spotters reporting road alerts and discovering hidden gems in their city.
          </p>

          {/* Floating stat chips */}
          <div className="flex justify-center gap-3 mt-8 flex-wrap">
            {['🚨 Road Alerts', '☕ Cafés', '🌄 Viewpoints', '💕 Couple Spots'].map(s => (
              <span key={s} className="bg-white/15 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-12" style={{ background: '#f0f6ff' }}>

        {/* Mobile logo */}
        <div className="lg:hidden flex flex-col items-center mb-8">
          <div className="relative mb-2">
            <div className="absolute inset-0 bg-primary-400/30 blur-xl rounded-full scale-150" />
            <img src={logo} alt="Spott" className="relative h-14 w-auto object-contain z-10" />
          </div>
          <span className="font-display font-bold text-2xl text-gradient tracking-tight">Spott</span>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mb-1 tracking-tight">
            Welcome back 👋
          </h2>
          <p className="text-slate-500 text-sm mb-7">Log in to continue exploring.</p>

          <div className="bg-white rounded-3xl shadow-card border border-slate-200/70 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" /> {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-11 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 transition"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full gradient-brand text-white font-bold py-3 rounded-2xl shadow-glow-sm hover:shadow-glow transition-all duration-200 btn-press disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log in →'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">New to Spott?</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <Link
              to="/register"
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 btn-press"
            >
              Create account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            © {new Date().getFullYear()} <span className="font-semibold">Ayush Thakur</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
