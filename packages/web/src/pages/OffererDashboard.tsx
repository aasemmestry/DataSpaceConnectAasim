import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/axiosConfig';
import { 
  LayoutDashboard, Server, PlusCircle, Activity, 
  LogOut, Globe, ShieldCheck, Cpu, Trash2, Search, DollarSign
} from 'lucide-react';

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

export const OffererDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<any>();
  
  // Local state to ensure we are getting fresh data from the Offerer API
  const [nodes, setNodes] = useState<any[]>([]);
  const [stats, setStats] = useState({ nodeCount: 0, throughput: "0", securityScore: "0", totalRevenue: "0.00" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({ 
    name: '', zone: '', capacity: '', latitude: '', longitude: '',
    tier: 'General Purpose', os: 'Ubuntu 22.04 LTS', bandwidth: '1 Gbps', rental_rate: '1.50'
  });

  // Fetch data directly from the Offerer-specific routes
  const loadDashboardData = async () => {
    if (!user?.email) return;
    try {
      const [nodesRes, statsRes] = await Promise.all([
        api.get(`/api/offerer/nodes?email=${user.email}`),
        api.get(`/api/offerer/stats?email=${user.email}`)
      ]);
      setNodes(nodesRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("OFFERER_DASHBOARD_LOAD_ERROR:", err);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000); // Fast refresh for testing
    return () => clearInterval(interval);
  }, [user?.email]);

  const filteredNodes = nodes.filter(node => 
    (node.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (node.zone || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeploy = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsDeploying(true);
  try {
    // Spread formData and add the user email
    await api.post('/api/offerer/nodes', { 
      ...formData, 
      email: user?.email 
    });
    setIsDeploying(false);
    setIsModalOpen(false);
    loadDashboardData();
  } catch (err) {
    setIsDeploying(false);
    alert("Deployment failed.");
  }
};

  const deleteNode = async (id: number) => {
    if(window.confirm("Decommission this resource?")) {
      try {
        await api.delete(`/api/offerer/nodes/${id}`);
        loadDashboardData();
      } catch (err) {
        alert("Action failed.");
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0B0F1A]/80 backdrop-blur-xl z-10 flex-shrink-0">
          <div className="flex items-center space-x-8">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Operational Overview</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest">Tenant: {user?.companyName?.toUpperCase()}</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
              <input 
                placeholder="Filter managed nodes..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="bg-slate-900 border border-white/5 pl-10 pr-4 py-2 rounded-xl text-xs text-white w-64 outline-none focus:border-blue-500/50" 
              />
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/25">
            <PlusCircle size={18} /><span>Deploy Resource</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#0B0F1A]">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
            <StatCard label="Managed Nodes" value={stats.nodeCount.toString()} icon={Server} color="text-blue-400" />
            <StatCard label="Total Revenue" value={`$${stats.totalRevenue}`} icon={DollarSign} color="text-emerald-400" />
            <StatCard label="Edge Throughput" value={stats.throughput} icon={Activity} color="text-blue-400" />
            <StatCard label="Security Score" value={stats.securityScore} icon={ShieldCheck} color="text-purple-400" />
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="bg-[#161B2B] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
                <Globe size={18} className="text-blue-500" />
                <h3 className="font-bold text-white uppercase text-xs tracking-widest">Global Edge Presence</h3>
              </div>
              <div className="h-[400px]">
                <MapContainer center={[21, 78]} zoom={5} className="h-full w-full grayscale-[0.8] invert-[0.9] opacity-80">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {filteredNodes.map((node: any) => (
                    <Marker 
                      key={node.id} 
                      position={[parseFloat(node.latitude) || 0, parseFloat(node.longitude) || 0]} 
                      icon={node.status === 'Active' ? greenIcon : blueIcon}
                    >
                      <Popup>
                        <div className="font-sans">
                          <b className="text-blue-600 block">{node.name}</b>
                          <span className="text-[10px] text-slate-500 uppercase">{node.status}</span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>

            <div className="bg-[#161B2B] border border-white/5 rounded-3xl shadow-2xl overflow-hidden mb-12">
                <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                  <h3 className="font-bold text-white text-xs uppercase tracking-widest">Infrastructure Ledger</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 text-[10px] uppercase text-slate-500 font-bold tracking-widest">
                            <tr>
                              <th className="px-8 py-4">Node Identity</th>
                              <th className="px-8 py-4">Zone</th>
                              <th className="px-8 py-4">State</th>
                              <th className="px-8 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredNodes.length > 0 ? filteredNodes.map((node: any) => (
                              <TableRow key={node.id} node={node} onDelete={() => deleteNode(node.id)} />
                            )) : (
                              <tr>
                                <td colSpan={4} className="px-8 py-20 text-center text-slate-600 uppercase text-[10px] font-black tracking-[0.2em]">
                                  No nodes detected in your management pool
                                </td>
                              </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#161B2B] border border-white/10 w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl">
            <h3 className="text-2xl font-black text-white italic uppercase mb-8">Provision Resource</h3>
            <form className="grid grid-cols-2 gap-6" onSubmit={handleDeploy}>
              <FormInput label="Node Label" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} />
              <FormInput label="Zone" value={formData.zone} onChange={(v: string) => setFormData({...formData, zone: v})} />
              <FormInput label="Latitude" value={formData.latitude} onChange={(v: string) => setFormData({...formData, latitude: v})} />
              <FormInput label="Longitude" value={formData.longitude} onChange={(v: string) => setFormData({...formData, longitude: v})} />
              <FormInput label="Daily Rate ($)" value={formData.rental_rate} onChange={(v: string) => setFormData({...formData, rental_rate: v})} />
              <FormInput label="Capacity (GB)" type="number" value={formData.capacity} onChange={(v: string) => setFormData({...formData, capacity: v})} />
              <button type="submit" disabled={isDeploying} className="col-span-2 py-5 bg-blue-600 text-white font-black uppercase rounded-2xl shadow-lg shadow-blue-600/30">
                {isDeploying ? 'Syncing...' : 'Deploy to Edge'}
              </button>
            </form>
            <button onClick={() => setIsModalOpen(false)} className="mt-4 text-slate-500 text-xs uppercase w-full font-bold">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-[#161B2B] border border-white/5 p-6 rounded-2xl flex items-center justify-between shadow-xl">
    <div><p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">{label}</p><p className="text-2xl font-black text-white">{value}</p></div>
    <div className={`p-4 rounded-xl bg-slate-900/50 ${color}`}><Icon size={24} /></div>
  </div>
);

const NavItem = ({ icon: Icon, label, active = false }: any) => (
  <div className={`flex items-center space-x-4 px-6 py-4 rounded-xl cursor-pointer transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
    <Icon size={18} /> <span className="font-bold text-xs uppercase tracking-widest">{label}</span>
  </div>
);

const TableRow = ({ node, onDelete }: any) => (
  <tr className="hover:bg-white/[0.03] transition-colors">
    <td className="px-8 py-5">
      <div className="flex flex-col">
        <span className="text-white font-bold text-sm">{node.name}</span>
        <span className="font-mono text-[9px] text-blue-500 uppercase tracking-tighter">{node.node_hash}</span>
      </div>
    </td>
    <td className="px-8 py-5 text-xs text-slate-400 uppercase">{node.zone}</td>
    <td className="px-8 py-5">
      <span className={`px-3 py-1 text-[9px] font-black rounded-lg border uppercase tracking-widest ${node.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-blue-500/10 text-blue-500 border-blue-500/30'}`}>
        {node.status}
      </span>
    </td>
    <td className="px-8 py-5 text-right">
      <button onClick={onDelete} className="text-slate-600 hover:text-red-500 transition-colors p-2"><Trash2 size={16} /></button>
    </td>
  </tr>
);

const FormInput = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required className="w-full px-5 py-3 rounded-xl bg-[#0F172A] border border-white/5 text-white text-xs outline-none focus:border-blue-500/50" />
  </div>
);