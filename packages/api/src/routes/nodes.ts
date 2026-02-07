import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Protect all seeker fleet routes
router.use(authenticate);

// GET /api/seeker/fleet
router.get('/fleet', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  try {
    // UPDATED: Using snake_case fields as per your database schema
    const fleetNodes = await prisma.node.findMany({
      where: {
        contracts: {
          some: {
            user_id: userId,
            status: 'ACTIVE'
          }
        }
      },
      include: {
        contracts: {
          where: {
            user_id: userId,
            status: 'ACTIVE'
          },
          take: 1
        }
      }
    });

    const formattedFleet = fleetNodes.map(node => ({
      ...node,
      contract_start_date: node.contracts[0]?.start_date || null,
      contract_id: node.contracts[0]?.id || null
    }));

    res.json(formattedFleet);
  } catch (error: any) {
    console.error('FLEET FETCH ERROR:', error.message);
    res.status(500).json({ error: 'Internal server error fetching fleet' });
  }
});

// GET /api/seeker/node/:id
router.get('/node/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  try {
    const node = await prisma.node.findFirst({
      where: {
        id: parseInt(id),
        contracts: {
          some: {
            user_id: userId,
            status: 'ACTIVE'
          }
        }
      },
      include: {
        contracts: {
          where: { status: 'ACTIVE' },
          take: 1
        }
      }
    });

    if (!node) {
      return res.status(404).json({ error: 'Resource not found in your fleet' });
    }

    res.json({
      ...node,
      contract_start_date: node.contracts[0]?.start_date
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching resource details' });
  }
});

export default router;