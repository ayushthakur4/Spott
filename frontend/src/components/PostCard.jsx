import { useState, useContext } from 'react';
import { ChevronUp, ChevronDown, MessageSquare, Share2, MapPin, Clock, Trash2, Bookmark, Flag, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const TAG_COLORS = {
  'Police Alert': 'bg-blue-50   text-blue-600   border-blue-200',
  'Accident':     'bg-red-50    text-red-600    border-red-200',
  'Viewpoint':    'bg-emerald-50 text-emerald-600 border-emerald-200',
  'Picnic':       'bg-amber-50  text-amber-600  border-amber-200',
  'Couple Safe':  'bg-pink-50   text-pink-600   border-pink-200',
  'Cafe':         'bg-orange-50 text-orange-600 border-orange-200',
  'Random':       'bg-violet-50 text-violet-600 border-violet-200',
};

const PostCard = ({ post, onVote, onComment, onDelete }) => {
  const { user } = useContext(AuthContext);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reported, setReported] = useState(false);
  const [saved, setSaved] = useState(
    user?.savedPosts ? user.savedPosts.includes(post._id) : false
  );

  const isUpvoted   = user ? post.upvotes.includes(user._id)   : false;
  const isDownvoted = user ? post.downvotes.includes(user._id) : false;
  const voteCount   = post.upvotes.length - post.downvotes.length;
  const isOwner     = user?._id === post.user?._id;
  const tagColor    = TAG_COLORS[post.type] || 'bg-slate-50 text-slate-600 border-slate-200';

  const handleUpvote = async () => {
    if (!user) return alert('Please log in to vote');
    try { const r = await api.put(`/posts/${post._id}/upvote`); onVote(r.data); }
    catch (e) { console.error(e); }
  };

  const handleDownvote = async () => {
    if (!user) return alert('Please log in to vote');
    try { const r = await api.put(`/posts/${post._id}/downvote`); onVote(r.data); }
    catch (e) { console.error(e); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user)              return alert('Please log in to comment');
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const r = await api.post(`/posts/${post._id}/comments`, { text: commentText });
      onComment(post._id, r.data);
      setCommentText('');
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try { await api.delete(`/posts/${post._id}`); onDelete?.(post._id); }
    catch (e) { alert('Error deleting post'); }
  };

  const handleSave = async () => {
    if (!user) return alert('Please log in to save posts');
    try {
      const r = await api.post(`/users/save/${post._id}`);
      const nowSaved = r.data.includes(post._id);
      setSaved(nowSaved);
      const stored = JSON.parse(localStorage.getItem('user'));
      if (stored) { stored.savedPosts = r.data; localStorage.setItem('user', JSON.stringify(stored)); }
    } catch (e) { console.error(e); }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post._id}`;
    if (navigator.share) {
      try { await navigator.share({ title: `Spott – ${post.type}`, text: post.description, url }); }
      catch (_) {}
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied!');
    }
  };

  const handleReport = async () => {
    if (!user) return alert('Please log in to report');
    if (reported) return;
    if (!window.confirm('Report this post?')) return;
    try { await api.post(`/posts/${post._id}/report`); setReported(true); }
    catch (e) { console.error(e); }
  };

  return (
    <article className="bg-white rounded-3xl shadow-card border border-slate-200/70 overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex">

        {/* ── Vote sidebar ── */}
        <div className="w-11 sm:w-13 shrink-0 flex flex-col items-center gap-0.5 py-4 px-2 border-r border-slate-100 bg-slate-50/60">
          <button
            onClick={handleUpvote}
            className={`p-1.5 rounded-xl transition-all duration-200 btn-press ${
              isUpvoted
                ? 'gradient-brand text-white shadow-glow-sm'
                : 'text-slate-400 hover:bg-primary-50 hover:text-primary-500'
            }`}
          >
            <ChevronUp className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <span className={`font-display font-bold text-sm leading-none py-0.5 ${
            isUpvoted ? 'text-primary-500' : isDownvoted ? 'text-red-400' : 'text-slate-600'
          }`}>
            {voteCount}
          </span>
          <button
            onClick={handleDownvote}
            className={`p-1.5 rounded-xl transition-all duration-200 btn-press ${
              isDownvoted
                ? 'bg-red-50 text-red-500'
                : 'text-slate-400 hover:bg-red-50 hover:text-red-400'
            }`}
          >
            <ChevronDown className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 p-4 sm:p-5 min-w-0">

          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <Link to={`/profile/${post.user?._id}`} className="shrink-0">
                <img
                  src={post.user?.profileImage}
                  alt="User"
                  className="w-8 h-8 rounded-full border-2 border-primary-100 object-cover hover:border-primary-400 transition-all"
                />
              </Link>
              <div className="min-w-0">
                <Link to={`/profile/${post.user?._id}`}>
                  <p className="text-sm font-bold text-slate-800 hover:text-primary-600 transition truncate">{post.user?.name}</p>
                </Link>
                <p className="text-xs text-slate-400 truncate">
                  {new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  {(post.locationName || post.location) && (
                    <>
                      <span className="mx-1.5 opacity-50">•</span>
                      near <span className="font-medium text-slate-500">{post.locationName || 'this spot'}</span>
                    </>
                  )}
                </p>
              </div>
              <span className={`chip border shrink-0 ${tagColor}`}>{post.type}</span>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={handleSave}
                className={`p-1.5 rounded-xl transition-all duration-200 btn-press ${saved ? 'text-primary-500 bg-primary-50' : 'text-slate-400 hover:text-primary-500 hover:bg-primary-50'}`}
                title={saved ? 'Unsave' : 'Save'}
              >
                <Bookmark className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
              </button>
              {!isOwner && (
                <button
                  onClick={handleReport}
                  className={`p-1.5 rounded-xl transition-all duration-200 ${reported ? 'text-red-300 cursor-not-allowed' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                  title="Report"
                >
                  <Flag className="w-4 h-4" />
                </button>
              )}
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 btn-press"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <p className="text-slate-700 text-sm sm:text-[15px] leading-relaxed mb-3 font-medium">
            {post.description}
          </p>

          {post.image && (
            <div className="rounded-2xl overflow-hidden bg-slate-100 mb-3 border border-slate-100">
              <img src={post.image} alt="Post" className="w-full h-auto max-h-80 object-cover" loading="lazy" />
            </div>
          )}

          {/* Location Name (Footer) */}
          {(post.locationName || post.location) && (
            <div className="flex items-center gap-1.5 mb-3 px-1">
              <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
              <p className="text-sm font-bold text-slate-700">
                Near <span className="text-primary-600">{post.locationName || `${post.location.lat.toFixed(4)}, ${post.location.lng.toFixed(4)}`}</span>
              </p>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center gap-1 pt-2.5 border-t border-slate-100 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-primary-600 hover:bg-primary-50 px-2.5 py-1.5 rounded-xl transition-all duration-200 shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{post.comments?.length || 0}</span>
              <span className="hidden sm:inline">Comments</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-primary-600 hover:bg-primary-50 px-2.5 py-1.5 rounded-xl transition-all duration-200 shrink-0"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <div className="flex-1" />

            {post.location ? (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${post.location.lat},${post.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold gradient-brand text-white px-3 py-1.5 rounded-xl transition-all duration-200 shrink-0 shadow-glow-sm hover:shadow-glow btn-press"
              >
                <Navigation className="w-3.5 h-3.5" />
                Navigate
              </a>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold text-primary-500 bg-primary-50 px-2.5 py-1.5 rounded-xl border border-primary-100 shrink-0">
                <MapPin className="w-3.5 h-3.5" /> Tagged
              </span>
            )}
          </div>

          {/* Comments section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto no-scrollbar">
                {post.comments?.length === 0 ? (
                  <p className="text-xs text-center text-slate-400 py-3 italic">No comments yet — start the conversation!</p>
                ) : (
                  post.comments?.map((comment, idx) => (
                    <div key={idx} className="flex gap-2.5">
                      <Link to={`/profile/${comment.user?._id}`}>
                        <img src={comment.user?.profileImage} alt="" className="w-6 h-6 rounded-full shrink-0 hover:opacity-80 transition" />
                      </Link>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none px-3 py-2 flex-1 min-w-0">
                        <Link to={`/profile/${comment.user?._id}`}>
                          <p className="text-xs font-bold text-slate-700 hover:text-primary-600 transition mb-0.5">{comment.user?.name}</p>
                        </Link>
                        <p className="text-xs text-slate-600 leading-relaxed">{comment.text}</p>
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
                    placeholder="Say something…"
                    className="flex-1 min-w-0 bg-slate-100 text-sm rounded-2xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary-200 transition placeholder-slate-400 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={submitting || !commentText.trim()}
                    className="gradient-brand text-white rounded-2xl px-4 py-2 text-sm font-bold disabled:opacity-50 transition btn-press shrink-0"
                  >
                    Post
                  </button>
                </form>
              ) : (
                <p className="text-xs text-center text-slate-400 italic py-1">Log in to comment.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default PostCard;
