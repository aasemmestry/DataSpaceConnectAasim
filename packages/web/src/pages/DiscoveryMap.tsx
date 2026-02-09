import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axiosConfig';
import 'leaflet/dist/leaflet.css';
import { 
  Globe, Search, X, ChevronRight, Zap, Cpu, Server, 
  Shield, Maximize, Fan, Calendar, Radio, Layers
} from 'lucide-react';

// --- ICONS ---
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

// --- COMPONENTS ---
const GlobalMap = React.memo(({ nodes, greenIcon, blueIcon, onSelectNode, handleRent }: any) => {
  return (
    <MapContainer center={[20, 78]} zoom={4} className="h-full w-full grayscale-[0.2] opacity-95">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {nodes.map((node: any) => (
        <Marker 
          key={node.id} 
          position={[parseFloat(node.latitude) || 0, parseFloat(node.longitude) || 0]}
          icon={node.status === 'Active' ? greenIcon : blueIcon}
          eventHandlers={{ click: () => onSelectNode(node) }}
        >
          <Popup>
            <div className="w-64 p-1 bg-[#0F172A] text-white font-sans">
              <div className="flex justify-between border-b border-white/10 pb-2 mb-3">
                <b className="text-blue-400 text-xs uppercase tracking-wider">{node.name}</b>
                <span className="text-emerald-400 font-bold text-xs">${node.rental_rate}/d</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4 text-[9px] uppercase tracking-wide text-slate-300">
                <div className="flex items-center gap-1">
                   <Zap size={10} className="text-yellow-400" /> 
                   <span>{node.powerKW || '0'} kW Power</span>
                </div>
                <div className="flex items-center gap-1">
                   <Server size={10} className="text-purple-400" /> 
                   <span className="truncate">{node.serverModel ? node.serverModel.split(' ')[0] : 'Generic'}</span>
                </div>
                <div className="flex items-center gap-1">
                   <Maximize size={10} className="text-blue-400" /> 
                   <span>{node.surfaceArea || '0'} sq.ft</span>
                </div>
                <div className="flex items-center gap-1">
                   <Fan size={10} className="text-cyan-400" /> 
                   <span>{node.coolingSystem ? 'Active Cool' : 'Passive'}</span>
                </div>
              </div>

              <button 
                disabled={node.status !== 'Active'}
                onClick={() => handleRent(node.id, node.name)}
                className={`w-full py-3 rounded-xl font-bold uppercase text-[9px] tracking-widest transition-all ${
                  node.status === 'Active' ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                {node.status === 'Active' ? 'Rent Resource' : 'Leased'}
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
});

export const DiscoveryMap = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [nodes, setNodes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Leased'>('All');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  
  const [filters, setFilters] = useState({ 
    minPower: ''
  });

  const fetchMarketplace = async () => {
    try {
      const res = await api.get('/api/discovery/nodes');
      setNodes(res.data);
    } catch (err) { console.error("Fetch error:", err); }
  };

  useEffect(() => { fetchMarketplace(); }, []);

  const handleRent = async (nodeId: number, nodeName: string) => {
    if (window.confirm(`Initialize contract for ${nodeName}?`)) {
      try {
        await api.post('/api/contracts/rent', { nodeId, seekerEmail: user?.email });
        alert("Success! Resource added to your fleet.");
        setSelectedNode(null);
        fetchMarketplace(); 
      } catch (err: any) {
        alert(`Rental failed: ${err.response?.data?.error || "Error"}`);
      }
    }
  };

  const filteredNodes = useMemo(() => {
    return (nodes || []).filter(n => {
      const term = searchTerm.toLowerCase();
      // FIX: Added 'n.country' to the search logic
      const matchesSearch = 
        (n.name || "").toLowerCase().includes(term) || 
        (n.zone || "").toLowerCase().includes(term) ||
        (n.country || "").toLowerCase().includes(term); // <--- THIS LINE WAS MISSING

      const matchesStatus = statusFilter === 'All' ? true : statusFilter === 'Active' ? n.status === 'Active' : n.status !== 'Active';
      const matchesPower = !filters.minPower || (n.powerKW >= parseFloat(filters.minPower));
      
      return matchesSearch && matchesStatus && matchesPower;
    });
  }, [nodes, searchTerm, statusFilter, filters]);

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden font-sans">
      {/* HEADER */}
      <header className="h-20 bg-[#0F172A] border-b border-white/10 flex items-center justify-between px-8 z-[1001] shadow-2xl">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black text-white uppercase italic tracking-tighter">Global Discovery</h1>
          <div className="hidden md:flex gap-1 bg-slate-900 p-1 rounded-lg border border-white/5">
             {(['All', 'Active', 'Leased'] as const).map(s => (
               <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 rounded text-[9px] font-black uppercase ${statusFilter === s ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>{s}</button>
             ))}
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14}/>
          <input 
            placeholder="Search Region or Country..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-900 border border-white/5 pl-10 pr-4 py-2 rounded-xl text-xs text-white w-64 outline-none focus:border-blue-500/50"
          />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative bg-[#0B0F1A]">
        {/* MAP */}
        <GlobalMap nodes={filteredNodes} greenIcon={greenIcon} blueIcon={blueIcon} onSelectNode={setSelectedNode} handleRent={handleRent} />

        {/* DETAILED SIDE PANEL */}
        {selectedNode && (
          <div className="absolute top-0 right-0 h-full w-[400px] bg-[#0B0F1A]/95 backdrop-blur-xl border-l border-white/10 z-[1002] shadow-2xl animate-in slide-in-from-right duration-300">
            
            {/* Dynamic Header Image */}
            <div className="h-48 w-full relative">
              <img 
                src={selectedNode.image_url || "https://images.unsplash.com/photo-1558494949-efc535b5c4c1?q=80&w=1000&auto=format&fit=crop"} 
                className="w-full h-full object-cover opacity-80"
                alt="Datacenter"
                onError={(e: any) => e.target.src = "https://images.unsplash.com/photo-1558494949-efc535b5c4c1?q=80&w=1000&auto=format&fit=crop"}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B0F1A]"></div>
              
              <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-all backdrop-blur-md border border-white/10">
                <X size={18} />
              </button>
            </div>

            <div className="p-8 -mt-12 relative z-10 h-[calc(100%-12rem)] flex flex-col overflow-y-auto custom-scrollbar">
              
              {/* Header Status */}
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${selectedNode.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                  {selectedNode.status}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedNode.zone}</span>
              </div>

              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-1">{selectedNode.name}</h2>
              <p className="text-[10px] text-blue-500 font-mono mb-8">ID: {selectedNode.node_hash}</p>

              {/* PRIMARY SPECS Grid */}
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Technical Specifications</h3>
              <div className="grid grid-cols-1 gap-3 mb-8">
                <SpecCard icon={Zap} label="Power Capacity" value={`${selectedNode.powerKW || 0} kW`} />
                <SpecCard icon={Server} label="Server Model" value={selectedNode.serverModel || 'Standard Config'} />
                <SpecCard icon={Maximize} label="Land Size" value={`${selectedNode.surfaceArea || 0} sq.ft`} />
                <SpecCard icon={Fan} label="Cooling System" value={selectedNode.coolingSystem ? 'Active Cooling' : 'Passive Air'} />
                <SpecCard icon={Calendar} label="Established" value={selectedNode.constructionYear || 'N/A'} />
                <SpecCard icon={Radio} label="Network Operator" value={selectedNode.networkOperator || 'DataSpace Connect'} />
              </div>

              {/* FEATURES TAGS */}
              {(selectedNode.securityFeatures?.length > 0 || selectedNode.uses?.length > 0) && (
                <div className="mb-8">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Infrastructure Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.securityFeatures?.map((feat: string, i: number) => (
                      <span key={`sec-${i}`} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[9px] font-bold text-blue-400 uppercase flex items-center gap-1">
                        <Shield size={10} /> {feat}
                      </span>
                    ))}
                    {selectedNode.uses?.map((use: string, i: number) => (
                      <span key={`use-${i}`} className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[9px] font-bold text-purple-400 uppercase flex items-center gap-1">
                        <Layers size={10} /> {use}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* PRICING CARD */}
              <div className="mt-auto p-6 bg-gradient-to-br from-blue-600/10 to-blue-900/10 border border-blue-500/20 rounded-3xl">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-black text-blue-400 uppercase">Daily Rate</p>
                  <p className="text-2xl font-black text-white italic">${selectedNode.rental_rate}</p>
                </div>
                <button 
                  disabled={selectedNode.status !== 'Active'}
                  onClick={() => handleRent(selectedNode.id, selectedNode.name)}
                  className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg transition-all ${
                    selectedNode.status === 'Active' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {selectedNode.status === 'Active' ? 'Initialize Contract' : 'Currently Unavailable'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable Spec Card Component
const SpecCard = ({ icon: Icon, label, value }: any) => (
  <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl flex items-center gap-4 hover:bg-white/[0.05] transition-colors">
    <div className="p-2.5 bg-slate-800 rounded-lg text-slate-400">
      <Icon size={16} />
    </div>
    <div>
      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-xs font-black text-white uppercase">{value}</p>
    </div>
  </div>
);