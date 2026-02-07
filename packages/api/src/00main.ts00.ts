import dotenv from 'dotenv';
dotenv.config(); 
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Add the .js extensions for ESM compatibility
import authRoutes from './routes/auth.js';
import offererRoutes from './routes/offerer.js';
import discoveryRoutes from './routes/discovery.js';
import datacenterRoutes from './routes/datacenters.js';
import adminRoutes from './routes/admin.js';

const app = express();
const port = 5001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// In-memory store for "Option 1" - Deployment Logic
let nodes: any[] = [
  { id: "0x882A...FD", name: "Mumbai DX-1", zone: "IN-WEST-1", util: "42%", status: "Active", pos: [19.076, 72.877] },
  { id: "0x119C...BE", name: "Frankfurt DX-2", zone: "EU-CENT-2", util: "12%", status: "Active", pos: [50.110, 8.682] }
];

app.get('/', (req, res) => res.send('API is Live'));

// Node Management Endpoints
app.get('/api/nodes', (req, res) => res.json(nodes));
app.post('/api/nodes', (req, res) => {
  const newNode = {
    ...req.body,
    id: `0x${Math.random().toString(16).slice(2, 6).toUpperCase()}...${Math.random().toString(16).slice(2, 4).toUpperCase()}`,
    status: "Provisioning",
    util: "0%",
    // Defaulting position for demo purposes
    pos: [20 + Math.random() * 10, Math.random() * 10] 
  };
  nodes.push(newNode);
  res.status(201).json(newNode);
});

app.use('/api/auth', authRoutes);
app.use('/api/offerer', offererRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/datacenters', datacenterRoutes);
app.use('/api/admin', adminRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log(`API running at http://localhost:${port}`);
});