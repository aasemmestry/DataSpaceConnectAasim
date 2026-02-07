import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { UserRole } from '@dataspace/common';

const router = Router();

// POST /api/contracts/rent
router.post('/rent', async (req: Request, res: Response) => {
  const { nodeId, seekerEmail } = req.body;

  try {
    const seeker = await prisma.user.findUnique({
      where: { email: seekerEmail.toLowerCase() }
    });

    if (!seeker || seeker.role !== UserRole.SEEKER) {
      return res.status(403).json({ error: 'Only Seekers can rent resources' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const node = await tx.node.findUnique({ where: { id: parseInt(nodeId) } });

      if (!node || node.status !== 'Active') {
        throw new Error('Resource is no longer available');
      }

      const contract = await tx.contract.create({
        data: {
          node_id: node.id, 
          user_id: seeker.id,
          status: 'ACTIVE',
        }
      });

      await tx.node.update({
        where: { id: node.id },
        data: { status: 'Leased' }
      });

      return contract;
    });

    res.status(201).json({ message: 'Success', contractId: result.id });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/contracts/terminate
router.post('/terminate', async (req: Request, res: Response) => {
  const { nodeId, seekerEmail } = req.body;

  try {
    const seeker = await prisma.user.findUnique({ 
      where: { email: seekerEmail.toLowerCase() } 
    });

    if (!seeker) throw new Error('Seeker account not found');

    await prisma.$transaction(async (tx) => {
      // 1. Find the active contract using snake_case names
      const contract = await tx.contract.findFirst({
        where: { 
          node_id: parseInt(nodeId), 
          user_id: seeker.id,       
          status: 'ACTIVE' 
        }
      });

      if (!contract) throw new Error('No active contract found for this resource');

      // 2. Set contract to TERMINATED
      await tx.contract.update({
        where: { id: contract.id },
        data: { 
          status: 'TERMINATED',
          end_date: new Date() 
        }
      });

      // 3. Return node to the public Marketplace
      await tx.node.update({
        where: { id: parseInt(nodeId) },
        data: { status: 'Active' }
      });
    });

    res.json({ message: 'Resource released and returned to Marketplace' });
  } catch (error: any) {
    console.error("TERMINATION_ERROR:", error.message);
    res.status(400).json({ error: error.message });
  }
});

export default router;