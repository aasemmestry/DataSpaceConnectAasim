import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import api from '../api/axiosConfig';
import { 
  Zap, Cpu, Server, Shield, Globe, 
  ChevronLeft, MessageSquare, Calendar, Maximize2, 
  Wind, Thermometer, ShieldCheck
} from 'lucide-react';

interface DatacenterNode {
  id: number;
  name: string;
  zone: string;
  status: string;
  tier: string;
  os: string;
  bandwidth: string;
  rental_rate: number;
  capacity: number;
  serverModel?: string;
  powerKW?: number;
  surfaceArea?: number;
  constructionYear?: number;
  networkOperator?: string;
  country?: string;
  postcode?: string;
  townCity?: string;
  address?: string;
  additionalAddress?: string;
  coolingSystem: boolean;
  heatNetwork: boolean;
  electricityGenerator: boolean;
  uses: string[];
  securityFeatures: string[];
  owner: {
    companyName: string;
    email: string;
  };
}

const DatacenterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [node, setNode] = useState<DatacenterNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    const fetchNodeDetails = async () => {
      try {
        const response = await api.get(`/api/discovery/node/${id}`);
        setNode(response.data);
      } catch (error) {
        console.error('Error fetching node details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNodeDetails();
  }, [id]);

  const handleRent = async () => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (window.confirm(`Initialize contract for ${node?.name}?`)) {
      try {
        await api.post('/api/contracts/rent', { nodeId: id, seekerEmail: user?.email });
        alert("Success! Resource added to your fleet.");
        navigate('/seeker/fleet');
      } catch (err: any) {
        alert(`Rental failed: ${err.response?.data?.error || "Error"}`);
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!node) return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center text-white">
      Datacenter not found
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white">
      {/* Header */}
      <div className="bg-[#0F172A] border-b border-white/5 py-6 px-8 sticky top-0 z-50 backdrop-blur-xl bg-opacity-80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to={user?.role === 'OFFERER' ? '/offerer/marketplace' : '/seeker/discovery'} className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest">
            <ChevronLeft size={16} /> Marketplace
          </Link>
          <div className="flex items-center gap-4">
            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${node.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
              {node.status}
            </span>
            <button 
              onClick={handleRent}
              disabled={node.status !== 'Active'}
              className={`px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${
                node.status === 'Active' ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {node.status === 'Active' ? 'Initialize Resource' : 'Currently Leased'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <div className="flex items-center gap-3 text-blue-500 mb-4">
                <Globe size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">{node.zone}</span>
              </div>
              <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-4">{node.name}</h1>
              <p className="text-xl text-slate-400 font-medium max-w-2xl leading-relaxed italic">
                Managed by <span className="text-white border-b-2 border-blue-600">{node.owner.companyName}</span>. 
                Full-tier infrastructure deployed in {node.country}.
              </p>
            </section>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <DetailCard icon={Server} label="Server Model" value={node.serverModel || 'Standard'} />
              <DetailCard icon={Zap} label="Power Consumption" value={`${node.powerKW || 0} kW`} />
              <DetailCard icon={Maximize2} label="Surface Area" value={`${node.surfaceArea || 0} m²`} />
              <DetailCard icon={Calendar} label="Built Year" value={node.constructionYear?.toString() || '2022'} />
              <DetailCard icon={Cpu} label="Compute Tier" value={node.tier} />
              <DetailCard icon={Shield} label="Storage Capacity" value={`${node.capacity} GB`} />
            </div>

            <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10">
              <h3 className="text-sm font-black uppercase tracking-widest mb-8 text-blue-500 flex items-center gap-3">
                <Wind size={20} /> Infrastructure Specs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <SpecItem label="Cooling System" value={node.coolingSystem} />
                  <SpecItem label="Heat Network" value={node.heatNetwork} />
                  <SpecItem label="Electricity Generator" value={node.electricityGenerator} />
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Intended Usage</p>
                  <div className="flex flex-wrap gap-2">
                    {node.uses.map(use => (
                      <span key={use} className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-bold text-slate-300 uppercase">{use}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10">
              <h3 className="text-sm font-black uppercase tracking-widest mb-8 text-emerald-500 flex items-center gap-3">
                <ShieldCheck size={20} /> Security & Protocols
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {node.securityFeatures.map(feature => (
                  <div key={feature} className="flex items-center gap-3 text-xs font-bold text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    {feature.toUpperCase()}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-blue-600 rounded-[3rem] p-10 shadow-2xl shadow-blue-600/10">
              <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-4">Contract Details</p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-black italic tracking-tighter">${node.rental_rate}</span>
                <span className="text-blue-200 font-bold">/DAY</span>
              </div>
              <div className="space-y-4 border-t border-white/10 pt-8 mb-8">
                <div className="flex justify-between text-xs">
                  <span className="text-blue-100/60 uppercase font-bold">Network Speed</span>
                  <span className="font-black uppercase">{node.bandwidth}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-100/60 uppercase font-bold">OS Version</span>
                  <span className="font-black uppercase">{node.os}</span>
                </div>
              </div>
              <button 
                onClick={handleRent}
                disabled={node.status !== 'Active'}
                className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
                  node.status === 'Active' ? 'bg-white text-blue-600 hover:scale-[1.02] active:scale-[0.98]' : 'bg-blue-700/50 text-blue-300 cursor-not-allowed'
                }`}
              >
                Deploy Now
              </button>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Facility Location</h4>
              <div className="space-y-4">
                <p className="text-xs font-bold leading-relaxed">
                  {node.address}<br />
                  {node.townCity}, {node.postcode}<br />
                  {node.country}
                </p>
                {node.additionalAddress && (
                  <p className="text-[10px] text-slate-500 italic uppercase">{node.additionalAddress}</p>
                )}
                <div className="pt-4">
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Network Operator</p>
                  <p className="text-xs font-black uppercase">{node.networkOperator || 'Global Carrier'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailCard = ({ icon: Icon, label, value }: any) => (
  <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-blue-500/30 transition-all">
    <div className="p-3 bg-blue-600/10 rounded-xl text-blue-500 w-fit mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
      <Icon size={20} />
    </div>
    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-black uppercase text-white truncate">{value}</p>
  </div>
);

const SpecItem = ({ label, value }: { label: string, value: boolean }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${value ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-400'}`}>
      {value ? 'Available' : 'Unavailable'}
    </span>
  </div>
);

export default DatacenterDetail;

