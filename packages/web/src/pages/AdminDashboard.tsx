import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import api from '../api/axiosConfig';
import { 
  ShieldAlert, Users, Server, Activity, LogOut, CheckCircle, XCircle, Clock, 
  MapPin, Cpu, LayoutGrid, Ban
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  
  // Default to 'overview' tab. 
  // We use internal state for tabs, not URL routes, to keep it simple and fast.
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'users'>('overview');
  
  const [stats, setStats] = useState<any>({ totalUsers: 0, totalNodes: 0, totalCapacity: '0 TB' });
  const [queue, setQueue] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Initial Data (Stats + Queue)
  useEffect(() => {
    fetchOverviewData();
  }, []);

  // Fetch Users specifically when that tab is clicked
  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) {
      fetchUserData();
    }
  }, [activeTab]);

  const fetchOverviewData = async () => {
    try {
      const [s, q] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/approvals')
      ]);
      setStats(s.data);
      setQueue(q.data);
    } catch (err) {
      console.error("Admin Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error("User Fetch Error:", err);
    }
  };

  const handleModeration = async (id: number, action: 'APPROVE' | 'REJECT') => {
    try {
      await api.post(`/api/admin/moderate/${id}`, { action });
      setQueue(prev => prev.filter(n => n.id !== id));
      // Refresh stats to reflect the change
      fetchOverviewData(); 
    } catch (err) {
      alert("Action failed");
    }
  };

  const handleBanUser = async (id: string) => {
    if(window.confirm("CRITICAL: This will permanently delete the user. Proceed?")) {
      try {
        await api.delete(`/api/admin/users/${id}`);
        setUsers(prev => prev.filter(u => u.id !== id));
      } catch (err) {
        alert("Ban failed.");
      }
    }
  };

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-widest">Secure Handshake...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans flex overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-72 border-r border-white/5 bg-[#080808] flex flex-col justify-between p-6 z-20">
        <div>
          <div className="mb-12 flex items-center gap-4 text-white">
            <div className="p-2 bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]"><ShieldAlert size={24} /></div>
            <div>
              <h1 className="font-black uppercase italic leading-none text-lg">Overwatch</h1>
              <span className="text-[9px] text-blue-500 font-bold tracking-[0.2em] uppercase">Admin Console</span>
            </div>
          </div>

          <nav className="space-y-2">
            <NavBtn label="Network Overview" icon={Activity} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <NavBtn label="Approval Queue" icon={Clock} active={activeTab === 'approvals'} onClick={() => setActiveTab('approvals')} count={queue.length} />
            <NavBtn label="User Database" icon={Users} active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          </nav>
        </div>

        <button onClick={handleLogout} className="flex items-center gap-3 text-slate-500 hover:text-red-500 transition-colors p-4 rounded-xl hover:bg-white/5 group">
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="text-xs font-bold uppercase tracking-widest">Disconnect</span>
        </button>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#050505] to-[#0a0a0a] p-10 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
            <header>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">System Telemetry</h2>
              <p className="text-xs text-slate-500 font-mono">LIVE FEED • {new Date().toLocaleTimeString()}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="text-blue-500" />
              <StatCard label="Verified Nodes" value={stats.totalNodes} icon={Server} color="text-emerald-500" />
              <StatCard label="Pending Approvals" value={queue.length} icon={Clock} color="text-yellow-500" />
            </div>

            <div className="bg-[#0F0F0F] border border-white/5 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2"><LayoutGrid size={16}/> Growth Metrics</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{name:'M',v:4},{name:'T',v:7},{name:'W',v:5},{name:'T',v:12},{name:'F',v:18},{name:'S',v:25},{name:'S',v:30}]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" tick={{fill:'#444',fontSize:10, fontWeight:900}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{background:'#000',border:'1px solid #222', borderRadius: '8px'}} />
                    <Bar dataKey="v" fill="#2563eb" radius={[4,4,4,4]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* 2. APPROVALS TAB */}
        {activeTab === 'approvals' && (
          <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            <header className="mb-10 flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Moderation Queue</h2>
                <p className="text-xs text-slate-500 font-mono uppercase">Reviewing {queue.length} pending submissions</p>
              </div>
            </header>

            {queue.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 border border-white/5 rounded-[3rem] bg-[#0A0A0A]">
                <div className="p-6 bg-white/5 rounded-full mb-6 text-emerald-500"><CheckCircle size={48} /></div>
                <h3 className="text-xl font-black text-white uppercase tracking-widest">All Clear</h3>
                <p className="text-xs text-slate-500 mt-2 font-mono">No pending resources to review.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {queue.map((node: any) => (
                  <div key={node.id} className="bg-[#0F0F0F] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row gap-8 shadow-2xl hover:border-white/10 transition-all group">
                    <div className="w-full md:w-64 h-48 bg-black rounded-2xl overflow-hidden relative shrink-0 border border-white/5">
                      <img 
                        src={node.image_url || "https://images.unsplash.com/photo-1558494949-efc535b5c4c1"} 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" 
                        alt="Node"
                      />
                      <div className="absolute top-3 left-3 bg-blue-600/90 text-white text-[9px] font-black uppercase px-3 py-1 rounded backdrop-blur">
                        {node.tier || 'Standard'}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{node.name}</h3>
                          <span className="text-[10px] font-mono text-slate-600 uppercase border border-white/10 px-2 rounded">ID: {node.node_hash}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-2 gap-x-8 mb-6">
                          <div className="flex items-center gap-2 text-xs text-slate-400"><Users size={14} className="text-blue-500" /><span><b className="text-white">Owner:</b> {node.owner.companyName || 'Independent'}</span></div>
                          <div className="flex items-center gap-2 text-xs text-slate-400"><MapPin size={14} className="text-purple-500" /><span><b className="text-white">Loc:</b> {node.zone}</span></div>
                          <div className="flex items-center gap-2 text-xs text-slate-400"><Cpu size={14} className="text-emerald-500" /><span><b className="text-white">Spec:</b> {node.powerKW}kW / {node.capacity}GB</span></div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button onClick={() => handleModeration(node.id, 'APPROVE')} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98]">
                          <CheckCircle size={16} /> Approve Listing
                        </button>
                        <button onClick={() => handleModeration(node.id, 'REJECT')} className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. USERS TAB */}
        {activeTab === 'users' && (
          <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
             <header className="mb-10">
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">User Database</h2>
                <p className="text-xs text-slate-500 font-mono uppercase">Total Registered Entities: {users.length}</p>
             </header>

             <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
               <table className="w-full text-left">
                  <thead className="bg-white/5 text-[10px] uppercase text-slate-500 font-bold tracking-widest">
                    <tr>
                      <th className="p-6">User Identity</th>
                      <th className="p-6">Role</th>
                      <th className="p-6">Company</th>
                      <th className="p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.length > 0 ? users.map((u: any) => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-6">
                          <div className="font-bold text-white text-sm mb-1">{u.fullName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                        </td>
                        <td className="p-6">
                           <span className={`px-3 py-1 rounded-lg text-[9px] font-black border uppercase tracking-wider ${u.role==='ADMIN'?'bg-red-500/10 text-red-500 border-red-500/20':'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                             {u.role}
                           </span>
                        </td>
                        <td className="p-6 text-xs text-slate-400 font-bold uppercase">{u.companyName || '—'}</td>
                        <td className="p-6 text-right">
                          {u.role !== 'ADMIN' && (
                            <button onClick={() => handleBanUser(u.id)} className="p-2 bg-red-900/10 text-red-500 border border-red-900/20 hover:bg-red-600 hover:text-white rounded-lg transition-all" title="Ban User">
                              <Ban size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-slate-600 uppercase text-xs font-bold tracking-widest">
                           No users found in database.
                        </td>
                      </tr>
                    )}
                  </tbody>
               </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const NavBtn = ({ label, icon: Icon, active, onClick, count }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${active ? 'bg-white/10 text-white shadow-lg border border-white/5' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>
    <div className="flex items-center gap-3">
      <Icon size={18} className={active ? 'text-blue-500' : 'text-slate-600 group-hover:text-blue-500 transition-colors'} />
      <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
    </div>
    {count > 0 && <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{count}</span>}
  </button>
);

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-[#0F0F0F] border border-white/5 p-6 rounded-2xl flex items-center justify-between shadow-xl">
    <div>
      <p className="text-[9px] font-bold text-slate-500 uppercase mb-1 tracking-widest">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
    <div className={`p-3 bg-white/5 rounded-xl ${color} shadow-[0_0_15px_rgba(255,255,255,0.05)]`}><Icon size={20} /></div>
  </div>
);