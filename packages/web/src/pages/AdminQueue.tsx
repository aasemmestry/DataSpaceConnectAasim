import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout.js';

interface PendingDatacenter {
  id: string;
  name: string;
  location: string;
  powerCapacityKW: number;
  serverModels: string[];
  owner: {
    companyName: string;
    email: string;
  };
}

export const AdminQueue: React.FC = () => {
  const [pendingList, setPendingList] = useState<PendingDatacenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDC, setSelectedDC] = useState<PendingDatacenter | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchPending = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/admin/pending', { withCredentials: true });
      setPendingList(response.data);
    } catch (error) {
      console.error('Failed to fetch pending datacenters', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id: string) => {
    if (!window.confirm('Are you sure you want to APPROVE this datacenter?')) return;
    try {
      await axios.patch(`http://localhost:3000/api/admin/datacenters/${id}/approve`, {}, { withCredentials: true });
      alert('Approved successfully');
      fetchPending();
    } catch (error) {
      alert('Approval failed');
    }
  };

  const handleReject = async () => {
    if (!selectedDC) return;
    try {
      await axios.patch(`http://localhost:3000/api/admin/datacenters/${selectedDC.id}/reject`, { rejectionReason }, { withCredentials: true });
      alert('Rejected successfully');
      setShowRejectModal(false);
      setRejectionReason('');
      fetchPending();
    } catch (error) {
      alert('Rejection failed');
    }
  };

  if (loading) return <div className="p-8">Loading queue...</div>;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Approval Queue</h1>
        
        {pendingList.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            No pending approvals at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingList.map((dc) => (
              <div key={dc.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{dc.name}</h2>
                      <p className="text-gray-500">{dc.location}</p>
                    </div>
                    <Link 
                      to={`/datacenter/${dc.id}`} 
                      target="_blank"
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      Quick View ↗
                    </Link>
                  </div>

                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Company:</span>
                      <span className="font-semibold">{dc.owner.companyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Owner Email:</span>
                      <span className="font-semibold">{dc.owner.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Power:</span>
                      <span className="font-semibold">{dc.powerCapacityKW} kW</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Servers:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {dc.serverModels.map((m, i) => (
                          <span key={i} className="bg-gray-100 px-2 py-0.5 rounded text-xs">{m}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button 
                      onClick={() => handleApprove(dc.id)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-md font-bold hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedDC(dc);
                        setShowRejectModal(true);
                      }}
                      className="flex-1 bg-red-600 text-white py-2 rounded-md font-bold hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Reject Datacenter</h3>
            <p className="text-sm text-gray-600 mb-4">Please provide a reason for rejecting <strong>{selectedDC?.name}</strong>.</p>
            <textarea 
              className="w-full border rounded-md p-3 mb-4 focus:ring-red-500 focus:border-red-500"
              rows={4}
              placeholder="e.g., Missing compliance documentation..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex space-x-3">
              <button 
                onClick={handleReject}
                className="flex-1 bg-red-600 text-white py-2 rounded-md font-bold hover:bg-red-700"
              >
                Confirm Reject
              </button>
              <button 
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md font-bold hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
