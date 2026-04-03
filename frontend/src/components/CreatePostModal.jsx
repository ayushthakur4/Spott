import { useState, useContext, useRef } from 'react';
import { X, Image as ImageIcon, MapPin, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
import api from '../services/api';
import AuthContext from '../context/AuthContext';

const CATEGORIES = ['Police Alert', 'Accident', 'Viewpoint', 'Picnic', 'Couple Safe', 'Cafe', 'Random'];

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const { user } = useContext(AuthContext);
  const [type, setType]         = useState('Police Alert');
  const [description, setDesc]  = useState('');
  const [locationName, setLocName] = useState('');
  const [image, setImage]       = useState(null);
  const [preview, setPreview]   = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [fetchingLoc, setFetchingLoc] = useState(false);
  const [error, setError]       = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
  };

  const getLocation = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported.'); return; }
    setFetchingLoc(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ lat, lng });
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: { 'User-Agent': 'Spott/1.0' }
          });
          const data = await res.json();
          if (data && data.address) {
            const { road, suburb, neighbourhood, amenity, city, town } = data.address;
            const placeParts = [amenity || road, neighbourhood || suburb, city || town].filter(Boolean);
            if (placeParts.length > 0) setLocName(placeParts.join(', '));
          }
        } catch (e) {
          console.error("Geocoding failed", e);
        } finally {
          setFetchingLoc(false);
        }
      },
      () => {
        setError('Location access denied.');
        setFetchingLoc(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user)              { setError('Not logged in.'); return; }
    if (!image || !location){ setError('Photo & Location needed!'); return; }
    setLoading(true);
    setError('');
    const fd = new FormData();
    fd.append('type', type);
    fd.append('description', description);
    fd.append('locationName', locationName);
    fd.append('image', image);
    fd.append('lat', location.lat);
    fd.append('lng', location.lng);
    try {
      const res = await api.post('/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onPostCreated(res.data);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally { setLoading(false); }
  };

  const handleClose = () => {
    setType('Police Alert'); setDesc(''); setLocName(''); setImage(null);
    setPreview(null); setLocation(null); setError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] modal-overlay flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="glass-panel ghost-border w-full sm:max-w-xl rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] animate-slide-up shadow-2xl relative">
        
        {/* Handle for mobile */}
        <div className="sm:hidden w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-3 mb-1" />

        {/* Header: Title */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center border border-[var(--color-primary)]/20 animate-pulse-glow">
                <MapPin className="text-[var(--color-primary)] w-5 h-5" />
             </div>
             <h2 className="text-lg font-black tracking-tighter uppercase text-[var(--color-on-surface)]">Drop a Spot</h2>
          </div>
          <button onClick={handleClose} className="p-2.5 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-all active:scale-90">
             <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto no-scrollbar pb-[calc(1.5rem+env(safe-area-inset-bottom)+72px)] sm:pb-8">
          
          <div className="px-6 py-6 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold animate-alert-pulse flex items-center gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full shadow-[0_0_10px_rgba(248,113,113,0.5)]" />
                {error}
              </div>
            )}

            {/* LIVE PREVIEW CARD CONTAINER */}
            <div className="bg-[var(--color-surface-container-low)] rounded-3xl ghost-border overflow-hidden p-5 shadow-inner">
               
               {/* User info */}
               <div className="flex items-center gap-3 mb-4">
                  <img src={user?.profileImage} className="w-10 h-10 rounded-full border-2 border-[var(--color-surface-container-highest)] shadow-sm" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                    <div className="relative inline-block mt-1">
                      <select 
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="category-select text-[10px] font-black uppercase tracking-widest bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-3 py-1.5 rounded-xl border border-[var(--color-primary)]/20 outline-none cursor-pointer focus:border-[var(--color-primary)]/40 transition-colors"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
               </div>

               {/* Location Indicator (Live) */}
               { (locationName || location) && (
                 <div className="flex items-center gap-2 mb-4 animate-fade-in bg-[var(--color-primary)]/5 p-3 rounded-2xl border border-[var(--color-primary)]/10">
                    <div className="w-7 h-7 rounded-lg bg-[var(--color-primary)]/20 flex items-center justify-center">
                       <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    </div>
                    <p className="text-[11px] font-bold text-[var(--color-primary)] uppercase tracking-tight truncate">
                       Detected Spot: <span className="text-white ml-1">{locationName || "Locked Signal"}</span>
                    </p>
                 </div>
               )}

               {/* Description Area */}
               <textarea
                 placeholder="What's happening? Describe the alert or place... 🛰️"
                 value={description}
                 onChange={(e) => setDesc(e.target.value)}
                 className="w-full bg-transparent text-white text-base font-medium placeholder:text-white/20 outline-none resize-none min-h-[100px] leading-relaxed py-1"
               />

               {/* Image Preview inside the live context */}
               {preview && (
                 <div className="relative mt-4 rounded-2xl overflow-hidden ghost-border animate-fade-in group">
                    <img src={preview} alt="Preview" className="w-full h-auto max-h-64 object-cover" />
                    <button 
                      type="button" 
                      onClick={() => { setPreview(null); setImage(null); }}
                      className="absolute top-3 right-3 bg-black/60 backdrop-blur-md p-1.5 rounded-full text-white hover:bg-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                 </div>
               )}

               {/* Footer Preview Mockup */}
               <div className="flex items-center gap-3 pt-4 mt-2 border-t border-white/5 opacity-50 grayscale">
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-full bg-white/20" /> <div className="w-8 h-2 bg-white/10 rounded-full" /></div>
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-full bg-white/20" /> <div className="w-8 h-2 bg-white/10 rounded-full" /></div>
               </div>
            </div>

            {/* CONTROL PANEL */}
            <div className="space-y-4 pt-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Controls</label>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className={`flex items-center justify-center gap-3 p-4 rounded-3xl border transition-all active:scale-95 ${preview ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5 text-[var(--color-primary)]' : 'border-white/5 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white'}`}
                >
                  <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageChange} />
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">{preview ? 'SWAP IMAGE' : 'ADD PHOTO'}</span>
                </button>

                <button
                  type="button"
                  onClick={getLocation}
                  disabled={fetchingLoc}
                  className={`flex items-center justify-center gap-3 p-4 rounded-3xl border transition-all active:scale-95 ${location ? 'border-[var(--color-tertiary)]/40 bg-[var(--color-tertiary)]/5 text-[var(--color-tertiary)]' : 'border-white/5 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white'}`}
                >
                  {fetchingLoc ? <Loader2 className="w-5 h-5 animate-spin" /> : location ? <CheckCircle2 className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                  <span className="text-xs font-bold uppercase tracking-wider">{fetchingLoc ? 'LOCATING...' : location ? 'LOCATED' : 'GET LOCATION'}</span>
                </button>
              </div>

              <input
                type="text"
                placeholder="Manual location (e.g. Near MG Road...)"
                value={locationName}
                onChange={(e) => setLocName(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm font-medium text-white placeholder:text-white/20 focus:border-[var(--color-primary)]/40 focus:bg-white/[0.05] transition-all outline-none"
              />
            </div>
          </div>
        </form>

        {/* BOTTOM ACTION BAR (Sticky on mobile) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)] to-transparent pointer-events-none pb-safe">
           <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !image || !location}
            className="w-full gradient-primary text-black font-black uppercase tracking-[0.15em] py-4 rounded-2xl shadow-xl shadow-[var(--color-primary)]/20 active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale pointer-events-auto flex items-center justify-center gap-3 relative overflow-hidden"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Transmit Signal</span>
              </>
            )}
            <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
          </button>
        </div>

      </div>
    </div>
  );
};

// Re-using Sparkles from lucide or defining a placeholder icon if missing
const Sparkles = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);

export default CreatePostModal;
