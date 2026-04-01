import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import { Compass, Flame, Leaf, Coffee, MapPin, Heart, Shuffle } from 'lucide-react';
import api from '../services/api';

const categories = [
  { id: 'all',       name: 'All',        icon: Flame,    match: '' },
  { id: 'viewpoint', name: 'Viewpoints', icon: Compass,  match: 'Viewpoint' },
  { id: 'picnic',    name: 'Picnic',     icon: Leaf,     match: 'Picnic' },
  { id: 'couple',    name: 'Couple',     icon: Heart,    match: 'Couple Safe' },
  { id: 'cafe',      name: 'Cafes',      icon: Coffee,   match: 'Cafe' },
  { id: 'random',    name: 'Random',     icon: Shuffle,  match: 'Random' },
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
    : posts.filter(post => post.type === categories.find(c => c.id === activeTab)?.match);

  return (
    <div className="flex h-full">
      <div className="flex-1 max-w-3xl w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-6 overflow-y-auto no-scrollbar">

        {/* Category Pills — horizontally scrollable on mobile */}
        <div className="mb-5 flex overflow-x-auto no-scrollbar pb-1 gap-2 snap-x -mx-1 px-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 sm:px-4 py-2 rounded-xl transition font-semibold text-sm snap-start shrink-0 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white mb-6 sm:mb-8 shadow-md">
          <h2 className="text-xl sm:text-2xl font-bold mb-1">Discover New Places</h2>
          <p className="text-primary-100 font-medium opacity-90 text-sm sm:text-base">
            Find the best hangout spots around you recommended by the community.
          </p>
        </div>

        {/* Post List */}
        <div className="space-y-4 sm:space-y-6 pb-4">
          {filteredPosts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onVote={(updated) => setPosts(posts.map(p => p._id === updated._id ? { ...p, upvotes: updated.upvotes, downvotes: updated.downvotes } : p))}
              onComment={(id, updated) => setPosts(posts.map(p => p._id === id ? { ...p, comments: updated } : p))}
              onDelete={(postId) => setPosts(posts.filter(p => p._id !== postId))}
            />
          ))}
          {!loading && filteredPosts.length === 0 && (
            <div className="text-center py-10">
              <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No places found</h3>
              <p className="text-slate-500 font-medium text-sm">
                Be the first to share a {activeTab !== 'all' ? categories.find(c => c.id === activeTab)?.name : 'spot'}!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
