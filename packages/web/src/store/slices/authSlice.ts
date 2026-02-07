import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Pro Logic: Hydrate state from LocalStorage to prevent logout on refresh
const getInitialState = () => {
  const savedAuth = localStorage.getItem('ds_auth');
  if (!savedAuth) return {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    error: null,
  };

  try {
    const parsed = JSON.parse(savedAuth);
    // Normalize role to uppercase
    if (parsed.user && parsed.user.role) {
      parsed.user.role = parsed.user.role.toUpperCase();
    }
    return parsed;
  } catch (e) {
    localStorage.removeItem('ds_auth');
    return {
      user: null,
      accessToken: null,
      isAuthenticated: false,
      error: null,
    };
  }
};

const initialState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: any; accessToken: string | null }>) => {
      // Normalize role
      if (action.payload.user && action.payload.user.role) {
        action.payload.user.role = action.payload.user.role.toUpperCase();
      }
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = !!action.payload.user;
      state.error = null;
      // Save the session to the browser memory
      localStorage.setItem('ds_auth', JSON.stringify({
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: !!action.payload.user,
      }));
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('ds_auth');
    }
  },
});

export const { setAuth, setError, logout } = authSlice.actions;
export default authSlice.reducer;