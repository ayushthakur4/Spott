import { useState, useEffect, useContext } from 'react';
import { PenSquare, AlertTriangle, Loader2 } from 'lucide-react';
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
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Try to get user geolocation for local feed
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchPosts(pos.coords.latitude, pos.coords.longitude),
        () => fetchPosts() // fallback: show all posts
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
      setLoading(false);
    } catch (err) {
      setError('Failed to load feed.');
      setLoading(false);
    }
  };

  const handleVoteUpdate = (updatedPost) => {
    setPosts(posts.map(post => post._id === updatedPost._id ? { ...post, upvotes: updatedPost.upvotes, downvotes: updatedPost.downvotes } : post));
  };

  const handleCommentUpdate = (postId, updatedComments) => {
    setPosts(posts.map(post => post._id === postId ? { ...post, comments: updatedComments } : post));
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  const handleCreatePrompt = () => {
    if (user) {
      setIsModalOpen(true);
    } else {
      navigate('/login');
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary-500" /></div>;

  return (
    <div className="flex h-full">
      {/* Feed Column */}
      <div className="flex-1 max-w-2xl px-4 py-6 md:px-8 overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3 cursor-text">
            <img src={user ? user.profileImage : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} alt="Profile" className="w-8 h-8 rounded-full bg-slate-100" />
            <span className="text-slate-400 font-medium cursor-text" onClick={handleCreatePrompt}>Share an alert or new place...</span>
          </div>
          <button 
            onClick={handleCreatePrompt}
            className="bg-primary-600 hover:bg-primary-700 text-white rounded-2xl p-3 sm:px-5 sm:py-3 shadow-sm transition flex gap-2 font-semibold"
          >
            <PenSquare className="w-5 h-5" />
            <span className="hidden sm:block">Post</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex items-center gap-3 font-medium">
            <AlertTriangle className="w-5 h-5" /> {error}
          </div>
        )}

        <div className="space-y-6 pb-20">
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

      {/* Map Column Desktop */}
      <div className="hidden lg:block w-96 p-6 xl:w-[450px]">
         <div className="h-[calc(100vh-8rem)]">
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
