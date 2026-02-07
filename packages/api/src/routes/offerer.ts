import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { UserRole } from '@dataspace/common';

const router = Router();

// Apply protection to all routes in this router
router.use(authenticate);
router.use(requireRole([UserRole.OFFERER]));

/**
 * GET Dashboard Statistics
 * Calculates real-time node count and accrued revenue.
 */
router.get('/stats', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  try {
    const nodes = await prisma.node.findMany({
      where: { owner_id: userId },
      include: {
        contracts: true // Include all contracts for revenue calculation
      }
    });

    // Calculate Accrued Revenue from all contracts (Active + Terminated)
    let totalRevenue = 0;
    nodes.forEach(node => {
      node.contracts.forEach((contract: any) => {
        // Use snake_case as defined in schema.prisma
        const start = new Date(contract.start_date);
        const end = contract.end_date ? new Date(contract.end_date) : new Date();
        
        const hours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
        totalRevenue += (hours * (node.rental_rate / 24));
      });
    });

    res.json({
      nodeCount: nodes.length,
      throughput: "850 TB", // Simulation
      securityScore: "98%", // Simulation
      totalRevenue: totalRevenue.toFixed(2)
    });
  } catch (error) {
    console.error("STATS_ERROR:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET Managed Infrastructure
 * Lists nodes owned by the authenticated offerer.
 */
router.get('/nodes', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  try {
    const nodes = await prisma.node.findMany({
      where: { owner_id: userId },
      orderBy: { created_at: 'desc' }
    });
    res.json(nodes);
  } catch (err) {
    console.error("FETCH_NODES_ERROR:", err);
    res.status(500).json({ error: 'Failed to fetch nodes' });
  }
});

/**
 * POST Deploy Node
 * Provisions a new resource for the offerer.
 */
router.post('/nodes', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { name, zone, capacity, latitude, longitude, tier, os, bandwidth, rental_rate } = req.body;

  try {
    const parsedCapacity = parseInt(capacity);
    const parsedLat = parseFloat(latitude);
    const parsedLng = parseFloat(longitude);
    const parsedRate = parseFloat(rental_rate) || 1.5;

    const newNode = await prisma.node.create({
      data: {
        name: name || 'Unnamed Node',
        zone: zone || 'Global',
        capacity: parsedCapacity,
        latitude: parsedLat,
        longitude: parsedLng,
        tier: tier || 'General Purpose',
        os: os || 'Ubuntu 22.04 LTS',
        bandwidth: bandwidth || '1 Gbps',
        rental_rate: parsedRate,
        owner_id: userId,
        node_hash: 'NODE-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        status: 'Active',
        utilization: '0%'
      }
    });
    res.status(201).json(newNode);
  } catch (err: any) {
    console.error("DEPLOY_ERROR:", err.message);
    res.status(500).json({ error: 'Deployment failed: ' + err.message });
  }
});

/**
 * DELETE Decommission Node
 */
router.delete('/nodes/:id', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  try {
    await prisma.node.deleteMany({
      where: {
        id: parseInt(id),
        owner_id: userId
      }
    });
    res.json({ message: 'Node deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

export default router;