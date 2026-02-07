import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axiosConfig';
import 'leaflet/dist/leaflet.css';
import { Globe, LogOut, Search, LayoutGrid } from 'lucide-react';

// Standard Leaflet icons with different colors
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

export const DiscoveryMap = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Leased'>('All');

  const fetchMarketplace = async () => {
    try {
      const res = await api.get('/api/discovery/nodes');
      setNodes(res.data);
    } catch (err) {
      console.error("Discovery fetch error:", err);
    }
  };

  useEffect(() => { 
    fetchMarketplace(); 
  }, []);

  const handleRent = async (nodeId: number, nodeName: string) => {
    if (window.confirm(`Initialize contract for ${nodeName}?`)) {
      try {
        await api.post('/api/contracts/rent', { nodeId, seekerEmail: user?.email });
        alert("Success! Resource added to your fleet.");
        fetchMarketplace(); // Refresh state immediately
      } catch (err: any) {
        alert(`Rental failed: ${err.response?.data?.error || "Error"}`);
      }
    }
  };

  const filteredNodes = (nodes || []).filter(n => {
    const matchesSearch = (n.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (n.zone || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : 
                          statusFilter === 'Active' ? n.status === 'Active' : n.status !== 'Active';
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <header className="h-24 bg-[#0F172A] border-b border-white/10 flex items-center justify-between px-10 z-[1001] shadow-2xl flex-shrink-0">
        <div className="flex items-center space-x-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">Marketplace</h1>
              <span className="px-2 py-0.5 bg-emerald-500 rounded text-[8px] font-black text-white uppercase">Live</span>
            </div>
            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-0.5">
              Available: {nodes.filter(n => n.status === 'Active').length} | Leased: {nodes.filter(n => n.status !== 'Active').length}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-slate-900 p-1 rounded-xl border border-white/5 flex gap-1">
            {(['All', 'Active', 'Leased'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === status ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative hidden lg:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
            <input 
              placeholder="Search Mumbai, Surat, NYC..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-white/5 pl-12 pr-6 py-3 rounded-2xl text-xs text-white w-64 outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 bg-[#0F172A] border-r border-white/5 overflow-y-auto custom-scrollbar hidden lg:block">
          <div className="p-6 space-y-4">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Available Infrastructure</h2>
            {filteredNodes.length > 0 ? filteredNodes.map((node) => (
              <div 
                key={node.id}
                className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl hover:bg-blue-600/10 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                  <b className="text-white text-xs uppercase italic group-hover:text-blue-400">{node.name}</b>
                  <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase ${node.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {node.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>{node.zone}</span>
                  <span className="text-white">${node.rental_rate}/d</span>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center text-slate-600 text-[10px] font-black uppercase italic">
                No matching resources
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 relative">
          <MapContainer center={[20, 78]} zoom={4} className="h-full w-full grayscale-[0.2] opacity-95">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filteredNodes.map((node: any) => (
              <Marker 
                key={node.id} 
                position={[parseFloat(node.latitude) || 0, parseFloat(node.longitude) || 0]}
                icon={node.status === 'Active' ? greenIcon : blueIcon}
              >
                <Popup>
                  <div className="w-72 p-1 bg-[#0F172A] text-white">
                    <div className="flex justify-between border-b border-white/5 pb-3 mb-4">
                      <b className="text-blue-500 text-sm uppercase">{node.name}</b>
                      <span className="text-emerald-500 font-black text-sm">${node.rental_rate}/d</span>
                    </div>
                    <button 
                      disabled={node.status !== 'Active'}
                      onClick={() => handleRent(node.id, node.name)}
                      className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] transition-all ${
                        node.status === 'Active' ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {node.status === 'Active' ? 'Rent Now' : 'Currently Leased'}
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};
