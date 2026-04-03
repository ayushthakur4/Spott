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
    <main className="pt-[var(--navbar-height)] pb-[var(--bottom-nav-height)] lg:pb-0 min-h-screen-nav flex flex-col lg:flex-row animate-fade-in bg-[var(--color-background)] relative">

      {/* ── Left decorative panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] gradient-primary ghost-border relative overflow-hidden flex-col items-center justify-center p-12 text-[var(--color-on-surface)]">
        {/* Decorative orbs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-[var(--color-on-surface)]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -right-12 w-64 h-64 bg-[var(--color-primary)]/30 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--color-primary)]/10 rounded-full blur-3xl glow-primary" />

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo with glow */}
          <div className="relative flex justify-center mb-6">
            <div className="absolute inset-0 bg-[var(--color-on-surface)]/10 blur-2xl rounded-full scale-150" />
            <img src={logo} alt="Spott" className="relative h-20 w-auto object-contain drop-shadow-xl z-10 invert brightness-200 sepia-[1] hue-rotate-180 saturate-[3] drop-shadow-[0_0_10px_rgba(122,175,255,0.8)]" />
          </div>

          <h1 className="font-display font-black text-4xl xl:text-5xl mb-4 tracking-tight leading-tight uppercase">
            REAL-TIME ALERTS,<br />REAL PLACES. 📍
          </h1>
          <p className="text-[var(--color-on-surface)]/80 text-base leading-relaxed font-medium">
            Join the community triangulation net. Report hazards, sync with local spots.
          </p>

          {/* Floating stat chips */}
          <div className="flex justify-center gap-3 mt-8 flex-wrap">
            {['🚨 SECTOR ALERTS', '☕ OUTPOSTS', '🌄 VANTAGE POINTS', '💕 SAFE ZONES'].map(s => (
              <span key={s} className="bg-[var(--color-surface-container-low)]/50 backdrop-blur-md text-[var(--color-on-surface)] label-text px-4 py-2 rounded-2xl border border-[var(--color-outline-variant)]">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-12 bg-[var(--color-background)] relative">
        <div className="absolute inset-0 bg-[var(--color-surface-container-low)] pointer-events-none rounded-l-[3rem] shadow-[inset_10px_0_20px_rgba(0,0,0,0.5)] hidden lg:block" />

        {/* Mobile logo */}
        <div className="lg:hidden flex flex-col items-center mb-8 relative z-10">
          <div className="relative mb-2">
            <div className="absolute inset-0 gradient-primary opacity-30 blur-xl rounded-full scale-150 glow-primary" />
            <img src={logo} alt="Spott" className="relative h-16 w-auto object-contain z-10 invert brightness-200 sepia-[1] hue-rotate-180 saturate-[3] drop-shadow-[0_0_10px_rgba(122,175,255,0.8)]" />
          </div>
          <span className="font-display font-black text-2xl text-[var(--color-primary)] tracking-widest uppercase mt-2">SYS.LOGIN</span>
        </div>

        <div className="w-full max-w-sm relative z-10">
          <div className="hidden lg:block">
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[var(--color-on-surface)] mb-1 tracking-tight uppercase">
              AUTHENTICATE 👋
            </h2>
            <p className="text-[var(--color-on-surface-variant)] text-sm mb-7 font-medium">Initialize connection to grid.</p>
          </div>

          <div className="glass-panel ghost-border rounded-3xl p-6 sm:p-8 relative">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-3 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] px-4 py-3 rounded-2xl text-sm font-bold animate-alert-pulse">
                  <span className="w-2 h-2 bg-[var(--color-error)] rounded-full shrink-0" /> {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[var(--color-on-surface-variant)] label-text mb-2 opacity-80">AGENT IDENTIFIER (EMAIL)</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-5 py-3 bg-[var(--color-surface-container-highest)] ghost-border rounded-2xl text-sm font-medium placeholder:text-[var(--color-on-surface-variant)]/40 text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
                  placeholder="agent@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-on-surface-variant)] label-text mb-2 opacity-80">ACCESS SUBROUTINE (PASSWORD)</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-5 py-3 pr-12 bg-[var(--color-surface-container-highest)] ghost-border rounded-2xl text-sm font-medium placeholder:text-[var(--color-on-surface-variant)]/40 text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] p-2 transition-colors btn-press"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full gradient-primary text-[var(--color-on-surface)] font-bold py-3.5 rounded-2xl glow-primary hover:shadow-[0_0_20px_rgba(122,175,255,0.4)] transition-all duration-300 btn-press disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 text-sm tracking-wide"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'INITIATE CONNECTION →'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[var(--color-outline-variant)]" />
              <span className="text-xs text-[var(--color-on-surface-variant)] font-bold label-text opacity-60">NO CREDENTIALS?</span>
              <div className="flex-1 h-px bg-[var(--color-outline-variant)]" />
            </div>

            <Link
              to="/register"
              className="w-full flex items-center justify-center gap-2 py-3 border border-[var(--color-outline-variant)] rounded-2xl text-sm font-bold text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface-container-highest)] hover:text-[var(--color-on-surface)] transition-all duration-200 btn-press uppercase tracking-wide"
            >
              Mint New Identity <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-center text-[10px] text-[var(--color-on-surface-variant)] mt-8 label-text opacity-50 uppercase tracking-widest">
            © {new Date().getFullYear()} Ayush Thakur · SECURE COMMS
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
