import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import api from '../api/axiosConfig';
import { 
  ArrowLeft, Play, Square, RefreshCcw, 
  Server, Shield, Activity, Globe, Cpu, Zap,
  Copy, Terminal as TerminalIcon, LayoutDashboard, Link as LinkIcon,
  LineChart as LineChartIcon, DollarSign, Download, TrendingUp, XCircle,
  Maximize, Fan, Calendar, Layers, Radio
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io } from 'socket.io-client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'xterm/css/xterm.css';

// --- SUB-COMPONENTS ---
const WebConsole = ({ nodeName }: { nodeName: string }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!terminalRef.current) return;
    const term = new Terminal({
      cursorBlink: true, fontSize: 13, fontFamily: 'Menlo, Monaco, monospace',
      theme: { background: '#0B0F1A', foreground: '#D1D5DB', cursor: '#3B82F6' },
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = term;

    const socket = io('http://localhost:5001');
    socketRef.current = socket;

    socket.on('connect', () => {
      term.writeln(`\x1b[32m[CONNECTED]\x1b[0m Established secure link to ${nodeName}`);
      term.writeln('Welcome to DataSpace OS!');
      term.write('\r\nroot@dataspace-node:~# ');
    });
    socket.on('output', (data) => term.write(data));
    term.onData((data) => socket.emit('input', data));

    return () => { term.dispose(); socket.disconnect(); };
  }, [nodeName]);

  return (
    <div className="bg-[#0B0F1A] p-4 rounded-3xl border border-white/5 overflow-hidden shadow-inner">
      <div ref={terminalRef} className="h-64 w-full" />
    </div>
  );
};

const SpecItem = ({ label, value, icon: Icon }: any) => (
  <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-4 group hover:bg-white/[0.05] transition-colors">
    <div className="p-3 bg-blue-600/10 rounded-xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xs font-black text-white uppercase">{value || 'N/A'}</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
export const SeekerResourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [node, setNode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'control' | 'connectivity' | 'analytics'>('control');
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [liveBilling, setLiveBilling] = useState({ total: "0.00", hours: "0.00" });

  const mockIp = "203.0.113.45";
  const sshCommand = `ssh root@${mockIp}`;

  const fetchNodeDetails = async () => {
    try {
      const res = await api.get(`/api/seeker/node/${id}`);
      setNode(res.data);
    } catch (err) { console.error("Fetch error:", err); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    const billingTimer = setInterval(() => {
      if (node) {
        const start = node.contract_start_date ? new Date(node.contract_start_date) : new Date(Date.now() - 3600000 * 5);
        const diffMs = new Date().getTime() - start.getTime();
        const hours = diffMs / (1000 * 60 * 60);
        const total = (hours * ((node.rental_rate || 0) / 24)).toFixed(4);
        setLiveBilling({ total, hours: hours.toFixed(2) });
      }
    }, 1000);
    return () => clearInterval(billingTimer);
  }, [node]);

  useEffect(() => {
    const generateData = () => {
      const data = [];
      for (let i = 20; i >= 0; i--) data.push({ name: `${i}m ago`, cpu: Math.floor(Math.random()*40)+20, ram: parseFloat((Math.random()*8+12).toFixed(1)), network: Math.floor(Math.random()*500)+100 });
      return data;
    };
    setAnalyticsData(generateData());
    const interval = setInterval(() => {
      setAnalyticsData(prev => [...prev.slice(1), { name: 'Now', cpu: Math.floor(Math.random()*40)+20, ram: parseFloat((Math.random()*8+12).toFixed(1)), network: Math.floor(Math.random()*500)+100 }]);
    }, 5000);
    if (id) fetchNodeDetails();
    return () => clearInterval(interval);
  }, [id]);

  const handlePowerAction = async (action: string) => {
    setActionLoading(true);
    try {
      await api.post('/api/resources/power', { nodeId: id, action: action.toLowerCase(), seekerEmail: user?.email });
      alert(`Resource ${action}ed successfully.`);
      fetchNodeDetails();
    } catch (err: any) { alert(err.response?.data?.error || `Failed to ${action}`); } 
    finally { setActionLoading(false); }
  };

  const handleRelease = async () => {
    if (window.confirm("CRITICAL: Terminating this lease will stop billing. Proceed?")) {
      setActionLoading(true);
      try {
        await api.post('/api/contracts/terminate', { nodeId: id, seekerEmail: user?.email });
        alert("Resource released.");
        navigate(user?.role === 'OFFERER' ? '/offerer/fleet' : '/seeker/fleet');
      } catch (err: any) { alert(err.response?.data?.error || "Release failed"); } 
      finally { setActionLoading(false); }
    }
  };

  const downloadInvoice = () => {
    const doc = new jsPDF();
    doc.text("DATASPACE CONNECT INVOICE", 14, 20);
    doc.save(`Invoice_${node.name}.pdf`);
  };

  if (loading || !node) return <div className="min-h-screen bg-[#0B0F1A]" />;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-slate-300 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center space-x-6 w-full md:w-auto">
            <button onClick={() => navigate(user?.role === 'OFFERER' ? '/offerer/fleet' : '/seeker/fleet')} className="p-3 bg-slate-800 rounded-2xl text-blue-400 border border-blue-500/20 shadow-lg hover:bg-slate-700 transition-all"><ArrowLeft size={20} /></button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">{node.name}</h1>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${
                    node.status === 'Running' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                    node.status === 'Stopped' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                    'bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse'
                  }`}>
                    {node.status}
                </span>
              </div>
              <p className="text-blue-500 text-[10px] font-bold uppercase tracking-widest mt-1">Node Identity: {node.node_hash}</p>
            </div>
          </div>
          <div className="flex space-x-1 bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-md">
            {['control', 'connectivity', 'analytics'].map((tab: any) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* --- TAB CONTENT --- */}
            {activeTab === 'analytics' ? (
              <div className="bg-[#161B2B] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                <h3 className="text-sm font-black text-white uppercase mb-8 flex items-center gap-2"><Activity size={16} className="text-blue-500" /> Real-time Performance</h3>
                {[
                  { key: 'cpu', unit: '%', label: 'CPU Utilization', color: '#3B82F6', domain: [0, 100] },
                  { key: 'ram', unit: 'GB', label: 'RAM Tracking', color: '#8B5CF6', domain: [0, 64] },
                  { key: 'network', unit: 'Mbps', label: 'Network Throughput', color: '#10B981', domain: [0, 1000] }
                ].map((m) => (
                  <div key={m.key} className="h-[250px] w-full bg-black/20 rounded-2xl p-6 mb-8 group border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-4 group-hover:text-white transition-colors">{m.label}</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={analyticsData}>
                        <defs><linearGradient id={`color${m.key}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={m.color} stopOpacity={0.3}/><stop offset="95%" stopColor={m.color} stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <Tooltip contentStyle={{ background: '#0B0F1A', border: 'none' }} itemStyle={{ color: m.color }} />
                        <Area type="monotone" dataKey={m.key} stroke={m.color} fill={`url(#color${m.key})`} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            ) : activeTab === 'connectivity' ? (
              <div className="bg-[#161B2B] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                <h3 className="text-sm font-black text-white uppercase mb-8 flex items-center gap-2"><Globe size={16} className="text-blue-500" /> Web-SSH Instance</h3>
                <WebConsole nodeName={node.name} />
                <div className="mt-6 p-5 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between">
                   <code className="text-blue-400 text-xs font-mono">{sshCommand}</code>
                   <button onClick={() => navigator.clipboard.writeText(sshCommand)} className="p-2 bg-blue-600/10 text-blue-500 rounded-lg"><Copy size={16} /></button>
                </div>
              </div>
            ) : (
              // --- CONTROL TAB (The Hybrid View) ---
              <div className="space-y-6">
                {/* 1. POWER CONTROLS */}
                <div className="bg-[#161B2B] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                  <h3 className="text-sm font-black text-white uppercase mb-8 flex items-center gap-2"><Zap size={16} className="text-blue-500" /> Operational Control</h3>
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {['Start', 'Stop', 'Reboot'].map((action) => (
                      <button 
                        key={action} 
                        onClick={() => handlePowerAction(action)}
                        disabled={actionLoading}
                        className="p-8 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all font-black uppercase text-[10px] tracking-widest text-white group"
                      >
                        <div className="mb-3 text-slate-500 group-hover:text-blue-500 transition-colors">
                          {action === 'Start' && <Play size={24} />}
                          {action === 'Stop' && <Square size={24} />}
                          {action === 'Reboot' && <RefreshCcw size={24} />}
                        </div>
                        {action}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleRelease} className="w-full py-5 bg-red-600/5 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3">
                    <XCircle size={18} /> Release Resource
                  </button>
                </div>

                {/* 2. INFRASTRUCTURE IDENTITY (The New Rich Spec Grid) */}
                <div className="bg-[#161B2B] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                   {/* Background Image Effect */}
                   <div className="absolute top-0 right-0 w-2/3 h-full opacity-20 pointer-events-none mix-blend-overlay">
                      <img 
                        src={node.image_url || "https://images.unsplash.com/photo-1558494949-efc535b5c4c1?q=80&w=1000&auto=format&fit=crop"} 
                        className="w-full h-full object-cover mask-image-gradient" 
                        alt="Server Rack" 
                        onError={(e: any) => e.target.src = "https://images.unsplash.com/photo-1558494949-efc535b5c4c1?q=80&w=1000&auto=format&fit=crop"}
                      />
                   </div>

                   <h3 className="text-sm font-black text-white uppercase mb-8 flex items-center gap-2 relative z-10"><Server size={16} className="text-blue-500" /> Infrastructure Profile</h3>
                   
                   <div className="grid grid-cols-2 gap-4 relative z-10 mb-8">
                      <SpecItem icon={Zap} label="Power Capacity" value={`${node.powerKW || 0} kW`} />
                      <SpecItem icon={Maximize} label="Land Footprint" value={`${node.surfaceArea || 0} sq.ft`} />
                      <SpecItem icon={Cpu} label="Hardware Model" value={node.serverModel} />
                      <SpecItem icon={Fan} label="Cooling System" value={node.coolingSystem ? 'Active Liquid' : 'Air Cooled'} />
                      <SpecItem icon={Calendar} label="Deployed Year" value={node.constructionYear} />
                      <SpecItem icon={Radio} label="Network Operator" value={node.networkOperator || 'DataSpace Internal'} />
                   </div>

                   {/* FEATURE TAGS */}
                   <div className="relative z-10">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3">Capabilities & Security</p>
                      <div className="flex flex-wrap gap-2">
                        {node.securityFeatures?.map((f: string, i: number) => (
                           <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[9px] font-bold text-blue-400 uppercase flex items-center gap-1">
                              <Shield size={10} /> {f}
                           </span>
                        ))}
                        {node.uses?.map((u: string, i: number) => (
                           <span key={i} className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[9px] font-bold text-purple-400 uppercase flex items-center gap-1">
                              <Layers size={10} /> {u}
                           </span>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR (Stats) */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 text-blue-600/10 group-hover:scale-110 transition-transform duration-700"><DollarSign size={120} /></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-blue-600 uppercase mb-4 tracking-[0.2em] flex items-center gap-2"><TrendingUp size={14} /> LIVE REVENUE METER</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-black text-slate-900 italic tracking-tighter">${liveBilling.total}</span>
                  <span className="text-[10px] font-black text-blue-600 animate-pulse">USD</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-8 flex justify-between"><span>Usage Accrued</span><span className="text-blue-600 font-black">{liveBilling.hours}h active</span></p>
                <button onClick={downloadInvoice} className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg">
                  <Download size={16} /> Export PDF Invoice
                </button>
              </div>
            </div>

            <div className="bg-[#161B2B] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
              <Activity size={24} className="text-blue-500 mb-6" />
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">Current Load Distribution</h4>
              <div className="space-y-6">
                <div><div className="flex justify-between text-[10px] font-bold uppercase mb-2 text-slate-500"><span>CPU Load</span><span className="text-blue-400">24%</span></div><div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[24%] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div></div></div>
                <div><div className="flex justify-between text-[10px] font-bold uppercase mb-2 text-slate-500"><span>RAM Occupancy</span><span className="text-purple-400">12.4 GB</span></div><div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[40%] rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)]"></div></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};