import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import api from '../api/axiosConfig';
import { 
  ArrowLeft, Play, Square, RefreshCcw, 
  Server, Shield, Activity, Globe, Cpu, Zap,
  Copy, Terminal as TerminalIcon, LayoutDashboard, Link as LinkIcon,
  LineChart as LineChartIcon, DollarSign, Download, TrendingUp, XCircle
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'xterm/css/xterm.css';

const WebConsole = ({ nodeName }: { nodeName: string }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'Menlo, Monaco, monospace',
      theme: { background: '#0B0F1A', foreground: '#D1D5DB', cursor: '#3B82F6' },
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = term;

    const bootLines = [
      `Initializing ${nodeName}...`,
      'Welcome to DataSpace OS!',
      'root@dataspace-node:~# '
    ];

    bootLines.forEach((line, i) => {
      setTimeout(() => term.writeln(line), i * 100);
    });

    return () => term.dispose();
  }, [nodeName]);

  return (
    <div className="bg-[#0B0F1A] p-4 rounded-3xl border border-white/5 overflow-hidden shadow-inner">
      <div ref={terminalRef} className="h-64 w-full" />
    </div>
  );
};

export const SeekerResourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [node, setNode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'control' | 'connectivity' | 'analytics'>('control');
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);

  const mockIp = "203.0.113.45";
  const sshCommand = `ssh root@${mockIp}`;

  const fetchNodeDetails = async () => {
    try {
      // Endpoint uses token auth to verify ownership
      const res = await api.get(`/api/seeker/node/${id}`);
      setNode(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const data = [];
    for (let i = 20; i >= 0; i--) {
      data.push({
        name: `${i}m ago`,
        cpu: Math.floor(Math.random() * 40) + 20,
        ram: parseFloat((Math.random() * 8 + 12).toFixed(1)),
        network: Math.floor(Math.random() * 500) + 100,
      });
    }
    setAnalyticsData(data);
    if (id) fetchNodeDetails();
  }, [id]);

  const calculateBilling = () => {
    if (!node) return { total: "0.00", hours: 0 };
    const start = node.contract_start_date ? new Date(node.contract_start_date) : new Date(Date.now() - 86400000);
    const hours = Math.max(1, Math.ceil((new Date().getTime() - start.getTime()) / (1000 * 60 * 60)));
    const total = (hours * ((node.rental_rate || 0) / 24)).toFixed(2);
    return { total, hours };
  };

  const handleRelease = async () => {
    if (window.confirm("CRITICAL: Terminating this lease will stop billing and return the resource to the marketplace. Proceed?")) {
      setActionLoading(true);
      try {
        await api.post('/api/contracts/terminate', {
          nodeId: id,
          seekerEmail: user?.email
        });
        alert("Resource released successfully.");
        navigate('/seeker/fleet');
      } catch (err: any) {
        alert(err.response?.data?.error || "Release failed");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const downloadInvoice = () => {
    const doc = new jsPDF();
    const billing = calculateBilling();

    doc.setFillColor(11, 15, 26);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("DATASPACE CONNECT", 14, 25);
    doc.setFontSize(10);
    doc.text("INVOICE #DS-" + Math.floor(Math.random() * 10000), 160, 25);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text("Bill To:", 14, 55);
    doc.setFont("helvetica", "bold");
    doc.text(user?.companyName || "Independent Seeker", 14, 62);
    doc.setFont("helvetica", "normal");
    doc.text(user?.email || "", 14, 68);

    autoTable(doc, {
      startY: 80,
      head: [['Resource Name', 'Uptime (Hours)', 'Daily Rate', 'Total Due']],
      body: [[node.name, billing.hours, `$${node.rental_rate}`, `$${billing.total}`]],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.text(`Total Amount Due: $${billing.total}`, 140, (doc as any).lastAutoTable.finalY + 20);
    doc.save(`Invoice_${node.name}.pdf`);
  };

  if (loading || !node) return <div className="min-h-screen bg-[#0B0F1A]" />;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-slate-300 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-6">
            <button onClick={() => navigate('/seeker/fleet')} className="p-3 bg-slate-800 rounded-2xl text-blue-400 border border-blue-500/20 shadow-lg hover:bg-slate-700 transition-all"><ArrowLeft size={20} /></button>
            <div>
              <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">{node.name}</h1>
              <p className="text-blue-500 text-[10px] font-bold uppercase tracking-widest">Node Identity: {node.node_hash}</p>
            </div>
          </div>
          <div className="flex space-x-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
            {['control', 'connectivity', 'analytics'].map((tab: any) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
                }`}
              >
                {tab === 'control' && <LayoutDashboard size={14} className="inline mr-2" />}
                {tab === 'connectivity' && <LinkIcon size={14} className="inline mr-2" />}
                {tab === 'analytics' && <LineChartIcon size={14} className="inline mr-2" />}
                {tab}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'analytics' ? (
              <div className="bg-[#161B2B] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                <h3 className="text-sm font-black text-white uppercase mb-8 flex items-center gap-2"><Activity size={16} className="text-blue-500" /> Real-time Performance</h3>
                {['cpu', 'ram', 'network'].map((m) => (
                  <div key={m} className="h-[250px] w-full bg-black/20 rounded-2xl p-6 mb-8 group border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-4 group-hover:text-blue-400 transition-colors flex items-center justify-between">
                      <span>{m} utilization (%)</span>
                      <span className="text-blue-500/50 italic font-mono tracking-tighter">Live Stream</span>
                    </p>
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={analyticsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`color${m}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={m === 'cpu' ? '#3B82F6' : m === 'ram' ? '#8B5CF6' : '#10B981'} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={m === 'cpu' ? '#3B82F6' : m === 'ram' ? '#8B5CF6' : '#10B981'} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis hide dataKey="name" />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip contentStyle={{ background: '#0B0F1A', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                        <Area isAnimationActive={false} type="monotone" dataKey={m} stroke={m === 'cpu' ? '#3B82F6' : m === 'ram' ? '#8B5CF6' : '#10B981'} fill={`url(#color${m})`} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            ) : activeTab === 'connectivity' ? (
              <div className="bg-[#161B2B] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                <h3 className="text-sm font-black text-white uppercase mb-8 flex items-center gap-2"><Globe size={16} className="text-blue-500" /> Web-SSH Instance</h3>
                <WebConsole nodeName={node.name} />
                <div className="mt-6 p-5 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between group">
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-2">Remote SSH Command</p>
                    <code className="text-blue-400 text-xs font-mono">{sshCommand}</code>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(sshCommand); alert("Copied!"); }} className="p-3 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white rounded-xl transition-all border border-blue-500/20"><Copy size={16} /></button>
                </div>
              </div>
            ) : (
              <div className="bg-[#161B2B] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                <h3 className="text-sm font-black text-white uppercase mb-8 flex items-center gap-2"><Zap size={16} className="text-blue-500" /> Operational Control</h3>
                <div className="grid grid-cols-3 gap-4">
                  {['Start', 'Stop', 'Reboot'].map((action) => (
                    <button key={action} className="p-8 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all font-black uppercase text-[10px] tracking-widest text-white group">
                      <div className="mb-3 text-slate-500 group-hover:text-blue-500 transition-colors">
                        {action === 'Start' && <Play size={24} />}
                        {action === 'Stop' && <Square size={24} />}
                        {action === 'Reboot' && <RefreshCcw size={24} />}
                      </div>
                      {action} Resource
                    </button>
                  ))}
                </div>
                
                {/* PRO RELEASE BUTTON */}
                <button 
                  onClick={handleRelease}
                  disabled={actionLoading}
                  className="w-full mt-8 py-5 bg-red-600/5 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <XCircle size={18} /> Release Resource & Terminate Billing
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-blue-600 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 text-white/10 group-hover:scale-110 transition-transform duration-700"><DollarSign size={120} /></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-blue-100 uppercase mb-4 tracking-[0.2em] flex items-center gap-2"><TrendingUp size={14} /> LIVE REVENUE METER</p>
                <h4 className="text-4xl font-black text-white mb-1 italic tracking-tighter">${calculateBilling().total}</h4>
                <p className="text-[10px] font-bold text-blue-200 uppercase mb-8">Current Usage Accrued</p>
                <button 
                  onClick={downloadInvoice}
                  className="w-full py-4 bg-white text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                >
                  <Download size={16} /> Export PDF Invoice
                </button>
              </div>
            </div>

            <div className="bg-[#161B2B] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
              <Activity size={24} className="text-blue-500 mb-6" />
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">Current Load Distribution</h4>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase mb-2 text-slate-500"><span>CPU Load</span><span className="text-blue-400">24%</span></div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[24%] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase mb-2 text-slate-500"><span>RAM Occupancy</span><span className="text-purple-400">12.4 GB</span></div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[40%] rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)]"></div></div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-blue-600/5 border border-blue-500/10 rounded-[2.5rem]">
              <Shield size={24} className="text-blue-500 mb-4" />
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Security Perimeter</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed uppercase font-bold">Encrypted Tunnel Active. SSH keys managed by DataSpace IAM.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};