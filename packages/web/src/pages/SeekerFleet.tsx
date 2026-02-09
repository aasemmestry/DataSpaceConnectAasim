import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import api from '../api/axiosConfig';
import { 
  LayoutGrid, Server, Globe, Cpu, Zap, 
  ChevronRight, Search, Activity, Box
} from 'lucide-react';

export const SeekerFleet = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [fleet, setFleet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const fetchFleet = async () => {
    try {
      const res = await api.get('/api/seeker/fleet');
      setFleet(res.data);
    } catch (err) {
      console.error("Fleet fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const filteredFleet = fleet.filter(n => 
    (n.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (n.zone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (n.node_hash || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFleet.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredFleet.slice(indexOfFirstRecord, indexOfLastRecord);

  if (loading) return (
    <div className="flex-1 bg-[#0B0F1A] flex items-center justify-center">
      <Zap className="animate-pulse text-blue-500" size={48} />
    </div>
  );

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <header className="h-24 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center px-10 gap-6 flex-shrink-0 bg-[#0F172A]">
        <div>
          <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-0.5">My Active Servers</h1>
          <p className="text-blue-500 text-[10px] font-bold uppercase tracking-[0.2em]">Managing {fleet.length} Distributed Resources</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
            <input 
              placeholder="Search name, zone, or hash..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900 border border-white/5 pl-12 pr-6 py-3 rounded-2xl text-xs text-white outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {filteredFleet.length === 0 ? (
            <div className="bg-[#161B2B] border border-white/5 rounded-[3rem] p-20 text-center">
              <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Box className="text-blue-500" size={40} />
              </div>
              <h2 className="text-2xl font-black text-white uppercase mb-2">No Active Resources</h2>
              <p className="text-slate-500 text-sm mb-8 uppercase font-bold tracking-widest">Your fleet is currently empty</p>
              <button 
                onClick={() => navigate('/seeker/discovery')}
                className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-50 transition-all"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentRecords.map((node) => (
                  <div 
                    key={node.id}
                    className="group bg-[#161B2B] border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.04] transition-all relative overflow-hidden flex flex-col h-full"
                  >
                    <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-blue-500/10 transition-colors">
                      <Server size={80} />
                    </div>
                    
                    <div className="relative z-10 flex-1">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500">
                          <Cpu size={24} />
                        </div>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                          Active Lease
                        </span>
                      </div>

                      <h3 className="text-xl font-black text-white uppercase italic mb-1 group-hover:text-blue-400 transition-colors">
                        {node.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">{node.zone}</p>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-black/20 rounded-2xl">
                          <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Utilization</p>
                          <p className="text-xs font-black text-white">{node.utilization}</p>
                        </div>
                        <div className="p-4 bg-black/20 rounded-2xl">
                          <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Capacity</p>
                          <p className="text-xs font-black text-white">{node.capacity} GB</p>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10">
                      <button 
                        onClick={() => navigate(user?.role === 'OFFERER' ? `/offerer/node/${node.id}` : `/seeker/node/${node.id}`)}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2"
                      >
                        <LayoutGrid size={16} /> Control Center
                      </button>

                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <Activity size={14} className="text-blue-500" />
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Telemetry</span>
                        </div>
                        <ChevronRight size={18} className="text-slate-600 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-12 gap-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-6 py-3 bg-slate-900 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 disabled:opacity-30"
                  >
                    Previous
                  </button>
                  <span className="text-[10px] font-black text-blue-500 uppercase">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-6 py-3 bg-slate-900 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
