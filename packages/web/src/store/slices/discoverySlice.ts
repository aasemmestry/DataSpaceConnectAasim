import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DatacenterMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  powerCapacityKW: number;
  serverModels: string[];
}

interface DiscoveryState {
  filters: {
    minPower: number;
    maxPower: number;
    selectedServerModels: string[];
  };
  datacenters: DatacenterMarker[];
  isLoading: boolean;
}

const initialState: DiscoveryState = {
  filters: {
    minPower: 0,
    maxPower: 10000,
    selectedServerModels: [],
  },
  datacenters: [],
  isLoading: false,
};

const discoverySlice = createSlice({
  name: 'discovery',
  initialState,
  reducers: {
    setPowerRange: (state, action: PayloadAction<{ min: number; max: number }>) => {
      state.filters.minPower = action.payload.min;
      state.filters.maxPower = action.payload.max;
    },
    toggleServerModel: (state, action: PayloadAction<string>) => {
      const model = action.payload;
      if (state.filters.selectedServerModels.includes(model)) {
        state.filters.selectedServerModels = state.filters.selectedServerModels.filter(m => m !== model);
      } else {
        state.filters.selectedServerModels.push(model);
      }
    },
    setDatacenters: (state, action: PayloadAction<DatacenterMarker[]>) => {
      state.datacenters = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setPowerRange, toggleServerModel, setDatacenters, setLoading } = discoverySlice.actions;
export default discoverySlice.reducer;
