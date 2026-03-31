import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useMemo } from 'react';

// Fix Leaflet icons issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const getCustomIcon = (type) => {
  let color = 'blue';
  switch (type) {
    case 'Police Alert': color = 'blue'; break;
    case 'Accident': color = 'red'; break;
    case 'Viewpoint': color = 'green'; break;
    case 'Picnic': color = 'orange'; break;
    case 'Couple Safe': color = 'violet'; break;
    case 'Cafe': color = 'gold'; break;
    default: color = 'grey';
  }

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const MapPreview = ({ posts }) => {
  // Center map on the first post, or a default location (e.g. India)
  const center = useMemo(() => {
    if (posts && posts.length > 0) {
      return [posts[0].location.lat, posts[0].location.lng];
    }
    return [20.5937, 78.9629];
  }, [posts]);

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden shadow-soft border border-slate-200 sticky top-20">
      <MapContainer center={center} zoom={posts?.length > 0 ? 12 : 5} scrollWheelZoom={true} className="w-full h-full relative z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {posts?.map((post) => (
          <Marker 
            key={post._id} 
            position={[post.location.lat, post.location.lng]}
            icon={getCustomIcon(post.type)}
          >
            <Popup className="rounded-xl overflow-hidden">
              <div className="flex flex-col gap-2 min-w-[150px]">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-1 rounded w-fit">
                  {post.type}
                </span>
                <p className="text-sm font-medium text-slate-700 leading-tight">
                  {post.description?.substring(0, 50)}...
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <img src={post.user?.profileImage} alt="User" className="w-5 h-5 rounded-full" />
                  <span className="text-xs text-slate-500 font-semibold">{post.user?.name}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapPreview;
