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
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-slide-up">

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 gradient-brand rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-display font-bold text-base text-slate-900">New Spot</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition btn-press"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-4 overflow-y-auto no-scrollbar">

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" /> {error}
            </div>
          )}

          {/* User + category */}
          <div className="flex items-center gap-3">
            <img src={user?.profileImage} alt="You" className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-200 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="text-xs bg-primary-50 text-primary-600 border border-primary-200 rounded-lg px-2 py-0.5 outline-none font-bold mt-0.5 cursor-pointer focus:ring-1 focus:ring-primary-300 transition"
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
            className="w-full text-[15px] outline-none resize-none placeholder-slate-400 min-h-[80px] font-medium leading-relaxed"
          />

          {/* Location Name */}
          <input
            type="text"
            placeholder="e.g. Near MG Road, Beside Central Park..."
            value={locationName}
            onChange={(e) => setLocName(e.target.value)}
            className="w-full text-sm outline-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium placeholder-slate-400 focus:border-primary-300 focus:ring-1 focus:ring-primary-300 transition"
          />

          {/* Image preview */}
          {preview && (
            <div className="relative rounded-2xl overflow-hidden bg-slate-100">
              <img src={preview} alt="Preview" className="w-full h-auto max-h-52 object-cover" />
              <button
                type="button"
                onClick={() => { setPreview(null); setImage(null); }}
                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition btn-press"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Attachment bar */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageChange} />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all btn-press ${
                preview
                  ? 'bg-primary-100 text-primary-600 border border-primary-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-primary-50 hover:text-primary-600'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              {preview ? '✓ Image' : 'Add Image'}
            </button>

            <button
              type="button"
              onClick={getLocation}
              disabled={fetchingLoc}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all btn-press disabled:opacity-50 ${
                location
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'
              }`}
            >
              {fetchingLoc ? <Loader2 className="w-4 h-4 animate-spin" /> : location ? <CheckCircle2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
              {fetchingLoc ? 'Locating...' : location ? 'Location ✓' : 'Get Location'}
            </button>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-1 border-t border-slate-100 pb-1">
            <button
              type="submit"
              disabled={loading || !image || !location}
              className="gradient-brand text-white font-bold px-6 py-2.5 rounded-2xl shadow-glow-sm hover:shadow-glow transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-sm btn-press min-w-[110px] justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '📍 Post Spot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
