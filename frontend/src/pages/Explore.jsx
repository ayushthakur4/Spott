import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import { Compass, Flame, Leaf, Coffee, MapPin, Heart, Shuffle, Loader2 } from 'lucide-react';
import api from '../services/api';

const categories = [
  { id: 'all',       name: 'All',        icon: '🔥', match: '' },
  { id: 'viewpoint', name: 'Viewpoints', icon: '🌄', match: 'Viewpoint' },
  { id: 'picnic',    name: 'Picnic',     icon: '🌿', match: 'Picnic' },
  { id: 'couple',    name: 'Couple',     icon: '💕', match: 'Couple Safe' },
  { id: 'cafe',      name: 'Cafés',      icon: '☕', match: 'Cafe' },
  { id: 'random',    name: 'Random',     icon: '🎲', match: 'Random' },
];

const Explore = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/posts');
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = activeTab === 'all'
    ? posts
    : posts.filter(p => p.type === categories.find(c => c.id === activeTab)?.match);

  return (
    <div className="flex h-full animate-fade-in">
      <div className="flex-1 max-w-3xl w-full px-3 sm:px-5 lg:px-7 py-5 overflow-y-auto no-scrollbar">

        {/* Hero Banner */}
        <div className="relative gradient-brand rounded-3xl p-5 sm:p-7 text-white mb-6 overflow-hidden shadow-glow-sm">
          {/* Decorative orbs */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-6 left-12 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10">
            <span className="chip bg-white/20 text-white mb-3">✦ Discover</span>
            <h1 className="font-display font-bold text-2xl sm:text-3xl mb-1.5 tracking-tight">
              Explore your city 🧭
            </h1>
            <p className="text-primary-100/90 text-sm sm:text-base max-w-md leading-relaxed">
              Hangout spots, viewpoints, cafés & more — curated by the community, for you.
            </p>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 mb-4 -mx-1 px-1 snap-x">
          {categories.map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-xl font-bold text-sm snap-start shrink-0 btn-press transition-all duration-200 ${
                  isActive
                    ? 'gradient-brand text-white shadow-glow-sm scale-[1.03]'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 shadow-card'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Post count */}
        {!loading && (
          <p className="text-xs font-semibold text-slate-400 mb-4 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full gradient-brand inline-block" />
            {filteredPosts.length} {filteredPosts.length === 1 ? 'spot' : 'spots'} found
          </p>
        )}

        {/* Posts / loading / empty */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-5xl mb-4">{categories.find(c => c.id === activeTab)?.icon || '🗺'}</div>
            <p className="font-display font-bold text-lg text-slate-700 mb-1">No spots yet</p>
            <p className="text-sm text-slate-400">
              Be the first to share a {activeTab !== 'all' ? categories.find(c => c.id === activeTab)?.name?.toLowerCase() : 'spot'}!
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {filteredPosts.map((post, i) => (
              <div key={post._id} className="animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                <PostCard
                  post={post}
                  onVote={(u) => setPosts(posts.map(p => p._id === u._id ? { ...p, upvotes: u.upvotes, downvotes: u.downvotes } : p))}
                  onComment={(id, c) => setPosts(posts.map(p => p._id === id ? { ...p, comments: c } : p))}
                  onDelete={(id) => setPosts(posts.filter(p => p._id !== id))}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
