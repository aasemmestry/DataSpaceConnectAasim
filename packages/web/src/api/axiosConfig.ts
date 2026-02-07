import axios from 'axios';

const api = axios.create({
  baseURL: '', // Handled by Vite proxy
});

export const setupInterceptors = (store: any) => {
  api.interceptors.request.use(
    (config) => {
      const state = store.getState();
      const token = state.auth.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

export default api;
