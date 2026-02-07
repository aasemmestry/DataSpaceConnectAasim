import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import axios from 'axios';

interface Datacenter {
  id: string;
  name: string;
  location: string;
  powerCapacityKW: number;
  serverModels: string[];
  coolingSystem: string;
  securityFeatures: string[];
  establishmentYear: number;
  status: string;
  owner: {
    companyName: string;
    email: string;
  };
}

const DatacenterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [datacenter, setDatacenter] = useState<Datacenter | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    const fetchDatacenter = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/datacenters/${id}`);
        setDatacenter(response.data);
      } catch (error) {
        console.error('Error fetching datacenter:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDatacenter();
  }, [id]);

  const handleContact = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/datacenters/contact', 
        { datacenterId: id, message: contactMessage },
        { withCredentials: true }
      );
      alert('Message sent successfully!');
      setShowContactModal(false);
      setContactMessage('');
    } catch (error) {
      alert('Failed to send message.');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!datacenter) return <div className="flex justify-center items-center h-screen">Datacenter not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-8">
          <Link to="/map" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
            ← Back to Map
          </Link>
        </nav>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Hero Section */}
          <div className="bg-blue-900 text-white px-8 py-10">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-2">{datacenter.name}</h1>
                <p className="text-blue-200 text-lg flex items-center">
                  <span className="mr-2">📍</span> {datacenter.location}
                </p>
              </div>
              <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
                datacenter.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'
              }`}>
                {datacenter.status}
              </span>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Infrastructure */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  <span className="mr-2">⚡</span> Infrastructure
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Power Capacity</span>
                    <span className="font-semibold text-gray-900">{datacenter.powerCapacityKW} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cooling System</span>
                    <span className="font-semibold text-gray-900">{datacenter.coolingSystem}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Year</span>
                    <span className="font-semibold text-gray-900">{datacenter.establishmentYear}</span>
                  </div>
                </div>
              </div>

              {/* Hardware */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  <span className="mr-2">🖥️</span> Hardware Inventory
                </h2>
                <div className="flex flex-wrap gap-2">
                  {datacenter.serverModels.map((model, index) => (
                    <span key={index} className="bg-white px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700">
                      {model}
                    </span>
                  ))}
                </div>
              </div>

              {/* Security */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 col-span-1 md:col-span-2">
                <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  <span className="mr-2">🛡️</span> Security & Compliance
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {datacenter.securityFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-700">
                      <span className="text-green-500 mr-2">✓</span> {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="mt-10 border-t pt-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Managed by {datacenter.owner.companyName}</h3>
              <p className="text-gray-600 mb-6">Interested in this facility? Request a quote directly.</p>
              <button 
                onClick={() => setShowContactModal(true)}
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Request Quote / Contact Offerer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact {datacenter.owner.companyName}</h3>
                <textarea
                  className="w-full border rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="I'm interested in leasing capacity at this facility..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                />
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  onClick={handleContact}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Send Message
                </button>
                <button 
                  onClick={() => setShowContactModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatacenterDetail;
