import dotenv from 'dotenv';
dotenv.config(); 
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { prisma } from './lib/prisma.js';
import path from 'path';

// Route Imports
import authRoutes from './routes/auth.js';
import contractRoutes from './routes/contracts.js';
import nodeRoutes from './routes/nodes.js';
import offererRoutes from './routes/offerer.js';
import adminRoutes from './routes/admin.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});
const port = 5001;

// Middleware
app.use(cors({ 
  origin: 'http://localhost:5173', 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// Serve Uploads Folder Publicly
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/seeker', nodeRoutes);
app.use('/api/offerer', offererRoutes);
app.use('/api/admin', adminRoutes);

/**
 * PRO TERMINAL SOCKETS
 */
io.on('connection', (socket) => {
  console.log('Terminal client connected:', socket.id);
  
  let currentCommand = '';
  const prompt = '\r\nroot@dataspace-node:~# ';

  socket.on('input', (data) => {
    // Handle Enter key
    if (data === '\r') {
      const cmd = currentCommand.trim().toLowerCase();
      socket.emit('output', '\r\n');
      
      if (cmd === 'ls') {
        socket.emit('output', 'bin  boot  dev  etc  home  lib  opt  root  run  sbin  srv  sys  tmp  usr  var\r\n');
      } else if (cmd === 'whoami') {
        socket.emit('output', 'root\r\n');
      } else if (cmd === 'top') {
        socket.emit('output', 'Tasks: 1 total, 1 running, 0 sleeping, 0 stopped, 0 zombie\r\n%Cpu(s):  0.0 us,  0.0 sy,  0.0 ni, 100.0 id\r\nMiB Mem :  64414.5 total,  45231.2 free,  12431.0 used\r\n');
      } else if (cmd === 'help') {
        socket.emit('output', 'Available commands: ls, whoami, top, clear, help, exit\r\n');
      } else if (cmd === 'clear') {
        socket.emit('output', '\x1b[2J\x1b[H');
      } else if (cmd !== '') {
        socket.emit('output', `-bash: ${cmd}: command not found\r\n`);
      }
      
      currentCommand = '';
      socket.emit('output', prompt);
    } 
    // Handle Backspace
    else if (data === '\x7f') {
      if (currentCommand.length > 0) {
        currentCommand = currentCommand.slice(0, -1);
        socket.emit('output', '\b \b');
      }
    }
    // Echo regular characters
    else {
      currentCommand += data;
      socket.emit('output', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('Terminal client disconnected');
  });
});

/**
 * PRO MARKETPLACE DISCOVERY
 * Updated: Only returns 'VERIFIED' nodes to Seekers
 */
app.get('/api/discovery/nodes', async (req, res) => {
  try {
    const nodes = await prisma.node.findMany({
      where: { 
        verification_status: 'VERIFIED' // <--- THIS HIDES UNAPPROVED NODES
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(nodes);
  } catch (err) {
    console.error("DISCOVERY_ERROR:", err);
    res.status(500).json({ error: 'Marketplace discovery failed' });
  }
});

app.get('/api/discovery/node/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const node = await prisma.node.findUnique({
      where: { id: parseInt(id) },
      include: {
        owner: {
          select: {
            companyName: true,
            email: true
          }
        }
      }
    });
    
    // Optional: Security check to ensure seekers can't access unverified node details directly via URL
    if (!node) return res.status(404).json({ error: 'Node not found' });
    if (node.verification_status !== 'VERIFIED') return res.status(403).json({ error: 'Node under review' });

    res.json(node);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch node details' });
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

httpServer.listen(port, '0.0.0.0', () => {
  console.log(`-----------------------------------`);
  console.log(`🚀 DataSpace API: http://localhost:${port}`);
  console.log(`-----------------------------------`);
});