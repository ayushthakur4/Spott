import { useState, useContext, useRef } from 'react';
import { X, Image as ImageIcon, MapPin, Loader2 } from 'lucide-react';
import api from '../services/api';
import AuthContext from '../context/AuthContext';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const { user } = useContext(AuthContext);
  const [type, setType] = useState('Police Alert');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          setError('Could not get your location. Please ensure location services are enabled.');
          console.error(err);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to post.');
      return;
    }
    if (!image || !location) {
      setError('Image and Location are required!');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('type', type);
    formData.append('description', description);
    formData.append('image', image);
    formData.append('lat', location.lat);
    formData.append('lng', location.lng);

    try {
      const res = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onPostCreated(res.data);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating post');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setType('Police Alert');
    setDescription('');
    setImage(null);
    setPreview(null);
    setLocation(null);
    setError('');
    onClose();
  };

  const categories = ['Police Alert', 'Accident', 'Viewpoint', 'Picnic', 'Couple Safe', 'Cafe', 'Random'];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Create Post</h2>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto no-scrollbar flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* User Info Header */}
          <div className="flex items-center gap-3">
            <img src={user?.profileImage} alt="User" className="w-10 h-10 rounded-full bg-slate-200" />
            <div>
              <p className="font-semibold text-sm text-slate-800">{user?.name}</p>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2 py-1 outline-none border-none font-medium mt-1 cursor-pointer focus:ring-2 focus:ring-primary-100"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            placeholder="What's happening? Describe the alert or place..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-lg outline-none resize-none placeholder-slate-400 min-h-[100px]"
          />

          {preview && (
            <div className="relative rounded-2xl overflow-hidden bg-slate-100">
              <img src={preview} alt="Upload preview" className="w-full h-auto max-h-64 object-cover" />
              <button
                type="button"
                onClick={() => { setPreview(null); setImage(null); }}
                className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white p-1.5 rounded-full hover:bg-black/80 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-xl font-medium transition text-sm"
            >
              <ImageIcon className="w-4 h-4" />
              {preview ? 'Change Image' : 'Add Image'}
            </button>

            <button
              type="button"
              onClick={getLocation}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition text-sm ${location ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent'
                }`}
            >
              <MapPin className="w-4 h-4" />
              {location ? 'Location Added' : 'Get Location'}
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading || !image || !location}
              className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center min-w-[120px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
