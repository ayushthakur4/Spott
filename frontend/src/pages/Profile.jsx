import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, MapPin, Star, Pencil, Check, X, ChevronUp } from 'lucide-react';
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
  if (score >= 50) return { label: 'Legend Scout', color: 'text-amber-600 bg-amber-50 border-amber-300' };
  if (score >= 20) return { label: 'Verified Guide', color: 'text-emerald-600 bg-emerald-50 border-emerald-300' };
  if (score >= 5)  return { label: 'Local Spotter', color: 'text-blue-600 bg-blue-50 border-blue-300' };
  return { label: 'New Member', color: 'text-slate-600 bg-slate-50 border-slate-300' };
};

const Profile = () => {
  const { showAlert, AlertContainer } = useAlert();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, login } = useContext(AuthContext);

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);

  // Avatar editing
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [saving, setSaving] = useState(false);

  const isOwnProfile = currentUser && currentUser._id === id;

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users/profile/${id}`);
      setProfileData(data);
      setPosts(data.posts);
    } catch (err) {
      setError('Could not load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) return;
    setSaving(true);
    try {
      const res = await api.put('/users/profile', { profileImage: selectedAvatar });
      // Update global auth context so navbar also refreshes
      const updatedUser = { ...currentUser, profileImage: res.data.profileImage };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Force a re-render by updating state; AuthContext will re-sync on next mount
      window.dispatchEvent(new Event('storage'));
      setProfileData(prev => ({ ...prev, user: { ...prev.user, profileImage: res.data.profileImage } }));
      setEditingAvatar(false);
      setSelectedAvatar(null);
    } catch (err) {
      showAlert('Failed to update avatar', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
    </div>
  );

  if (error) return (
    <div className="flex h-full items-center justify-center text-red-500 font-medium">{error}</div>
  );

  const { user, trustScore } = profileData;
  const badge = getBadge(trustScore);

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-5 sm:py-8">
      <AlertContainer />
      {/* Profile Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        {/* Cover */}
        <div className="h-28 bg-gradient-to-r from-primary-600 via-indigo-500 to-purple-600" />

        <div className="px-6 pb-6">
          {/* Avatar + Actions Row */}
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="relative group">
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-md object-cover bg-slate-100"
              />
              {isOwnProfile && (
                <button
                  onClick={() => setEditingAvatar(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition"
                >
                  <Pencil className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Name & Badges */}
          <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
          <p className="text-sm text-slate-500 mb-3">{user.email}</p>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${badge.color}`}>
              {badge.label}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full border text-violet-700 bg-violet-50 border-violet-300">
              <Star className="w-3 h-3" />
              Trust: {trustScore}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full border text-slate-600 bg-slate-50 border-slate-300">
              <MapPin className="w-3 h-3" />
              {posts.length} Spots
            </span>
          </div>

          {/* Avatar Picker Modal */}
          {editingAvatar && (
            <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <p className="text-sm font-semibold text-slate-700 mb-3">Choose your avatar:</p>
              <div className="flex gap-4 mb-4">
                {AVATAR_OPTIONS.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedAvatar(url)}
                    className={`w-16 h-16 rounded-xl border-2 overflow-hidden transition ${
                      selectedAvatar === url ? 'border-primary-600 scale-110' : 'border-slate-200 hover:border-primary-300'
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
                  className="flex items-center gap-1 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition"
                >
                  <Check className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditingAvatar(false); setSelectedAvatar(null); }}
                  className="flex items-center gap-1 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-200 transition"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Posts Section */}
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary-600" />
        Posts by {user.name}
      </h2>

      <div className="space-y-6 pb-20">
        {posts.length === 0 ? (
          <div className="text-center py-16 text-slate-500 font-medium">
            No posts yet.
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onVote={(updated) => setPosts(posts.map(p => p._id === updated._id ? { ...p, upvotes: updated.upvotes, downvotes: updated.downvotes } : p))}
              onComment={(id, updated) => setPosts(posts.map(p => p._id === id ? { ...p, comments: updated } : p))}
              onDelete={(postId) => setPosts(posts.filter(p => p._id !== postId))}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
