import React, { useState } from 'react';
import { UserRole } from '@dataspace/common';

export const RegisterForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    companyName: '',
    role: UserRole.SEEKER,
  });

  const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">Full Name</label>
          <input
            type="text"
            placeholder="Aasim Mistry"
            className={inputClass}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">Company</label>
          <input
            type="text"
            placeholder="DataGreen"
            className={inputClass}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">Email</label>
        <input
          type="email"
          placeholder="aasim@datagreen.cloud"
          className={inputClass}
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
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">I am a...</label>
        <select
          className={`${inputClass} appearance-none cursor-pointer`}
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
        >
          <option value={UserRole.SEEKER} className="bg-slate-800 text-white">Resource Seeker</option>
          <option value={UserRole.OFFERER} className="bg-slate-800 text-white">Resource Offerer</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-xl transition-all active:scale-[0.98]"
      >
        Create Account
      </button>
    </form>
  );
};