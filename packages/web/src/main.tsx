import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store' 
import { setupInterceptors } from './api/axiosConfig'
import App from './App' // Removed .tsx to let Vite handle it

// Initialize Axios Interceptors with the Redux Store
setupInterceptors(store);

import './index.css'
import 'leaflet/dist/leaflet.css';
// This MUST match the <div id="root"></div> in your index.html
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Failed to find the root element. Check your index.html");
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
  )
}