import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Middleware: Strict Admin Check
const requireAdmin = async (req: AuthRequest, res: Response, next: Function) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId }});
  if (user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access Denied: Admins only' });
  }
  next();
};

router.use(authenticate);
router.use(requireAdmin);

// 1. Global Stats
router.get('/stats', async (req, res) => {
  try {
    const [users, nodes, contracts] = await Promise.all([
      prisma.user.count(),
      prisma.node.count(),
      prisma.contract.count()
    ]);

    // Calculate total network capacity
    const capacityAgg = await prisma.node.aggregate({ _sum: { capacity: true }});
    
    // Calculate total system value (rough estimate)
    const revenueAgg = await prisma.contract.count({ where: { status: 'ACTIVE' }});

    res.json({
      totalUsers: users,
      totalNodes: nodes,
      activeContracts: contracts,
      totalCapacity: `${(capacityAgg._sum.capacity || 0) / 1000} TB`,
      networkHealth: '99.9%'
    });
  } catch (err) { res.status(500).json({ error: 'Stats failed' }); }
});

// 2. User Management
router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, fullName: true, role: true, companyName: true, created_at: true },
    orderBy: { created_at: 'desc' }
  });
  res.json(users);
});

router.delete('/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User banned and deleted' });
  } catch (err) { res.status(500).json({ error: 'Delete failed' }); }
});

// 3. Node Moderation
router.get('/nodes', async (req, res) => {
  const nodes = await prisma.node.findMany({
    include: { owner: { select: { email: true, companyName: true } } },
    orderBy: { created_at: 'desc' }
  });
  res.json(nodes);
});

router.delete('/nodes/:id', async (req, res) => {
  try {
    await prisma.node.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Resource force-deleted' });
  } catch (err) { res.status(500).json({ error: 'Delete failed' }); }
});
// 4. GET Approval Queue (Only Pending items)
router.get('/approvals', async (req, res) => {
  try {
    const pendingNodes = await prisma.node.findMany({
      where: { verification_status: 'PENDING' },
      include: { 
        owner: { 
          select: { email: true, companyName: true, entityType: true } 
        } 
      },
      orderBy: { created_at: 'asc' } // Oldest first
    });
    res.json(pendingNodes);
  } catch (err) { res.status(500).json({ error: 'Fetch failed' }); }
});

// 5. POST Moderate Node (Approve/Reject)
router.post('/moderate/:id', async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'APPROVE' or 'REJECT'

  const newStatus = action === 'APPROVE' ? 'VERIFIED' : 'REJECTED';

  try {
    const node = await prisma.node.update({
      where: { id: parseInt(id) },
      data: { verification_status: newStatus }
    });
    res.json({ message: `Node ${newStatus.toLowerCase()}`, node });
  } catch (err) {
    res.status(500).json({ error: 'Moderation failed' });
  }
});
export default router;