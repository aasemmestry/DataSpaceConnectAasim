import dotenv from 'dotenv';
dotenv.config(); 
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { prisma } from './lib/prisma.js';

// Route Imports
import authRoutes from './routes/auth.js';
import contractRoutes from './routes/contracts.js';
import nodeRoutes from './routes/nodes.js';
import offererRoutes from './routes/offerer.js';

const app = express();
const port = 5001;

// Middleware
app.use(cors({ 
  origin: 'http://localhost:5173', 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// Base Routes
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/seeker', nodeRoutes);
app.use('/api/offerer', offererRoutes);

/**
 * PRO MARKETPLACE DISCOVERY
 * Fix: Changed createdAt to created_at to match schema.prisma
 */
app.get('/api/discovery/nodes', async (req, res) => {
  try {
    const nodes = await prisma.node.findMany({
      orderBy: { created_at: 'desc' } // Fixed: created_at instead of createdAt
    });
    res.json(nodes);
  } catch (err) {
    console.error("DISCOVERY_ERROR:", err);
    res.status(500).json({ error: 'Marketplace discovery failed' });
  }
});

/**
 * POWER ACTIONS: Start, Stop, Reboot
 */
app.post('/api/resources/power', async (req, res) => {
  const { nodeId, action, seekerEmail } = req.body;
  
  const statusMap: Record<string, string> = {
    start: 'Running',
    stop: 'Stopped',
    reboot: 'Rebooting'
  };

  const newStatus = statusMap[action as string];
  if (!newStatus) return res.status(400).json({ error: 'Invalid action' });

  try {
    // 1. Verify that a contract exists and is active for this seeker
    const contract = await prisma.contract.findFirst({
      where: {
        node_id: parseInt(nodeId),
        status: 'ACTIVE',
        user: { email: seekerEmail.toLowerCase() }
      }
    });

    if (!contract) {
      return res.status(403).json({ error: 'Access denied: No active contract found' });
    }

    // 2. Perform Update
    await prisma.node.update({
      where: { id: parseInt(nodeId) },
      data: { status: newStatus }
    });
    
    // Simulate hardware reboot delay
    if (action === 'reboot') {
      setTimeout(async () => {
        await prisma.node.update({
          where: { id: parseInt(nodeId) },
          data: { status: 'Running' }
        });
      }, 5000);
    }

    res.json({ message: `Resource ${action}ed successfully`, status: newStatus });
  } catch (err) {
    console.error("POWER_ACTION_ERROR:", err);
    res.status(500).json({ error: 'Power action failed' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`-----------------------------------`);
  console.log(`🚀 DataSpace API: http://localhost:${port}`);
  console.log(`-----------------------------------`);
});