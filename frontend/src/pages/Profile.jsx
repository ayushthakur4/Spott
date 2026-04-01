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
  if (score >= 50) return { label: '🏆 Legend Scout',   bg: 'bg-amber-50  text-amber-600  border-amber-200'  };
  if (score >= 20) return { label: '✅ Verified Guide', bg: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
  if (score >= 5)  return { label: '📍 Local Spotter',  bg: 'bg-primary-50 text-primary-600 border-primary-200' };
  return               { label: '🌱 New Member',        bg: 'bg-slate-50   text-slate-600   border-slate-200'  };
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

  const isOwnProfile = currentUser?._id === id;

  useEffect(() => { fetchProfile(); }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users/profile/${id}`);
      setProfileData(data);
      setPosts(data.posts);
    } catch { setError('Could not load profile.'); }
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
    } catch { showAlert('Failed to update avatar', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center flex-col gap-3">
      <Loader2 className="w-9 h-9 animate-spin text-primary-400" />
      <p className="text-sm text-slate-400 font-medium">Loading profile…</p>
    </div>
  );
  if (error) return (
    <div className="flex h-full items-center justify-center text-red-500 font-medium">{error}</div>
  );

  const { user, trustScore } = profileData;
  const badge = getBadge(trustScore);

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-5 py-6 sm:py-8 animate-fade-in">
      <AlertContainer />

      {/* ── Profile Card ── */}
      <div className="bg-white rounded-3xl shadow-card border border-slate-200/70 overflow-hidden mb-6">

        {/* Cover with gradient + pattern */}
        <div className="h-28 sm:h-36 gradient-brand relative overflow-hidden">
          <div className="absolute inset-0 opacity-30"
            style={{ backgroundImage: 'radial-gradient(circle at 15% 55%, rgba(255,255,255,.35) 0%, transparent 55%), radial-gradient(circle at 85% 15%, rgba(255,255,255,.2) 0%, transparent 45%)' }} />
          {/* Decorative rings */}
          <div className="absolute -right-10 -top-10 w-40 h-40 border-2 border-white/20 rounded-full" />
          <div className="absolute -right-4 -top-4 w-24 h-24 border border-white/15 rounded-full" />
        </div>

        <div className="px-5 sm:px-7 pb-6">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-12 sm:-mt-14 mb-5">
            <div className="relative group">
              <div className="absolute inset-0 gradient-brand rounded-2xl blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300 scale-110" />
              <img
                src={user.profileImage}
                alt={user.name}
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white shadow-card object-cover bg-slate-100 z-10"
              />
              {isOwnProfile && (
                <button
                  onClick={() => setEditingAvatar(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 z-20"
                >
                  <Pencil className="w-5 h-5 text-white" />
                </button>
              )}
            </div>

            {/* Stats row */}
            <div className="flex gap-3 items-end pb-1">
              <div className="text-center">
                <p className="font-display font-bold text-lg text-slate-900 leading-none">{posts.length}</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Spots</p>
              </div>
              <div className="text-center">
                <p className="font-display font-bold text-lg text-primary-600 leading-none">{trustScore}</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Trust</p>
              </div>
            </div>
          </div>

          {/* Name & badges */}
          <h1 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight mb-0.5">{user.name}</h1>
          <p className="text-sm text-slate-400 mb-3">{user.email}</p>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`chip border ${badge.bg}`}>{badge.label}</span>
            <span className="chip border bg-violet-50 text-violet-600 border-violet-200">
              <Star className="w-3 h-3" /> Trust {trustScore}
            </span>
          </div>

          {/* Avatar picker */}
          {editingAvatar && (
            <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-pop-in">
              <p className="text-sm font-bold text-slate-700 mb-3">Choose your avatar:</p>
              <div className="flex gap-3 mb-4 flex-wrap">
                {AVATAR_OPTIONS.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedAvatar(url)}
                    className={`w-16 h-16 rounded-2xl border-2 overflow-hidden transition-all duration-200 btn-press ${
                      selectedAvatar === url
                        ? 'border-primary-500 scale-110 shadow-glow-sm'
                        : 'border-slate-200 hover:border-primary-300 hover:scale-105'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover bg-slate-100" />
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveAvatar}
                  disabled={!selectedAvatar || saving}
                  className="flex items-center gap-1.5 gradient-brand text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 transition-all duration-200 btn-press"
                >
                  <Check className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditingAvatar(false); setSelectedAvatar(null); }}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 btn-press"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Posts section ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-500" />
          Posts by {user.name.split(' ')[0]}
        </h2>
        <span className="chip bg-primary-50 text-primary-600 border border-primary-100">
          {posts.length} total
        </span>
      </div>

      <div className="space-y-4 pb-20">
        {posts.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-5xl mb-4">📭</div>
            <p className="font-display font-bold text-slate-700">No posts yet</p>
            {isOwnProfile && <p className="text-sm text-slate-400 mt-1">Share your first spot!</p>}
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
  );
};

export default Profile;
