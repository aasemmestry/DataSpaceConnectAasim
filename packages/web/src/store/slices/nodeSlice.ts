import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';
import { RootState } from '..';
import { UserRole } from '@dataspace/common';

export const fetchNodes = createAsyncThunk('nodes/fetch', async (_, { getState }) => {
  const state = getState() as RootState;
  const role = state.auth.user?.role?.toUpperCase();
  
  // Use different endpoints based on role
  const endpoint = role === UserRole.OFFERER ? '/api/offerer/nodes' : '/api/discovery/nodes';
  const response = await api.get(endpoint);
  return response.data;
});

export const deployNode = createAsyncThunk('nodes/deploy', async (nodeData: any) => {
  const response = await api.post('/api/offerer/nodes', nodeData);
  return response.data;
});

const nodeSlice = createSlice({
  name: 'nodes',
  initialState: { list: [], loading: false } as { list: any[], loading: boolean },
  reducers: {
    simulateTraffic: (state) => {
      state.list = state.list.map(node => {
        if (node.status === 'Active') {
          const current = parseInt(node.utilization || node.util || "0");
          const change = Math.floor(Math.random() * 7) - 3;
          const newValue = Math.min(Math.max(current + change, 5), 98);
          return { ...node, utilization: `${newValue}%`, util: `${newValue}%` };
        }
        return node;
      });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNodes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNodes.fulfilled, (state, action) => { 
        state.list = action.payload; 
        state.loading = false;
      })
      .addCase(fetchNodes.rejected, (state) => {
        state.loading = false;
      })
      .addCase(deployNode.fulfilled, (state, action) => { 
        state.list.push(action.payload); 
      });
  },
});

export const { simulateTraffic } = nodeSlice.actions;
export default nodeSlice.reducer;
