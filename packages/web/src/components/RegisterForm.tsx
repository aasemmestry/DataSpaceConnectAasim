import React, { useState } from 'react';
import { UserRole } from '@dataspace/common';

export const RegisterForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    country: '',
    role: UserRole.SEEKER,
    entityType: 'company',
    companyName: '',
  });

  const countries = [
    "United States", "United Kingdom", "France", "Germany", "Netherlands", 
    "Switzerland", "Canada", "Norway", "Sweden", "Denmark"
  ];

  const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between mb-4 px-2">
        <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-white/10'}`} />
        <div className="w-4" />
        <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-white/10'}`} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (step === 1) nextStep(); else onSubmit({ ...formData, name: `${formData.firstName} ${formData.lastName}` }); }} className="space-y-4">
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">First Name</label>
                <input
                  type="text"
                  placeholder="Aasim"
                  className={inputClass}
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">Last Name</label>
                <input
                  type="text"
                  placeholder="Mistry"
                  className={inputClass}
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">Phone</label>
                <input
                  type="tel"
                  placeholder="+1..."
                  className={inputClass}
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">Country</label>
                <select
                  className={`${inputClass} appearance-none cursor-pointer`}
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                >
                  <option value="" disabled className="bg-slate-800 text-white">Select Country</option>
                  {countries.map(c => <option key={c} value={c} className="bg-slate-800 text-white">{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">Email</label>
              <input
                type="email"
                placeholder="aasim@datagreen.cloud"
                className={inputClass}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">Password</label>
              <input
                type="password"
                placeholder="Min. 8 characters"
                className={inputClass}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-xl transition-all active:scale-[0.98]"
            >
              Continue to Step 2
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">Account Type</label>
              <select
                className={`${inputClass} appearance-none cursor-pointer`}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              >
                <option value={UserRole.SEEKER} className="bg-slate-800 text-white">Resource Seeker</option>
                <option value={UserRole.OFFERER} className="bg-slate-800 text-white">Resource Offerer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">Entity Type</label>
              <select
                className={`${inputClass} appearance-none cursor-pointer`}
                value={formData.entityType}
                onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
              >
                <option value="company" className="bg-slate-800 text-white">Company</option>
                <option value="individual" className="bg-slate-800 text-white">Individual</option>
                <option value="municipality" className="bg-slate-800 text-white">Municipality</option>
                <option value="realEstate" className="bg-slate-800 text-white">Real Estate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">Company Name</label>
              <input
                type="text"
                placeholder="DataGreen"
                className={inputClass}
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 py-3 px-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-[2] py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-xl transition-all active:scale-[0.98]"
              >
                Create Account
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};