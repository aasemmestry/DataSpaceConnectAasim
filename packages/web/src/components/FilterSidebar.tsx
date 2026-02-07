import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/index.js';
import { setPowerRange, toggleServerModel } from '../store/slices/discoverySlice.js';

const AVAILABLE_MODELS = ['NVIDIA H100', 'NVIDIA A100', 'Dell PowerEdge', 'HP ProLiant'];

export const FilterSidebar: React.FC<{ isOpen: boolean; toggle: () => void }> = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state: RootState) => state.discovery);

  return (
    <div className={`fixed top-0 left-0 h-full bg-white shadow-xl z-[1000] transition-transform duration-300 w-80 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Filters</h2>
          <button onClick={toggle} className="text-gray-500 hover:text-black">✕</button>
        </div>

        {/* Power Capacity Range */}
        <div className="space-y-4">
          <label className="block font-medium">Power Capacity (kW)</label>
          <div className="space-y-2">
            <input 
              type="range" 
              min="0" 
              max="10000" 
              step="100"
              value={filters.maxPower}
              onChange={(e) => dispatch(setPowerRange({ min: filters.minPower, max: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{filters.minPower} kW</span>
              <span>{filters.maxPower} kW</span>
            </div>
          </div>
        </div>

        {/* Server Models */}
        <div className="space-y-4">
          <label className="block font-medium">Server Models</label>
          <div className="space-y-2">
            {AVAILABLE_MODELS.map(model => (
              <label key={model} className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={filters.selectedServerModels.includes(model)}
                  onChange={() => dispatch(toggleServerModel(model))}
                  className="rounded text-blue-600"
                />
                <span className="text-sm">{model}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
