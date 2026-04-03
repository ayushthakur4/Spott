import { useState, useEffect, useContext } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import PostCard from '../components/PostCard';
import MapPreview from '../components/MapPreview';
import CreatePostModal from '../components/CreatePostModal';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = ({ isCreateModalOpen, setIsCreateModalOpen }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  if (loading) return (
    <div className="flex h-full items-center justify-center flex-col gap-5 bg-[var(--color-background)] ml-0 lg:ml-64">
      <div className="relative">
        <div className="w-14 h-14 rounded-[2rem] gradient-primary glow-primary flex items-center justify-center animate-pulse-glow">
          <Sparkles className="w-6 h-6 text-[var(--color-on-surface)]" strokeWidth={2.5} />
        </div>
      </div>
      <p className="label-text text-[11px] text-[var(--color-on-surface-variant)] animate-pulse">Establishing Satellite Uplink...</p>
    </div>
  );

  return (
    <main className={`${user ? 'lg:ml-64' : ''} h-screen-nav mt-[var(--navbar-height)] relative overflow-hidden bg-[#0e0e0e]`}>
      
      {/* Interactive Map Background */}
      <div className="absolute inset-0 z-0 bg-[#0e0e0e]">
        <MapPreview posts={posts} />
        {/* Map Overlay Gradients for Depth */}
        <div className="absolute inset-0 bg-gradient-to-l from-background/90 via-transparent to-transparent opacity-80 pointer-events-none z-10 hidden md:block"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/30 pointer-events-none z-10"></div>
      </div>

      {/* Right Side Panel: Nearby Alerts */}
      <div className="absolute right-0 md:right-6 top-6 bottom-[calc(var(--bottom-nav-height)+1rem)] md:bottom-6 w-full md:w-[420px] z-20 flex flex-col gap-6 px-4 md:px-0 pointer-events-none">
        
        <div className="bg-[var(--color-surface-container-low)]/80 backdrop-blur-xl rounded-xl p-4 md:p-6 specular-edge shadow-2xl border border-white/5 h-full flex flex-col pointer-events-auto">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Nearby Alerts</h3>
            <span className="bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-[10px] px-2 py-0.5 rounded-full font-bold">LIVE</span>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1 pb-20">
            {posts.map((post, i) => (
              <div key={post._id} className="animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                <PostCard
                  post={post}
                  onVote={handleVoteUpdate}
                  onComment={handleCommentUpdate}
                  onDelete={handleDeletePost}
                  compact={true}
                />
              </div>
            ))}
            {posts.length === 0 && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-[var(--color-on-surface-variant)] text-4xl mb-2 opacity-50">satellite_alt</span>
                <p className="text-sm text-[var(--color-on-surface-variant)]">No signals detected in this sector.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action FAB - Contextual for Map (Desktop) */}
      <div className="absolute right-6 bottom-6 z-30 hidden md:flex">
        <button 
          onClick={() => user ? setIsCreateModalOpen(true) : navigate('/login')}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-[var(--color-on-primary-container)] shadow-[0_10px_40px_rgba(122,175,255,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group"
        >
          <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform duration-300" data-icon="add">add</span>
        </button>
      </div>

      {/* Map Legend Floating Pill */}
      <div className="absolute bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-20 bg-[var(--color-surface-container-low)]/60 backdrop-blur-md px-4 md:px-6 py-3 rounded-full border border-white/5 flex flex-wrap justify-center items-center gap-3 md:gap-6 shadow-xl w-[90%] md:w-auto">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-2 h-2 bg-[var(--color-error)] rounded-full glow-secondary"></div>
          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Enforcement</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-2 h-2 bg-[var(--color-secondary)] rounded-full glow-secondary"></div>
          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Hazard</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-2 h-2 bg-[var(--color-tertiary)] rounded-full"></div>
          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Chill</span>
        </div>
      </div>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={(newPost) => setPosts([newPost, ...posts])}
      />
    </main>
  );
};

export default Home;
