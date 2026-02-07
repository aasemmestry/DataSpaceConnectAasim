import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@dataspace/common';

const router = Router();

// Strictly protected by ADMIN role
router.use(authenticate, requireRole([UserRole.ADMIN]));

// GET /admin/pending: Fetch all datacenters with status: PENDING
router.get('/pending', async (req: Request, res: Response) => {
  try {
    const pendingDatacenters = await prisma.datacenter.findMany({
      where: { status: 'PENDING' },
      include: {
        owner: {
          select: {
            companyName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(pendingDatacenters);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /admin/datacenters/:id/approve: Update status to ACTIVE
router.patch('/datacenters/:id/approve', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const datacenter = await prisma.datacenter.update({
      where: { id },
      data: { status: 'ACTIVE' },
      include: { owner: true },
    });

    console.log(`[Mock Email] To: ${datacenter.owner.email} - Your datacenter "${datacenter.name}" has been APPROVED.`);
    
    res.json(datacenter);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /admin/datacenters/:id/reject: Update status to INACTIVE and allow an optional rejectionReason
router.patch('/datacenters/:id/reject', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;

  try {
    const datacenter = await prisma.datacenter.update({
      where: { id },
      data: { 
        status: 'INACTIVE',
        rejectionReason: rejectionReason || null
      },
      include: { owner: true },
    });

    console.log(`[Mock Email] To: ${datacenter.owner.email} - Your datacenter "${datacenter.name}" has been REJECTED. Reason: ${rejectionReason || 'No reason provided.'}`);

    res.json(datacenter);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
