import { useState, useContext } from 'react';
import { ChevronUp, ChevronDown, MessageSquare, Share2, MapPin, Trash2, Bookmark, Flag, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const getTagStyles = (type) => {
  const t = type.toLowerCase();
  
  if (t.includes('police') || t.includes('accident')) {
    return 'bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20 animate-alert-pulse';
  }
  if (t.includes('hazard') || t.includes('traffic') || t.includes('random')) {
    return 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border border-[var(--color-secondary)]/20';
  }
  return 'bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)] border border-[var(--color-tertiary)]/20';
};

const PostCard = ({ post, onVote, onComment, onDelete, compact = false }) => {
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
  const tagStyles   = getTagStyles(post.type);

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
    <article className="bg-[var(--color-surface-container-low)] rounded-3xl ghost-border overflow-hidden hover:bg-[var(--color-surface-container-high)] transition-colors duration-300 group/card">
      <div className="flex">
        {!compact && (
          <div className="w-11 sm:w-13 shrink-0 flex flex-col items-center gap-0.5 py-4 px-2">
            <button
              onClick={handleUpvote}
              className={`p-2 rounded-2xl transition-all duration-200 btn-press ${
                isUpvoted
                  ? 'gradient-primary text-[var(--color-on-surface)] glow-primary'
                  : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-highest)] hover:text-[var(--color-primary)]'
              }`}
            >
              <ChevronUp className="w-5 h-5" strokeWidth={2.5} />
            </button>
            <span className={`font-display font-bold text-sm leading-none py-1.5 ${
              isUpvoted ? 'text-[var(--color-primary)]' : isDownvoted ? 'text-[var(--color-error)]' : 'text-[var(--color-on-surface-variant)]'
            }`}>
              {voteCount}
            </span>
            <button
              onClick={handleDownvote}
              className={`p-2 rounded-2xl transition-all duration-200 btn-press ${
                isDownvoted
                  ? 'bg-[var(--color-error)]/20 text-[var(--color-error)]'
                  : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-highest)] hover:text-[var(--color-error)]'
              }`}
            >
              <ChevronDown className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* ── Content ── */}
        <div className={`flex-1 min-w-0 ${compact ? 'p-3' : 'p-4 sm:p-5'}`}>

          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <Link to={`/profile/${post.user?._id}`} className="shrink-0 relative">
                <img
                  src={post.user?.profileImage}
                  alt="User"
                  className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full border-2 border-[var(--color-surface-container-highest)] object-cover hover:border-[var(--color-primary)] transition-colors`}
                />
              </Link>
              <div className="min-w-0">
                <Link to={`/profile/${post.user?._id}`}>
                  <p className={`${compact ? 'text-[12px]' : 'text-sm'} font-bold text-[var(--color-on-surface)] hover:text-[var(--color-primary)] transition truncate`}>{post.user?.name}</p>
                </Link>
                <p className={`${compact ? 'text-[9px]' : 'text-[11px]'} label-text text-[var(--color-on-surface-variant)] truncate mt-0.5`}>
                  {new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  {(post.locationName || post.location) && (
                    <>
                      <span className="mx-1 opacity-50">•</span>
                      NEAR <span className="font-bold text-[var(--color-on-surface-variant)]">{post.locationName || 'LOCATION'}</span>
                    </>
                  )}
                </p>
              </div>
              <span className={`chip ml-1 shrink-0 ${compact ? 'text-[9px] px-2 py-0.5' : ''} ${tagStyles}`}>{post.type}</span>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/card:opacity-100 transition-opacity">
              <button
                onClick={handleSave}
                className={`p-2 rounded-2xl transition-all duration-200 btn-press ${saved ? 'text-[var(--color-primary)] bg-[var(--color-surface-container-highest)]' : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-container-highest)]'}`}
                title={saved ? 'Unsave' : 'Save'}
              >
                <Bookmark className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
              </button>
              {!isOwner && (
                <button
                  onClick={handleReport}
                  className={`p-2 rounded-2xl transition-all duration-200 ${reported ? 'text-[var(--color-error)]/50 cursor-not-allowed' : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] hover:bg-[var(--color-surface-container-highest)]'}`}
                  title="Report"
                >
                  <Flag className="w-4 h-4" />
                </button>
              )}
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-2xl text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] hover:bg-[var(--color-surface-container-highest)] transition-colors duration-200 btn-press"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <p className={`${compact ? 'text-xs' : 'text-sm sm:text-[15px]'} text-[var(--color-on-surface-variant)] leading-relaxed mb-3 font-medium px-1`}>
            {post.description}
          </p>

          {post.image && !compact && (
            <div className="rounded-2xl overflow-hidden bg-[var(--color-background)] mb-4 ghost-border">
              <img src={post.image} alt="Post" className="w-full h-auto max-h-80 object-cover" loading="lazy" />
            </div>
          )}

          {/* Location Name (Footer) - Hidden in compact if not needed */}
          {(post.locationName || post.location) && !compact && (
            <div className="flex items-center gap-2 mb-4 px-1 p-3 rounded-2xl border border-transparent hover:border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-highest)] transition-colors w-max">
              <MapPin className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
              <p className="text-sm font-bold text-[var(--color-on-surface)] tracking-tight">
                NEAR <span className="text-[var(--color-primary)] tracking-normal ml-0.5">{post.locationName || `${post.location.lat.toFixed(4)}, ${post.location.lng.toFixed(4)}`}</span>
              </p>
            </div>
          )}

          {/* Footer actions */}
          <div className={`flex items-center gap-2 border-t border-[var(--color-outline-variant)] opacity-90 mt-1 ${compact ? 'pt-2' : 'pt-3 mt-2'} overflow-x-auto no-scrollbar`}>
            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-1.5 font-semibold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-container-highest)] px-2.5 py-1.5 rounded-xl transition-all duration-200 shrink-0 ${compact ? 'text-[10px]' : 'text-xs sm:text-sm'}`}
            >
              <MessageSquare className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
              <span>{post.comments?.length || 0}</span>
              {!compact && <span className="hidden sm:inline label-text ml-1 opacity-70">Comments</span>}
            </button>

            {!compact && (
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-container-highest)] px-3 py-2 rounded-2xl transition-all duration-200 shrink-0"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline label-text opacity-70">Share</span>
              </button>
            )}

            <div className="flex-1" />

            {post.location && !compact ? (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${post.location.lat},${post.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-bold gradient-primary text-[var(--color-on-surface)] px-4 py-2 rounded-2xl transition-all duration-200 shrink-0 glow-primary btn-press"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span className="label-text">Navigate</span>
              </a>
            ) : compact && post.location ? (
               <button onClick={handleUpvote} className={`flex items-center gap-1 font-bold px-3 py-1.5 rounded-xl transition-all ${isUpvoted ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-highest)]'} text-[10px]`}>
                 <ChevronUp className="w-3.5 h-3.5" />
                 {voteCount}
               </button>
            ) : null}
          </div>

          {/* Comments section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-[var(--color-outline-variant)] animate-fade-in">
              <div className="space-y-4 mb-5 max-h-60 overflow-y-auto no-scrollbar">
                {post.comments?.length === 0 ? (
                  <p className="text-xs text-center text-[var(--color-on-surface-variant)] py-4 italic">No comments yet — start the conversation!</p>
                ) : (
                  post.comments?.map((comment, idx) => (
                    <div key={idx} className="flex gap-3">
                      <Link to={`/profile/${comment.user?._id}`}>
                        <img src={comment.user?.profileImage} alt="" className="w-7 h-7 rounded-full shrink-0 hover:opacity-80 transition" />
                      </Link>
                      <div className="bg-[var(--color-surface-container-highest)] ghost-border rounded-3xl rounded-tl-sm px-4 py-3 flex-1 min-w-0">
                        <Link to={`/profile/${comment.user?._id}`}>
                          <p className="text-xs font-bold text-[var(--color-on-surface)] hover:text-[var(--color-primary)] transition mb-1">{comment.user?.name}</p>
                        </Link>
                        <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">{comment.text}</p>
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
                    className="flex-1 min-w-0 bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)] text-sm rounded-3xl px-5 py-3 outline-none ghost-border focus:border-[var(--color-primary)] focus:bg-[var(--color-surface-container-highest)] transition-colors placeholder:text-[var(--color-on-surface-variant)]/50 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={submitting || !commentText.trim()}
                    className="gradient-primary text-[var(--color-on-surface)] rounded-3xl px-5 py-3 text-sm font-bold disabled:opacity-50 transition btn-press shrink-0"
                  >
                    Post
                  </button>
                </form>
              ) : (
                <p className="text-xs text-center text-[var(--color-on-surface-variant)] italic py-2">Log in to comment.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default PostCard;
