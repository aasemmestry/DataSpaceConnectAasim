import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store/index.js';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationButton = () => {
  const map = useMap();
  
  const handleLocation = () => {
    map.locate().on('locationfound', (e) => {
      map.flyTo(e.latlng, 13);
    });
  };

  return (
    <button 
      onClick={handleLocation}
      className="absolute bottom-6 right-6 z-[1000] bg-white p-3 rounded-full shadow-lg border hover:bg-gray-50 flex items-center justify-center"
      title="Center on My Location"
    >
      📍
    </button>
  );
};

export const MapComponent: React.FC = () => {
  const { datacenters } = useSelector((state: RootState) => state.discovery);
  const navigate = useNavigate();

  return (
    <div className="h-full w-full relative">
      <MapContainer center={[51.505, -0.09]} zoom={4} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {datacenters.map(dc => (
          <Marker key={dc.id} position={[dc.latitude, dc.longitude]}>
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-lg">{dc.name}</h3>
                <p className="text-gray-600 text-sm">Capacity: {dc.powerCapacityKW} kW</p>
                <p className="text-gray-600 text-sm mt-1">Servers: {dc.serverModels.join(', ')}</p>
                <button 
                  onClick={() => navigate(`/datacenter/${dc.id}`)}
                  className="mt-2 text-blue-600 font-bold text-sm hover:underline"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        <LocationButton />
      </MapContainer>
    </div>
  );
};

