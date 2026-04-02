import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { Loader2 } from 'lucide-react';
import api from '../services/api';
import AuthContext from '../context/AuthContext';

const categories = [
  { id: 'all',       name: 'All',        icon: '📡', match: '' },
  { id: 'hazard',    name: 'Hazards',    icon: '⚠️', match: 'Accident' },
  { id: 'police',    name: 'Police',     icon: '🚨', match: 'Police Alert' },
  { id: 'viewpoint', name: 'Viewpoints', icon: '🌄', match: 'Viewpoint' },
  { id: 'picnic',    name: 'Picnic',     icon: '🌿', match: 'Picnic' },
  { id: 'couple',    name: 'Couple',     icon: '💕', match: 'Couple Safe' },
  { id: 'cafe',      name: 'Cafés',      icon: '☕', match: 'Cafe' },
  { id: 'chill',     name: 'Chill',      icon: '🧊', matchGroup: ['Viewpoint', 'Picnic', 'Couple Safe', 'Cafe'] },
  { id: 'random',    name: 'Random',     icon: '🎲', match: 'Random' },
];

// Map sidebar query filter values to tab IDs
const filterToTabMap = {
  'hazard': 'hazard',
  'police': 'police',
  'chill': 'chill',
};

const Explore = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');

  const [activeTab, setActiveTab] = useState(() => {
    if (filterParam && filterToTabMap[filterParam]) {
      return filterToTabMap[filterParam];
    }
    return 'all';
  });
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);

  // Sync tab when URL filter changes
  useEffect(() => {
    if (filterParam && filterToTabMap[filterParam]) {
      setActiveTab(filterToTabMap[filterParam]);
    }
  }, [filterParam]);

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

  const activeCat = categories.find(c => c.id === activeTab);
  const filteredPosts = activeTab === 'all'
    ? posts
    : activeCat?.matchGroup
      ? posts.filter(p => activeCat.matchGroup.includes(p.type))
      : posts.filter(p => p.type === activeCat?.match);

  return (
    <main className={`${user ? 'lg:ml-64' : ''} h-screen pt-20 pb-20 md:pb-0 relative overflow-hidden flex animate-fade-in bg-[var(--color-background)]`}>
      <div className="flex-1 max-w-3xl w-full px-3 sm:px-5 lg:px-7 py-5 overflow-y-auto no-scrollbar">

        {/* Hero Banner */}
        <div className="relative gradient-primary ghost-border rounded-3xl p-6 sm:p-8 text-[var(--color-on-surface)] mb-8 overflow-hidden glow-primary">
          {/* Decorative orbs */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[var(--color-on-surface)]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-6 left-12 w-24 h-24 bg-[var(--color-on-surface)]/10 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10">
            <span className="chip bg-[var(--color-on-surface)]/20 text-[var(--color-on-surface)] mb-4 label-text">✦ DISCOVER SECTOR</span>
            <h1 className="font-display font-black text-3xl sm:text-4xl mb-2 tracking-tight">
              SCAN GRID 🧭
            </h1>
            <p className="text-[var(--color-on-surface)]/80 text-sm sm:text-base max-w-md leading-relaxed font-medium">
              Hangout spots, viewpoints, cafés & more — triangulated by the community.
            </p>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 mb-5 -mx-1 px-1 snap-x">
          {categories.map((cat) => {
            const isActiveCat = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 whitespace-nowrap px-5 py-2.5 rounded-3xl font-bold text-xs tracking-wide label-text snap-start shrink-0 btn-press transition-all duration-200 ghost-border ${
                  isActiveCat
                    ? 'gradient-primary text-[var(--color-on-surface)] glow-primary scale-[1.03]'
                    : 'bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary)]/50 hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)]'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Post count */}
        {!loading && (
          <p className="label-text text-[10px] font-bold text-[var(--color-on-surface-variant)] mb-5 flex items-center gap-2 opacity-80">
            <span className="w-1.5 h-1.5 rounded-full gradient-primary inline-block" />
            {filteredPosts.length} {filteredPosts.length === 1 ? 'SIGNAL_FOUND' : 'SIGNALS_FOUND'}
          </p>
        )}

        {/* Posts / loading / empty */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-24 animate-fade-in glass-panel ghost-border rounded-3xl">
            <div className="text-5xl mb-5 opacity-80">{activeCat?.icon || '🗺'}</div>
            <p className="font-display font-black text-xl text-[var(--color-on-surface)] mb-2 tracking-wide uppercase">NO SIGNALS MATCHING</p>
            <p className="text-sm text-[var(--color-on-surface-variant)] font-medium">
              Adjust filters or transmit a new {activeTab !== 'all' ? activeCat?.name?.toUpperCase() : 'SIGNAL'}.
            </p>
          </div>
        ) : (
          <div className="space-y-6 pb-6 mt-2">
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
    </main>
  );
};

export default Explore;
