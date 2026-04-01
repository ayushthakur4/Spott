import { useState, useContext } from 'react';
import { ChevronUp, ChevronDown, MessageSquare, Share2, MapPin, Clock, Trash2, Bookmark, Flag, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const PostCard = ({ post, onVote, onComment, onDelete }) => {
  const { user } = useContext(AuthContext);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [reported, setReported] = useState(false);
  const [saved, setSaved] = useState(
    user && user.savedPosts ? user.savedPosts.includes(post._id) : false
  );

  const isUpvoted = user ? post.upvotes.includes(user._id) : false;
  const isDownvoted = user ? post.downvotes.includes(user._id) : false;
  const voteCount = post.upvotes.length - post.downvotes.length;
  const isOwner = user && user._id === post.user?._id;

  const handleUpvote = async () => {
    if (!user) return alert('Please log in to vote');
    try {
      const res = await api.put(`/posts/${post._id}/upvote`);
      onVote(res.data);
    } catch (error) { console.error(error); }
  };

  const handleDownvote = async () => {
    if (!user) return alert('Please log in to vote');
    try {
      const res = await api.put(`/posts/${post._id}/downvote`);
      onVote(res.data);
    } catch (error) { console.error(error); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please log in to comment');
    if (!commentText.trim()) return;
    setLoading(true);
    try {
      const res = await api.post(`/posts/${post._id}/comments`, { text: commentText });
      onComment(post._id, res.data);
      setCommentText('');
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      if (onDelete) onDelete(post._id);
    } catch (error) {
      console.error(error);
      alert('Error deleting post');
    }
  };

  const handleSave = async () => {
    if (!user) return alert('Please log in to save posts');
    try {
      const res = await api.post(`/users/save/${post._id}`);
      const nowSaved = res.data.includes(post._id);
      setSaved(nowSaved);
      // Update localStorage savedPosts so state stays in sync
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        storedUser.savedPosts = res.data;
        localStorage.setItem('user', JSON.stringify(storedUser));
      }
    } catch (error) { console.error(error); }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Spott – ${post.type}`, text: post.description, url: postUrl });
      } catch (_) {}
    } else {
      navigator.clipboard.writeText(postUrl);
      alert('Link copied to clipboard!');
    }
  };

  const handleReport = async () => {
    if (!user) return alert('Please log in to report posts');
    if (reported) return;
    if (!window.confirm('Report this post as fake or inappropriate?')) return;
    try {
      await api.post(`/posts/${post._id}/report`);
      setReported(true);
    } catch (error) { console.error(error); }
  };

  const getCategoryColor = (type) => {
    switch (type) {
      case 'Police Alert': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Accident':     return 'text-red-600 bg-red-50 border-red-200';
      case 'Viewpoint':    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Picnic':       return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Couple Safe':  return 'text-pink-600 bg-pink-50 border-pink-200';
      case 'Cafe':         return 'text-orange-600 bg-orange-50 border-orange-200';
      default:             return 'text-slate-600 bg-slate-50 border-slate-200';
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
              <Link to={`/profile/${post.user?._id}`}>
                <img
                  src={post.user?.profileImage}
                  alt="User"
                  className="w-8 h-8 rounded-full border border-slate-200 hover:opacity-80 transition"
                />
              </Link>
              <div>
                <Link to={`/profile/${post.user?._id}`}>
                  <p className="text-sm font-semibold text-slate-800 hover:text-primary-700 transition">{post.user?.name}</p>
                </Link>
                <div className="flex items-center text-xs text-slate-500 gap-2">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-wide uppercase ${getCategoryColor(post.type)}`}>
                    {post.type}
                  </span>
                </div>
              </div>
            </div>

            {/* Top-right actions */}
            <div className="flex items-center gap-1">
              {post.expiresAt && (
                <div className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg mr-1">
                  <Clock className="w-3 h-3" />
                  <span>Exp: {new Date(post.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
              {/* Bookmark */}
              <button
                onClick={handleSave}
                title={saved ? 'Unsave post' : 'Save post'}
                className={`p-1.5 rounded-md transition ${saved ? 'text-primary-600 bg-primary-50' : 'text-slate-400 hover:text-primary-600 hover:bg-primary-50'}`}
              >
                <Bookmark className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
              </button>
              {/* Report – only non-owners */}
              {!isOwner && (
                <button
                  onClick={handleReport}
                  title="Report post"
                  className={`p-1.5 rounded-md transition ${reported ? 'text-red-400 cursor-not-allowed' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                >
                  <Flag className="w-4 h-4" />
                </button>
              )}
              {/* Delete – only owner */}
              {isOwner && (
                <button
                  onClick={handleDelete}
                  title="Delete post"
                  className="text-red-500 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <p className="text-slate-700 font-medium mb-4 leading-relaxed">{post.description}</p>

          {post.image && (
            <div className="rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-100">
              <img src={post.image} alt="Post media" className="w-full h-auto max-h-96 object-cover" loading="lazy" />
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center gap-2 sm:gap-4 text-slate-500 text-sm font-medium border-t border-slate-100 pt-3 flex-wrap">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{post.comments?.length || 0} Comments</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            {/* Navigate Here */}
            {post.location && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${post.location.lat},${post.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:bg-primary-50 text-primary-700 px-3 py-1.5 rounded-xl transition ml-auto"
              >
                <Navigation className="w-4 h-4" />
                <span className="text-xs">Navigate</span>
              </a>
            )}

            {!post.location && (
              <div className="flex items-center gap-2 ml-auto text-primary-600 bg-primary-50 px-3 py-1.5 rounded-xl">
                <MapPin className="w-4 h-4" />
                <span className="text-xs">Location Tagged</span>
              </div>
            )}
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
                      <Link to={`/profile/${comment.user?._id}`}>
                        <img src={comment.user?.profileImage} alt="User" className="w-6 h-6 rounded-full hover:opacity-80 transition" />
                      </Link>
                      <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100 flex-1">
                        <Link to={`/profile/${comment.user?._id}`}>
                          <p className="text-xs font-semibold text-slate-800 mb-1 hover:text-primary-700 transition">{comment.user?.name}</p>
                        </Link>
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
