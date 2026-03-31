import { useState, useContext } from 'react';
import { ChevronUp, ChevronDown, MessageSquare, Share2, MapPin, Clock } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const PostCard = ({ post, onVote, onComment }) => {
  const { user } = useContext(AuthContext);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  const isUpvoted = user ? post.upvotes.includes(user._id) : false;
  const isDownvoted = user ? post.downvotes.includes(user._id) : false;
  const voteCount = post.upvotes.length - post.downvotes.length;

  const handleUpvote = async () => {
    if (!user) return alert('Please log in to vote');
    try {
      const res = await api.put(`/posts/${post._id}/upvote`);
      onVote(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownvote = async () => {
    if (!user) return alert('Please log in to vote');
    try {
      const res = await api.put(`/posts/${post._id}/downvote`);
      onVote(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please log in to comment');
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      const res = await api.post(`/posts/${post._id}/comments`, { text: commentText });
      onComment(post._id, res.data); // Return updated comments
      setCommentText('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (type) => {
    switch (type) {
      case 'Police Alert': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Accident': return 'text-red-600 bg-red-50 border-red-200';
      case 'Viewpoint': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Picnic': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Couple Safe': return 'text-pink-600 bg-pink-50 border-pink-200';
      case 'Cafe': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="flex">
        {/* Vote Sidebar */}
        <div className="w-12 sm:w-16 bg-slate-50/50 p-2 sm:p-4 flex flex-col items-center gap-1 border-r border-slate-100">
          <button 
            onClick={handleUpvote}
            className={`p-1.5 rounded-full hover:bg-slate-200 transition ${isUpvoted ? 'text-orange-500' : 'text-slate-400'}`}
          >
            <ChevronUp className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className={`font-bold text-sm ${isUpvoted ? 'text-orange-500' : isDownvoted ? 'text-indigo-500' : 'text-slate-700'}`}>
            {voteCount}
          </span>
          <button 
            onClick={handleDownvote}
            className={`p-1.5 rounded-full hover:bg-slate-200 transition ${isDownvoted ? 'text-indigo-500' : 'text-slate-400'}`}
          >
            <ChevronDown className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <img src={post.user?.profileImage} alt="User" className="w-8 h-8 rounded-full border border-slate-200" />
              <div>
                <p className="text-sm font-semibold text-slate-800">{post.user?.name}</p>
                <div className="flex items-center text-xs text-slate-500 gap-2">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-wide uppercase ${getCategoryColor(post.type)}`}>
                    {post.type}
                  </span>
                </div>
              </div>
            </div>
            {post.expiresAt && (
              <div className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                <Clock className="w-3 h-3" />
                <span>Exp: {new Date(post.expiresAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            )}
          </div>

          {/* Body */}
          <p className="text-slate-700 font-medium mb-4 leading-relaxed">{post.description}</p>
          
          {post.image && (
            <div className="rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-100">
              <img src={post.image} alt="Post media" className="w-full h-auto max-h-96 object-cover" loading="lazy" />
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center gap-6 text-slate-500 text-sm font-medium border-t border-slate-100 pt-3">
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition"
            >
              <MessageSquare className="w-5 h-5" />
              <span>{post.comments?.length || 0} Comments</span>
            </button>
            <button className="flex items-center gap-2 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition">
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
            <div className="flex items-center gap-2 ml-auto text-primary-600 bg-primary-50 px-3 py-1.5 rounded-xl">
              <MapPin className="w-4 h-4" />
              <span className="text-xs">Location Tagged</span>
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="space-y-4 mb-4 max-h-64 overflow-y-auto no-scrollbar">
                {post.comments?.length === 0 ? (
                  <p className="text-sm text-center text-slate-400 py-4">No comments yet. Be the first to start the discussion!</p>
                ) : (
                  post.comments?.map((comment, idx) => (
                    <div key={idx} className="flex gap-3">
                      <img src={comment.user?.profileImage} alt="User" className="w-6 h-6 rounded-full" />
                      <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100 flex-1">
                        <p className="text-xs font-semibold text-slate-800 mb-1">{comment.user?.name}</p>
                        <p className="text-sm text-slate-600">{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {user ? (
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 bg-slate-100 text-sm rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-primary-100 transition"
                  />
                  <button 
                    type="submit" 
                    disabled={loading || !commentText.trim()}
                    className="bg-primary-600 text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition"
                  >
                    Post
                  </button>
                </form>
              ) : (
                <p className="text-xs text-center text-slate-500 italic">Log in to leave a comment.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
