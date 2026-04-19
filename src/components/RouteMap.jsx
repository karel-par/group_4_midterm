import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const originIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
});

const destIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
});

export default function RouteMap({ originCoords, destCoords, geometry, originName, destName }) {
  // geometry.coordinates is [lng, lat] — Leaflet needs [lat, lng]
  const polylinePoints = geometry?.coordinates?.map(([lng, lat]) => [lat, lng]) || [];
  const center = originCoords || [14.2116, 121.1653];

  return (
    <MapContainer center={center} zoom={11} style={{ height: '420px', width: '100%', borderRadius: '12px' }} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {originCoords && (
        <Marker position={originCoords} icon={originIcon}>
          <Popup><strong>Origin:</strong> {originName}</Popup>
        </Marker>
      )}
      {destCoords && (
        <Marker position={destCoords} icon={destIcon}>
          <Popup><strong>Destination:</strong> {destName}</Popup>
        </Marker>
      )}
      {polylinePoints.length > 0 && (
        <Polyline positions={polylinePoints} color="#2563eb" weight={5} opacity={0.8} />
      )}
    </MapContainer>
  );
}