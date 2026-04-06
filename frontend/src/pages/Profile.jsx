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

      {/* ── Tactical Profile Card ── */}
      <div className="glass-panel ghost-border rounded-[2.5rem] overflow-hidden mb-10 shadow-2xl relative group/card transition-all duration-500 hover:shadow-[var(--color-primary)]/5">
        
        {/* Technical Cover with Grid + Data Pattern */}
        <div className="h-36 sm:h-48 gradient-primary relative overflow-hidden">
          {/* Scientific Grid Pattern */}
          <div className="absolute inset-0 opacity-10" 
            style={{ backgroundImage: 'linear-gradient(var(--color-on-surface) 1px, transparent 1px), linear-gradient(90deg, var(--color-on-surface) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          {/* Tactical Scans / Circles */}
          <div className="absolute -right-20 -top-20 w-64 h-64 border-[0.5px] border-[var(--color-on-surface)]/20 rounded-full animate-spin-slow opacity-30" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 border-[0.5px] border-[var(--color-on-surface)]/10 rounded-full" />
          
          {/* Scanning Line Animation */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-primary)]/10 to-transparent h-24 -top-24 animate-scan-slow pointer-events-none" />
        </div>

        <div className="px-6 sm:px-10 pb-10">
          {/* Avatar and Identity Header */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16 sm:-mt-20 mb-8 relative z-10">
            {/* Portrait Frame */}
            <div className="relative group/avatar">
              <div className="absolute inset-x-0 bottom-0 h-1/2 gradient-primary rounded-3xl blur-xl opacity-40 transition-opacity duration-300 group-hover/avatar:opacity-70" />
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 p-1.5 bg-[var(--color-surface-container-low)] ghost-border rounded-[2rem] shadow-2xl transition-transform duration-300 group-hover/avatar:scale-[1.02]">
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-full h-full rounded-[1.7rem] object-cover bg-[var(--color-surface-container-highest)]"
                />
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => setEditingAvatar(true)}
                  className="absolute bottom-3 right-3 p-3 bg-[var(--color-primary)] text-[var(--color-surface)] rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 z-20 cursor-pointer"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Name/Identity Callout */}
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-black tracking-[0.2em] text-[var(--color-primary)] uppercase opacity-70">AGENT IDENTIFIED</span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--color-primary)]/30 to-transparent" />
              </div>
              <h1 className="font-display font-black text-3xl sm:text-5xl text-[var(--color-on-surface)] tracking-tighter mb-1 uppercase drop-shadow-sm">{user.name}</h1>
              <p className="font-mono text-xs sm:text-sm text-[var(--color-on-surface-variant)] tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-pulse" />
                {user.email.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Unified Intel & Trust Readout */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 mb-8">
            <div className="flex-1 bg-[var(--color-surface-container-highest)]/50 ghost-border rounded-2xl p-4 sm:p-5 flex flex-col items-center sm:items-start transition-colors hover:bg-[var(--color-surface-container-highest)]">
              <span className="text-[9px] font-bold text-[var(--color-on-surface-variant)] tracking-[0.2em] uppercase mb-2">INTEL LOGGED</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-black text-2xl sm:text-3xl text-[var(--color-on-surface)]">{posts.length}</span>
                <span className="text-[10px] font-bold opacity-40">SIGNALS</span>
              </div>
            </div>
            
            <div className="flex-1 bg-[var(--color-primary)]/[0.03] border border-[var(--color-primary)]/20 rounded-2xl p-4 sm:p-5 flex flex-col items-center sm:items-start transition-colors hover:bg-[var(--color-primary)]/[0.07]">
              <span className="text-[9px] font-bold text-[var(--color-primary)] tracking-[0.2em] uppercase mb-2">RELIABILITY INDEX</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-black text-2xl sm:text-3xl text-[var(--color-primary)]">{trustScore}</span>
                <div className="flex gap-0.5 items-center">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-1 h-3 rounded-full ${i < Math.min(5, Math.ceil(trustScore/10)) ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-primary)]/20'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Badges and Certification chips */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`flex items-center gap-2 border-[0.5px] rounded-full px-4 py-2 text-[11px] font-black tracking-widest uppercase shadow-sm ${badge.bg}`}>
              <Check className="w-3.5 h-3.5" />
              {badge.label}
            </div>
            <div className="flex items-center gap-2 border-[0.5px] border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/5 text-[var(--color-secondary)] rounded-full px-4 py-2 text-[11px] font-black tracking-widest uppercase shadow-sm">
              <Star className="w-3.5 h-3.5 fill-[var(--color-secondary)]" />
              SCOUT RANK {Math.floor(trustScore / 10) || 1}
            </div>
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
