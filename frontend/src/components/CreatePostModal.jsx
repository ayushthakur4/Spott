import { useState, useContext, useRef } from 'react';
import { X, Image as ImageIcon, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
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
        
        // Reverse Geocoding
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: { 'User-Agent': 'Spott-Community-App/1.0' }
          });
          const data = await res.json();
          if (data && data.address) {
            const { road, suburb, neighbourhood, amenity, city, town } = data.address;
            const placeParts = [amenity || road, neighbourhood || suburb, city || town].filter(Boolean);
            if (placeParts.length > 0) {
              setLocName(placeParts.join(', '));
            }
          }
        } catch (e) {
          console.error("Could not fetch address", e);
        } finally {
          setFetchingLoc(false);
        }
      },
      () => {
        setError('Could not get location. Please enable location services.');
        setFetchingLoc(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user)              { setError('You must be logged in.'); return; }
    if (!image || !location){ setError('Image and location are required!'); return; }
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
      setError(err.response?.data?.message || 'Error creating post');
    } finally { setLoading(false); }
  };

  const handleClose = () => {
    setType('Police Alert'); setDesc(''); setLocName(''); setImage(null);
    setPreview(null); setLocation(null); setError('');
    onClose();
  };

  return (
    /* ── Overlay ── */
    <div
      className="fixed inset-0 z-50 modal-overlay flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/* ── Sheet / Modal ── */}
      <div className="glass-panel ghost-border w-full sm:max-w-lg rounded-t-3xl sm:rounded-[2rem] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-slide-up glow-primary">

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-[var(--color-outline-variant)] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-outline-variant)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 gradient-primary glow-primary rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[var(--color-on-surface)]" strokeWidth={2.5} />
            </div>
            <h2 className="font-display font-black text-lg text-[var(--color-on-surface)] uppercase tracking-wide">New Spot</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 ghost-border hover:bg-[var(--color-surface-container-highest)] rounded-xl text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition btn-press"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-5 overflow-y-auto no-scrollbar">

          {error && (
            <div className="bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 animate-alert-pulse">
              <span className="w-2 h-2 bg-[var(--color-error)] rounded-full shrink-0" /> {error}
            </div>
          )}

          {/* User + category */}
          <div className="flex items-center gap-3">
            <img src={user?.profileImage} alt="You" className="w-10 h-10 rounded-full object-cover ghost-border shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--color-on-surface)] truncate">{user?.name}</p>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="text-xs bg-[var(--color-surface-container-highest)] text-[var(--color-primary)] ghost-border rounded-xl px-3 py-1 outline-none font-bold mt-1 max-w-[200px] cursor-pointer focus:border-[var(--color-primary)] transition"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <textarea
            placeholder="What's happening? Describe the alert or place... 📍"
            value={description}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full text-base bg-transparent p-1 outline-none resize-none placeholder:text-[var(--color-on-surface-variant)]/60 text-[var(--color-on-surface)] min-h-[80px] font-medium leading-relaxed"
          />

          {/* Location Name */}
          <input
            type="text"
            placeholder="e.g. Near MG Road, Beside Central Park..."
            value={locationName}
            onChange={(e) => setLocName(e.target.value)}
            className="w-full text-sm outline-none bg-[var(--color-surface-container-highest)] ghost-border rounded-2xl px-5 py-3 font-medium placeholder:text-[var(--color-on-surface-variant)] text-[var(--color-on-surface)] focus:border-[var(--color-primary)] transition"
          />

          {/* Image preview */}
          {preview && (
            <div className="relative rounded-2xl overflow-hidden bg-[var(--color-surface-container-highest)] ghost-border shadow-inner">
              <img src={preview} alt="Preview" className="w-full h-auto max-h-52 object-contain" />
              <button
                type="button"
                onClick={() => { setPreview(null); setImage(null); }}
                className="absolute top-3 right-3 bg-[var(--color-background)]/80 text-[var(--color-on-surface)] p-1.5 rounded-full hover:bg-[var(--color-error)]/80 hover:text-white transition btn-press backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Attachment bar */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex gap-2">
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageChange} />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-xs transition-all btn-press ${
                  preview
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 shadow-[0_0_15px_rgba(122,175,255,0.1)]'
                    : 'bg-[var(--color-surface-container-highest)] ghost-border text-[var(--color-on-surface-variant)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/20'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                {preview ? 'IMAGE ✓' : 'ADD IMAGE'}
              </button>

              <button
                type="button"
                onClick={getLocation}
                disabled={fetchingLoc}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-xs transition-all btn-press disabled:opacity-50 ${
                  location
                    ? 'bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)] border border-[var(--color-tertiary)]/20 shadow-[0_0_15px_rgba(184,255,185,0.1)]'
                    : 'bg-[var(--color-surface-container-highest)] ghost-border text-[var(--color-on-surface-variant)] hover:bg-[var(--color-tertiary)]/10 hover:text-[var(--color-tertiary)] hover:border-[var(--color-tertiary)]/20'
                }`}
              >
                {fetchingLoc ? <Loader2 className="w-4 h-4 animate-spin" /> : location ? <CheckCircle2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                {fetchingLoc ? 'LOCATING...' : location ? 'LOCATION ✓' : 'GET LOCATION'}
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4 mt-2 border-t border-[var(--color-outline-variant)]">
            <button
              type="submit"
              disabled={loading || !image || !location}
              className="gradient-primary text-[var(--color-on-surface)] font-bold px-8 py-3 rounded-3xl glow-primary transition-all duration-200 disabled:opacity-40 disabled:grayscale flex items-center gap-2 text-sm btn-press w-full sm:w-auto justify-center tracking-wide"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'TRANSMIT SPOT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
