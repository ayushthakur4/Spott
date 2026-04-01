import { useState, useEffect, useContext } from 'react';
import { PenSquare, AlertTriangle, Loader2, Map, List } from 'lucide-react';
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
  const [mobileView, setMobileView] = useState('feed'); // 'feed' | 'map'
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
    } catch (err) {
      setError('Failed to load feed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteUpdate     = (updatedPost) => setPosts(p => p.map(post => post._id === updatedPost._id ? { ...post, upvotes: updatedPost.upvotes, downvotes: updatedPost.downvotes } : post));
  const handleCommentUpdate  = (postId, updatedComments) => setPosts(p => p.map(post => post._id === postId ? { ...post, comments: updatedComments } : post));
  const handleDeletePost     = (postId) => setPosts(p => p.filter(post => post._id !== postId));

  const handleCreatePrompt = () => user ? setIsModalOpen(true) : navigate('/login');

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
    </div>
  );

  return (
    <div className="flex h-full">

      {/* ── Feed Column ── */}
      <div className={`flex-1 max-w-2xl w-full px-3 sm:px-4 md:px-8 py-4 sm:py-6 overflow-y-auto no-scrollbar ${mobileView === 'map' ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'}`}>

        {/* Create-post prompt */}
        <div className="flex items-center gap-2 sm:gap-4 mb-5">
          <div
            className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm px-3 sm:px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-primary-300 transition"
            onClick={handleCreatePrompt}
          >
            <img
              src={user ? user.profileImage : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
              alt="Profile"
              className="w-8 h-8 rounded-full bg-slate-100 shrink-0"
            />
            <span className="text-slate-400 font-medium text-sm sm:text-base">Share an alert or new place…</span>
          </div>
          <button
            onClick={handleCreatePrompt}
            className="bg-primary-600 hover:bg-primary-700 text-white rounded-2xl p-3 sm:px-5 sm:py-3 shadow-sm transition flex items-center gap-2 font-semibold shrink-0"
          >
            <PenSquare className="w-5 h-5" />
            <span className="hidden sm:block">Post</span>
          </button>
        </div>

        {/* Mobile: Feed / Map toggle */}
        <div className="flex lg:hidden mb-4 bg-slate-100 rounded-2xl p-1 gap-1">
          <button
            onClick={() => setMobileView('feed')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition ${mobileView === 'feed' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'}`}
          >
            <List className="w-4 h-4" /> Feed
          </button>
          <button
            onClick={() => setMobileView('map')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition ${mobileView === 'map' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'}`}
          >
            <Map className="w-4 h-4" /> Map
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-5 flex items-center gap-3 font-medium">
            <AlertTriangle className="w-5 h-5 shrink-0" /> {error}
          </div>
        )}

        <div className="space-y-4 sm:space-y-6 pb-4">
          {posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onVote={handleVoteUpdate}
              onComment={handleCommentUpdate}
              onDelete={handleDeletePost}
            />
          ))}
          {posts.length === 0 && (
            <div className="text-center py-20 text-slate-500 font-medium">
              No posts in your area yet. Be the first to add one!
            </div>
          )}
        </div>
      </div>

      {/* ── Map Column — Desktop always visible, Mobile when tab = map ── */}
      <div className={`${mobileView === 'map' ? 'flex flex-col flex-1' : 'hidden'} lg:flex lg:flex-col lg:w-96 xl:w-[450px] p-4 sm:p-6`}>
        <div className="flex-1 rounded-3xl overflow-hidden border border-slate-200 shadow-sm min-h-[300px] lg:min-h-0 lg:h-[calc(100vh-8rem)]">
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
