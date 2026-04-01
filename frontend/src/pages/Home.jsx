import { useState, useEffect, useContext } from 'react';
import { PenSquare, AlertTriangle, Loader2, Map, List, Sparkles } from 'lucide-react';
import PostCard from '../components/PostCard';
import MapPreview from '../components/MapPreview';
import CreatePostModal from '../components/CreatePostModal';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileView, setMobileView] = useState('feed');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchPosts(pos.coords.latitude, pos.coords.longitude),
        () => fetchPosts()
      );
    } else {
      fetchPosts();
    }
  }, []);

  const fetchPosts = async (lat, lng) => {
    try {
      const params = lat && lng ? `?lat=${lat}&lng=${lng}` : '';
      const { data } = await api.get(`/posts${params}`);
      setPosts(data);
    } catch {
      setError('Failed to load feed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteUpdate    = (u) => setPosts(p => p.map(x => x._id === u._id ? { ...x, upvotes: u.upvotes, downvotes: u.downvotes } : x));
  const handleCommentUpdate = (id, c) => setPosts(p => p.map(x => x._id === id ? { ...x, comments: c } : x));
  const handleDeletePost    = (id) => setPosts(p => p.filter(x => x._id !== id));
  const handleCreatePrompt  = () => user ? setIsModalOpen(true) : navigate('/login');

  if (loading) return (
    <div className="flex h-full items-center justify-center flex-col gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center animate-pulse-glow">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-sm text-slate-500 font-medium">Loading your feed…</p>
    </div>
  );

  return (
    <div className="flex h-full animate-fade-in">

      {/* ── Feed Column ── */}
      <div className={`flex-1 w-full max-w-2xl px-3 sm:px-5 lg:px-7 py-5 overflow-y-auto no-scrollbar ${
        mobileView === 'map' ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'
      }`}>

        {/* Page header */}
        <div className="mb-5">
          <h1 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
            Your Feed <span className="text-gradient">✦</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Latest alerts &amp; spots near you</p>
        </div>

        {/* Create post card */}
        <div
          onClick={handleCreatePrompt}
          className="bg-white border border-slate-200/80 rounded-2xl shadow-card p-3 sm:p-4 flex items-center gap-3 cursor-pointer hover:shadow-card-hover hover:border-primary-200 transition-all duration-300 group mb-5"
        >
          <div className="relative shrink-0">
            <img
              src={user?.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
              alt="You"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-200 group-hover:ring-primary-400 transition-all"
            />
          </div>
          <div className="flex-1 bg-slate-100/80 rounded-xl px-4 py-2.5 text-slate-400 text-sm font-medium group-hover:bg-primary-50/80 group-hover:text-primary-400 transition-all duration-200">
            What's happening near you? 📍
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleCreatePrompt(); }}
            className="gradient-brand text-white rounded-xl px-3 sm:px-4 py-2 font-bold text-sm flex items-center gap-1.5 shadow-glow-sm hover:shadow-glow transition-all duration-200 btn-press shrink-0"
          >
            <PenSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Post</span>
          </button>
        </div>

        {/* Mobile Feed/Map toggle */}
        <div className="flex lg:hidden mb-5 bg-white border border-slate-200/80 rounded-2xl p-1 gap-1 shadow-card">
          {[
            { id: 'feed', label: 'Feed', icon: List },
            { id: 'map',  label: 'Map',  icon: Map  },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMobileView(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                mobileView === id
                  ? 'gradient-brand text-white shadow-glow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-3.5 rounded-2xl mb-5 flex items-center gap-3 font-medium text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Posts */}
        <div className="space-y-4 pb-4">
          {posts.map((post, i) => (
            <div
              key={post._id}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <PostCard
                post={post}
                onVote={handleVoteUpdate}
                onComment={handleCommentUpdate}
                onDelete={handleDeletePost}
              />
            </div>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-24 animate-fade-in">
              <div className="text-5xl mb-4">📍</div>
              <p className="font-display font-bold text-lg text-slate-700">Nothing here yet</p>
              <p className="text-sm text-slate-400 mt-1">Be the first to drop a spot in your area!</p>
              <button
                onClick={handleCreatePrompt}
                className="mt-5 gradient-brand text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-glow-sm btn-press inline-block"
              >
                Create the first post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Map Column ── */}
      <div className={`${mobileView === 'map' ? 'flex flex-col flex-1' : 'hidden'} lg:flex lg:flex-col lg:w-96 xl:w-[430px] p-3 sm:p-5`}>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 hidden lg:block">
          🗺 Live Map
        </p>
        <div className="flex-1 rounded-3xl overflow-hidden border border-slate-200/80 shadow-card min-h-[300px] lg:min-h-0 lg:h-[calc(100vh-8rem)]">
          <MapPreview posts={posts} />
        </div>
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={(newPost) => setPosts([newPost, ...posts])}
      />
    </div>
  );
};

export default Home;
