import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/axiosConfig';
import { 
  LayoutDashboard, Server, PlusCircle, Activity, 
  LogOut, Globe, ShieldCheck, Cpu, Trash2, Search, DollarSign,
  TrendingUp, TrendingDown, Calendar, Image as ImageIcon, Edit2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, ComposedChart, Line, Area
} from 'recharts';

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

// Memoized Map Component
const GlobalMap = React.memo(({ nodes, greenIcon, blueIcon }: any) => {
  return (
    <MapContainer center={[21, 78]} zoom={3} className="h-full w-full grayscale-[0.8] invert-[0.9] opacity-80">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {nodes.map((node: any) => (
        <Marker 
          key={node.id} 
          position={[parseFloat(node.latitude) || 0, parseFloat(node.longitude) || 0]} 
          icon={node.status === 'Active' ? greenIcon : blueIcon}
        >
          <Popup>
            <div className="font-sans w-48">
              <b className="text-blue-600 block mb-1">{node.name}</b>
              {/* NEW: Show image in popup if available */}
              {node.image_url && (
                <img 
                  src={node.image_url} 
                  alt="Node" 
                  className="w-full h-24 object-cover rounded-lg mb-2 border border-slate-200"
                  onError={(e:any) => e.target.style.display='none'}
                />
              )}
              <span className="text-[10px] text-slate-500 uppercase font-bold">{node.status}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
});

export const OffererDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<any>();
  
  // Data State
  const [nodes, setNodes] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, totalPages: 1, total: 0 });
  const [stats, setStats] = useState({ nodeCount: 0, throughput: "0", securityScore: "0", totalRevenue: "0.00" });
  const [revenueHistory, setRevenueHistory] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState('30D');

  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalStep, setModalStep] = useState(1);
  
  // NEW: Edit & File Upload State
  const [editingNodeId, setEditingNodeId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const initialFormState = { 
    name: '', zone: '', capacity: '', latitude: '', longitude: '',
    tier: 'General Purpose', os: 'Ubuntu 22.04 LTS', bandwidth: '1 Gbps', rental_rate: '1.50',
    serverModel: 'HPE ProLiant DL380 Gen10', 
    powerKW: '', surfaceArea: '', constructionYear: new Date().getFullYear().toString(), 
    networkOperator: '', country: '', postcode: '', townCity: '', address: '', additionalAddress: '',
    coolingSystem: false, heatNetwork: false, electricityGenerator: false,
    uses: [] as string[], securityFeatures: [] as string[],
    image_url: '' // Keep as backup
  };

  const [formData, setFormData] = useState(initialFormState);

  // Constants
  const datacenterUses = ['Cloud Services', 'Colocation', 'AI & Machine Learning', 'Big Data', 'High Performance Computing', 'Web Hosting'];
  const securityFeaturesList = ['Firewall', 'IDS', 'IPS', 'CCTV', 'Biometric Access', '24/7 On-site Security'];
  const serverModels = ['HPE ProLiant DL380 Gen10', 'HPE ProLiant DL360 Gen10', 'HPE ProLiant ML350 Gen10', 'HPE ProLiant DL580 Gen10', 'Dell PowerEdge R740', 'Lenovo ThinkSystem SR650'];

  // Mock History Generator
  const generateHistory = (days: number) => {
    const data = [];
    const now = new Date();
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.floor(Math.random() * 500) + 200,
        yield: Math.floor(Math.random() * 80) + 10,
      });
    }
    return data;
  };

  useEffect(() => {
    setRevenueHistory(generateHistory(timeframe === '7D' ? 7 : timeframe === '30D' ? 30 : 90));
  }, [timeframe]);

  // Data Fetching
  const loadDashboardData = async (page = pagination.page) => {
    if (!user?.email) return;
    try {
      const [nodesRes, statsRes] = await Promise.all([
        api.get(`/api/offerer/nodes?page=${page}&limit=5`),
        api.get(`/api/offerer/stats`)
      ]);
      setNodes(nodesRes.data.nodes);
      setPagination(nodesRes.data.pagination);
      setStats(statsRes.data);
    } catch (err) {
      console.error("OFFERER_DASHBOARD_LOAD_ERROR:", err);
    }
  };

  useEffect(() => {
    loadDashboardData(pagination.page);
    const interval = setInterval(() => loadDashboardData(pagination.page), 10000); 
    return () => clearInterval(interval);
  }, [user?.email, pagination.page]);

  // --- HANDLERS ---

  const handleCheckboxChange = (field: 'uses' | 'securityFeatures', value: string) => {
    setFormData(prev => {
      const current = prev[field];
      return { ...prev, [field]: current.includes(value) ? current.filter(v => v !== value) : [...current, value] };
    });
  };

  const openDeployModal = () => {
    setFormData(initialFormState);
    setEditingNodeId(null);
    setSelectedFile(null);
    setModalStep(1);
    setIsModalOpen(true);
  };

  // NEW: Pre-fill form for Editing
  const openEditModal = (node: any) => {
    setFormData({
      ...node,
      capacity: String(node.capacity),
      rental_rate: String(node.rental_rate),
      latitude: String(node.latitude),
      longitude: String(node.longitude),
      powerKW: String(node.powerKW || ''),
      surfaceArea: String(node.surfaceArea || ''),
      constructionYear: String(node.constructionYear || ''),
      // Ensure arrays exist
      uses: node.uses || [],
      securityFeatures: node.securityFeatures || [],
      coolingSystem: Boolean(node.coolingSystem),
      heatNetwork: Boolean(node.heatNetwork),
      electricityGenerator: Boolean(node.electricityGenerator),
    });
    setEditingNodeId(node.id);
    setSelectedFile(null);
    setModalStep(1);
    setIsModalOpen(true);
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalStep < 3) {
      setModalStep(modalStep + 1);
      return;
    }

    setIsDeploying(true);

    // NEW: Convert to FormData for File Upload
    const data = new FormData();
    
    // Append standard fields
    Object.keys(formData).forEach(key => {
      const val = (formData as any)[key];
      if (key === 'image_url') return; // Skip URL if we have a file, or handle separately
      
      if (Array.isArray(val)) {
        val.forEach(v => data.append(key, v)); // Append array items individually for Multer
      } else {
        data.append(key, String(val));
      }
    });

    // Append File
    if (selectedFile) {
      data.append('image', selectedFile);
    } else if (formData.image_url) {
      data.append('image_url', formData.image_url); // Keep existing URL if no new file
    }

    try {
      if (editingNodeId) {
        // UPDATE
        await api.put(`/api/offerer/nodes/${editingNodeId}`, data);
        alert("Resource Updated Successfully");
      } else {
        // CREATE
        await api.post('/api/offerer/nodes', data);
        alert("Resource Deployed Successfully");
      }
      
      setIsDeploying(false);
      setIsModalOpen(false);
      setModalStep(1);
      loadDashboardData();
    } catch (err: any) {
      setIsDeploying(false);
      alert("Operation failed: " + (err.response?.data?.error || "Unknown error"));
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

  const filteredNodes = useMemo(() => {
    return (nodes || []).filter(node => 
      (node.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (node.zone || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [nodes, searchTerm]);

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      {/* HEADER */}
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
          <div className="flex items-center space-x-4">
             <button onClick={openDeployModal} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/25">
               <PlusCircle size={18} /><span>Deploy Resource</span>
             </button>
             <button onClick={() => dispatch(logout())} className="p-2.5 text-slate-400 hover:text-red-400 transition-colors"><LogOut size={20}/></button>
          </div>
      </header>

      {/* DASHBOARD CONTENT */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#0B0F1A]">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
            <StatCard label="Managed Nodes" value={stats.nodeCount.toString()} icon={Server} color="text-blue-400" />
            <StatCard label="Total Revenue" value={`$${stats.totalRevenue}`} icon={DollarSign} color="text-emerald-400" trend="+12.5%" />
            <StatCard label="Edge Throughput" value={stats.throughput} icon={Activity} color="text-blue-400" trend="+4.2%" />
            <StatCard label="Security Score" value={stats.securityScore} icon={ShieldCheck} color="text-purple-400" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Chart */}
            <div className="lg:col-span-2 bg-[#161B2B] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-sm font-black text-white uppercase flex items-center gap-2"><TrendingUp size={16} className="text-emerald-500" /> Revenue Analytics</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Yield Performance across edge nodes</p>
                </div>
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                  {['7D', '30D', '90D'].map((t) => (
                    <button key={t} onClick={() => setTimeframe(t)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${timeframe === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={revenueHistory} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} minTickGap={30}/>
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}/>
                    <Tooltip contentStyle={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', fontSize: '10px' }} cursor={{ stroke: '#ffffff10', strokeWidth: 2 }}/>
                    <Area type="monotone" dataKey="revenue" fill="url(#colorRev)" stroke="none" />
                    <Bar dataKey="revenue" barSize={20} radius={[4, 4, 0, 0]}><Cell fill="#3B82F6" /></Bar>
                    <Line type="monotone" dataKey="yield" stroke="#10B981" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Side Stats */}
            <div className="bg-[#161B2B] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500"><DollarSign size={20} /></div>
                <div><h4 className="text-[10px] font-black text-white uppercase tracking-widest">Active Yield</h4><p className="text-xl font-black text-white italic tracking-tighter">${(parseFloat(stats.totalRevenue) / 30).toFixed(2)}/day</p></div>
              </div>
              <div className="space-y-6">
                <div><div className="flex justify-between text-[10px] font-bold uppercase mb-2 text-slate-500"><span>Fleet Efficiency</span><span className="text-blue-400">94%</span></div><div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[94%] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div></div></div>
                <div><div className="flex justify-between text-[10px] font-bold uppercase mb-2 text-slate-500"><span>Uptime SLA</span><span className="text-emerald-400">99.9%</span></div><div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[99.9%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div></div></div>
              </div>
              <div className="mt-8 p-6 bg-white/5 border border-white/5 rounded-3xl">
                <div className="flex items-center gap-3 text-emerald-500 mb-2"><TrendingUp size={16} /><span className="text-[10px] font-black uppercase">Revenue Forecast</span></div>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">Projected $12,400.00 revenue by end of quarter based on current growth.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="bg-[#161B2B] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
                <Globe size={18} className="text-blue-500" />
                <h3 className="font-bold text-white uppercase text-xs tracking-widest">Global Edge Presence</h3>
              </div>
              <div className="h-[400px]">
                <GlobalMap nodes={filteredNodes} greenIcon={greenIcon} blueIcon={blueIcon} />
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
                            {nodes.length > 0 ? nodes.map((node: any) => (
                              <TableRow 
                                key={node.id} 
                                node={node} 
                                onEdit={() => openEditModal(node)} // NEW
                                onDelete={() => deleteNode(node.id)} 
                              />
                            )) : (
                              <tr>
                                <td colSpan={4} className="px-8 py-20 text-center text-slate-600 uppercase text-[10px] font-black tracking-[0.2em]">
                                  No nodes detected in your management pool
                                </td>
                              </tr>
                            )}
                        </tbody>
                    </table>
                    
                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="px-8 py-6 bg-slate-900/30 border-t border-white/5 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Showing <span className="text-white">{nodes.length}</span> of <span className="text-white">{pagination.total}</span> resources</p>
                        <div className="flex gap-2">
                          <button disabled={pagination.page === 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">Previous</button>
                          <div className="flex gap-1">{[...Array(pagination.totalPages)].map((_, i) => <button key={i} onClick={() => setPagination(p => ({ ...p, page: i + 1 }))} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${pagination.page === i + 1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:text-white'}`}>{i + 1}</button>)}</div>
                          <button disabled={pagination.page === pagination.totalPages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">Next</button>
                        </div>
                      </div>
                    )}
                </div>
            </div>
          </div>
      </div>

      {/* DEPLOY / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#161B2B] border border-white/10 w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-white italic uppercase">
                {editingNodeId ? 'Edit Resource' : 'Provision Resource'}
              </h3>
              <div className="flex gap-2">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`w-8 h-1 rounded-full ${modalStep >= s ? 'bg-blue-600' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleDeploy}>
              {modalStep === 1 && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2"><h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Step 1: Technical Specifications</h4></div>
                  <FormInput label="Node Label" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} />
                  <FormInput label="Zone / Region" value={formData.zone} onChange={(v: string) => setFormData({...formData, zone: v})} />
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Server Model</label>
                    <select className="w-full px-5 py-3 rounded-xl bg-[#0F172A] border border-white/5 text-white text-xs outline-none focus:border-blue-500/50 appearance-none" value={formData.serverModel} onChange={(e) => setFormData({...formData, serverModel: e.target.value})}>
                      {serverModels.map(m => <option key={m} value={m} className="bg-slate-900">{m}</option>)}
                    </select>
                  </div>

                  <FormInput label="Power (kW)" type="number" value={formData.powerKW} onChange={(v: string) => setFormData({...formData, powerKW: v})} />
                  <FormInput label="Surface Area (m²)" type="number" value={formData.surfaceArea} onChange={(v: string) => setFormData({...formData, surfaceArea: v})} />
                  <FormInput label="Construction Year" type="number" value={formData.constructionYear} onChange={(v: string) => setFormData({...formData, constructionYear: v})} />
                  <FormInput label="Network Operator" value={formData.networkOperator} onChange={(v: string) => setFormData({...formData, networkOperator: v})} />
                  <FormInput label="Daily Rate ($)" type="number" value={formData.rental_rate} onChange={(v: string) => setFormData({...formData, rental_rate: v})} />
                  <FormInput label="Capacity (GB)" type="number" value={formData.capacity} onChange={(v: string) => setFormData({...formData, capacity: v})} />
                  
                  {/* NEW: File Input for Image */}
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Datacenter Image</label>
                    <div className="flex gap-2 items-center bg-[#0F172A] p-2 rounded-xl border border-white/5">
                      <div className="p-3 bg-slate-800 rounded-xl text-slate-500"><ImageIcon size={18} /></div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSelectedFile(e.target.files[0]);
                          }
                        }}
                        className="flex-1 text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                      />
                    </div>
                    {formData.image_url && !selectedFile && (
                      <p className="text-[9px] text-emerald-500 mt-2 ml-1">✓ Current image active</p>
                    )}
                  </div>
                </div>
              )}

              {modalStep === 2 && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2"><h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Step 2: Geographical Location</h4></div>
                  <FormInput label="Latitude" value={formData.latitude} onChange={(v: string) => setFormData({...formData, latitude: v})} />
                  <FormInput label="Longitude" value={formData.longitude} onChange={(v: string) => setFormData({...formData, longitude: v})} />
                  <FormInput label="Country" value={formData.country} onChange={(v: string) => setFormData({...formData, country: v})} />
                  <FormInput label="Postcode" value={formData.postcode} onChange={(v: string) => setFormData({...formData, postcode: v})} />
                  <FormInput label="Town / City" value={formData.townCity} onChange={(v: string) => setFormData({...formData, townCity: v})} />
                  <div className="col-span-2"><FormInput label="Address" value={formData.address} onChange={(v: string) => setFormData({...formData, address: v})} /></div>
                  <div className="col-span-2"><FormInput label="Additional Address Info" value={formData.additionalAddress} onChange={(v: string) => setFormData({...formData, additionalAddress: v})} /></div>
                </div>
              )}

              {modalStep === 3 && (
                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Step 3: Features & Infrastructure</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[{ label: 'Cooling System', field: 'coolingSystem' }, { label: 'Heat Network', field: 'heatNetwork' }, { label: 'Electricity Generator', field: 'electricityGenerator' }].map(feature => (
                        <label key={feature.field} className="flex items-center gap-3 p-4 bg-[#0F172A] border border-white/5 rounded-2xl cursor-pointer hover:border-blue-500/30 transition-all">
                          <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500 focus:ring-offset-0" checked={(formData as any)[feature.field]} onChange={(e) => setFormData({...formData, [feature.field]: e.target.checked})} />
                          <span className="text-[10px] font-bold text-white uppercase">{feature.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Datacenter Usage Profile</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {datacenterUses.map(use => (
                        <label key={use} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                          <input type="checkbox" className="w-3 h-3 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500 focus:ring-offset-0" checked={formData.uses.includes(use)} onChange={() => handleCheckboxChange('uses', use)} />
                          <span className="text-[9px] font-bold text-slate-300 uppercase">{use}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Security Standards</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {securityFeaturesList.map(feature => (
                        <label key={feature} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                          <input type="checkbox" className="w-3 h-3 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500 focus:ring-offset-0" checked={formData.securityFeatures.includes(feature)} onChange={() => handleCheckboxChange('securityFeatures', feature)} />
                          <span className="text-[9px] font-bold text-slate-300 uppercase">{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                {modalStep > 1 && <button type="button" onClick={() => setModalStep(modalStep - 1)} className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-black uppercase rounded-2xl hover:bg-white/10 transition-all">Back</button>}
                <button type="submit" disabled={isDeploying} className="flex-[2] py-4 bg-blue-600 text-white font-black uppercase rounded-2xl shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all">
                  {isDeploying ? 'Saving...' : (modalStep < 3 ? 'Continue' : (editingNodeId ? 'Update Resource' : 'Deploy to Edge'))}
                </button>
              </div>
            </form>
            <button onClick={() => { setIsModalOpen(false); setModalStep(1); }} className="mt-6 text-slate-500 text-[10px] uppercase w-full font-black tracking-[0.2em] hover:text-white transition-colors">Cancel Deployment</button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, trend }: any) => (
  <div className="bg-[#161B2B] border border-white/5 p-6 rounded-[2rem] flex items-center justify-between shadow-xl group hover:border-blue-500/20 transition-all">
    <div>
      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-black text-white">{value}</p>
        {trend && <span className={`text-[10px] font-black ${trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'} flex items-center gap-0.5`}>{trend.startsWith('+') ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{trend}</span>}
      </div>
    </div>
    <div className={`p-4 rounded-2xl bg-slate-900/50 ${color} group-hover:scale-110 transition-transform`}><Icon size={24} /></div>
  </div>
);

const TableRow = ({ node, onDelete, onEdit }: any) => (
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
    <td className="px-8 py-5 text-right flex justify-end gap-2">
      {/* NEW: Edit Button */}
      <button onClick={onEdit} className="text-slate-600 hover:text-blue-500 transition-colors p-2"><Edit2 size={16} /></button>
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