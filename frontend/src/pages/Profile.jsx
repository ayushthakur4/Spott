import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, MapPin, Star, Pencil, Check, X } from 'lucide-react';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { useAlert } from '../components/CustomAlert';

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Spott1&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Spott2&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Spott3&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Spott4&backgroundColor=d1f4d1',
];

const getBadge = (score) => {
  if (score >= 50) return { label: '🏆 LEGEND SCOUT',   bg: 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border-[var(--color-secondary)]/20 shadow-[0_0_10px_rgba(254,148,0,0.1)]'  };
  if (score >= 20) return { label: '✅ VERIFIED GUIDE', bg: 'bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)] border-[var(--color-tertiary)]/20 shadow-[0_0_10px_rgba(184,255,185,0.1)]' };
  if (score >= 5)  return { label: '📍 LOCAL SPOTTER',  bg: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20 shadow-[0_0_10px_rgba(122,175,255,0.1)]' };
  return               { label: '🌱 NEW SIGNAL',        bg: 'bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]'  };
};

const Profile = () => {
  const { showAlert, AlertContainer } = useAlert();
  const { id } = useParams();
  const { user: currentUser } = useContext(AuthContext);

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [saving, setSaving] = useState(false);

  const targetId = id || currentUser?._id;
  const isOwnProfile = currentUser?._id === targetId;

  useEffect(() => {
    if (targetId) fetchProfile();
    else if (currentUser === null) {
      setError('Agent identity required. Please authenticate.');
      setLoading(false);
    }
  }, [targetId, currentUser]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users/profile/${targetId}`);
      setProfileData(data);
      setPosts(data.posts);
    } catch { setError('Could not load profile or signals.'); }
    finally { setLoading(false); }
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) return;
    setSaving(true);
    try {
      const res = await api.put('/users/profile', { profileImage: selectedAvatar });
      const updatedUser = { ...currentUser, profileImage: res.data.profileImage };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('storage'));
      setProfileData(prev => ({ ...prev, user: { ...prev.user, profileImage: res.data.profileImage } }));
      setEditingAvatar(false);
      setSelectedAvatar(null);
    } catch { showAlert('Failed to update avatar avatar', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center flex-col gap-5 bg-[var(--color-background)]">
      <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)] drop-shadow-[0_0_15px_rgba(122,175,255,0.5)]" />
      <p className="label-text text-sm text-[var(--color-on-surface-variant)] animate-pulse">Scanning identity grid…</p>
    </div>
  );
  if (error) return (
    <div className="flex h-full items-center justify-center text-[var(--color-error)] font-bold bg-[var(--color-background)]">{error}</div>
  );

  const { user, trustScore } = profileData;
  const badge = getBadge(trustScore);

  return (
    <main className={`${currentUser ? 'lg:ml-64' : ''} min-h-screen-nav pt-[var(--navbar-height)] pb-[var(--bottom-nav-height)] md:pb-0 relative animate-fade-in bg-[var(--color-background)]`}>
      <div className="max-w-2xl mx-auto px-3 sm:px-5 py-6 sm:py-8">
      <AlertContainer />

      {/* ── Profile Card ── */}
      <div className="glass-panel ghost-border rounded-[2rem] overflow-hidden mb-8">

        {/* Cover with gradient + pattern */}
        <div className="h-32 sm:h-40 gradient-primary relative overflow-hidden glow-primary">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 15% 55%, var(--color-on-surface) 0%, transparent 55%), radial-gradient(circle at 85% 15%, var(--color-on-surface) 0%, transparent 45%)' }} />
          {/* Decorative rings */}
          <div className="absolute -right-10 -top-10 w-40 h-40 border-2 border-[var(--color-on-surface)]/10 rounded-full" />
          <div className="absolute -right-4 -top-4 w-24 h-24 border border-[var(--color-on-surface)]/10 rounded-full" />
        </div>

        <div className="px-6 sm:px-8 pb-8">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-14 sm:-mt-16 mb-6">
            <div className="relative group">
              <div className="absolute inset-0 gradient-primary rounded-3xl blur-md opacity-20 group-hover:opacity-60 transition-opacity duration-300 scale-110" />
              <img
                src={user.profileImage}
                alt={user.name}
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-[var(--color-surface-container-low)] shadow-2xl object-cover bg-[var(--color-surface-container-highest)] z-10"
              />
              {isOwnProfile && (
                <button
                  onClick={() => setEditingAvatar(true)}
                  className="absolute inset-0 flex items-center justify-center bg-[var(--color-background)]/60 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 backdrop-blur-sm"
                >
                  <Pencil className="w-6 h-6 text-[var(--color-on-surface)]" />
                </button>
              )}
            </div>

            {/* Stats row */}
            <div className="flex gap-4 items-end pb-2">
              <div className="text-center bg-[var(--color-surface-container-highest)] ghost-border rounded-2xl px-4 py-2">
                <p className="font-display font-black text-xl text-[var(--color-on-surface)] leading-none">{posts.length}</p>
                <p className="label-text text-[10px] text-[var(--color-on-surface-variant)] mt-1">SIGNALS</p>
              </div>
              <div className="text-center bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 shadow-[0_0_15px_rgba(122,175,255,0.05)] rounded-2xl px-4 py-2">
                <p className="font-display font-black text-xl text-[var(--color-primary)] leading-none">{trustScore}</p>
                <p className="label-text text-[10px] text-[var(--color-primary)] mt-1">TRUST</p>
              </div>
            </div>
          </div>

          {/* Name & badges */}
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[var(--color-on-surface)] tracking-tight mb-1 uppercase">{user.name}</h1>
          <p className="text-sm text-[var(--color-on-surface-variant)] mb-5 font-medium">{user.email}</p>

          <div className="flex items-center gap-3 flex-wrap">
            <span className={`chip border label-text px-3 py-1.5 ${badge.bg}`}>{badge.label}</span>
            <span className="chip bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border border-[var(--color-secondary)]/20 label-text px-3 py-1.5 shadow-[0_0_10px_rgba(254,148,0,0.1)]">
              <Star className="w-3.5 h-3.5" /> TRUST {trustScore}
            </span>
          </div>

          {/* Avatar picker */}
          {editingAvatar && (
            <div className="mt-6 p-5 bg-[var(--color-surface-container-low)] ghost-border rounded-[2rem] animate-pop-in">
              <p className="text-sm font-bold text-[var(--color-on-surface)] mb-4 label-text">CONFIGURE IDENTITY (AVATAR):</p>
              <div className="flex gap-4 mb-5 flex-wrap">
                {AVATAR_OPTIONS.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedAvatar(url)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] border-2 overflow-hidden transition-all duration-200 btn-press ${
                      selectedAvatar === url
                        ? 'border-[var(--color-primary)] scale-110 shadow-[0_0_15px_rgba(122,175,255,0.3)]'
                        : 'border-[var(--color-outline-variant)] hover:border-[var(--color-primary)]/50 hover:scale-105'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover bg-[var(--color-surface-container-highest)]" />
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveAvatar}
                  disabled={!selectedAvatar || saving}
                  className="flex items-center flex-1 justify-center gap-2 gradient-primary text-[var(--color-on-surface)] px-5 py-3 rounded-2xl text-sm font-bold disabled:opacity-50 disabled:grayscale transition-all duration-200 btn-press glow-primary label-text"
                >
                  <Check className="w-4 h-4" /> {saving ? 'SAVING…' : 'CONFIRM'}
                </button>
                <button
                  onClick={() => { setEditingAvatar(false); setSelectedAvatar(null); }}
                  className="flex items-center flex-1 justify-center gap-2 bg-[var(--color-surface-container-highest)] hover:bg-[var(--color-outline-variant)] text-[var(--color-on-surface)] px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-200 btn-press ghost-border label-text"
                >
                  <X className="w-4 h-4" /> ABORT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Posts section ── */}
      <div className="flex items-center justify-between mb-5 px-1">
        <h2 className="font-display font-black text-xl text-[var(--color-on-surface)] flex items-center gap-2 uppercase tracking-wide">
          <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
          SIGNALS BY {user.name.split(' ')[0]}
        </h2>
        <span className="chip label-text bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface-variant)] ghost-border px-3 py-1">
          {posts.length} LOGGED
        </span>
      </div>

      <div className="space-y-6 pb-20">
        {posts.length === 0 ? (
          <div className="text-center py-20 animate-fade-in glass-panel ghost-border rounded-[2rem]">
            <div className="text-5xl mb-5 opacity-70">📭</div>
            <p className="font-display font-black text-lg text-[var(--color-on-surface)] tracking-widest uppercase">No Intel Found</p>
            {isOwnProfile && <p className="text-sm text-[var(--color-on-surface-variant)] mt-2 font-medium">Transmit your first spot to the grid!</p>}
          </div>
        ) : (
          posts.map((post, i) => (
            <div key={post._id} className="animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
              <PostCard
                post={post}
                onVote={(u) => setPosts(posts.map(p => p._id === u._id ? { ...p, upvotes: u.upvotes, downvotes: u.downvotes } : p))}
                onComment={(id, c) => setPosts(posts.map(p => p._id === id ? { ...p, comments: c } : p))}
                onDelete={(id) => setPosts(posts.filter(p => p._id !== id))}
              />
            </div>
          ))
        )}
      </div>
      </div>
    </main>
  );
};

export default Profile;
