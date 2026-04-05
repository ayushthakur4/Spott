import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useMemo } from 'react';

const getCustomIcon = (type) => {
  let colorClass = 'bg-[var(--color-primary)]';
  let shadowClass = 'shadow-[0_0_15px_rgba(122,175,255,0.8)]';
  let pulseClass = '';

  switch (type) {
    case 'Police Alert':
    case 'Accident':
      colorClass = 'bg-[var(--color-error)]';
      shadowClass = 'shadow-[0_0_15px_rgba(255,180,171,0.8)]';
      pulseClass = 'marker-pulse-error bg-[var(--color-error)]';
      break;
    case 'Viewpoint':
    case 'Picnic':
    case 'Couple Safe':
      colorClass = 'bg-[var(--color-tertiary)]';
      shadowClass = 'shadow-[0_0_15px_rgba(184,255,185,0.8)]';
      break;
    case 'Cafe':
      colorClass = 'bg-[var(--color-secondary)]';
      shadowClass = 'shadow-[0_0_15px_rgba(254,148,0,0.8)]';
      break;
    default:
      colorClass = 'bg-[var(--color-primary)]';
  }

  const html = `
    <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
      ${pulseClass ? `<div class="${pulseClass} absolute rounded-full min-w-[30px] min-h-[30px] pointer-events-none"></div>` : ''}
      <div class="relative z-10 w-4 h-4 ${colorClass} rounded-full border-2 border-[var(--color-background)] ${shadowClass}"></div>
    </div>
  `;

  return new L.DivIcon({
    html: html,
    className: 'custom-leaflet-marker',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -10]
  });
};

const MapPreview = ({ posts }) => {
  const center = useMemo(() => {
    if (posts && posts.length > 0) {
      return [posts[0].location.lat, posts[0].location.lng];
    }
    return [20.5937, 78.9629]; // Default: India
  }, [posts]);

  return (
    <div className="w-full h-full">
      {/* 
        The map container is the absolute background for Home.
        It uses CartoDB Dark Matter tiles by default, but allows 
        switching to Satellite via the top-right control.
      */}
      <MapContainer 
        center={center} 
        zoom={posts?.length > 0 ? 12 : 5} 
        scrollWheelZoom={true} 
        zoomControl={false} 
        className="w-full h-full relative z-0 bg-[#0e0e0e]"
      >
        <LayersControl position="topleft">
          <LayersControl.BaseLayer checked name="Night Vision">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite Uplink">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        
        {posts?.map((post) => (
          <Marker 
            key={post._id} 
            position={[post.location.lat, post.location.lng]}
            icon={getCustomIcon(post.type)}
          >
            <Popup className="custom-popup">
              <div className="flex flex-col gap-2 min-w-[160px] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] p-3 rounded-xl border border-white/10 ghost-border specular-edge shadow-2xl backdrop-blur-xl">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-1 rounded w-fit">
                  {post.type}
                </span>
                <p className="text-xs font-medium text-[var(--color-on-surface)] leading-tight">
                  {post.description?.substring(0, 50)}...
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapPreview;
