import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const datacenter = await prisma.datacenter.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            companyName: true,
            email: true,
          },
        },
      },
    });

    if (!datacenter) {
      return res.status(404).json({ message: 'Datacenter not found' });
    }

    // Optional: Privacy logic could go here to mask address if not logged in
    // For now, returning full profile as requested.

    res.json(datacenter);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/contact', authenticate, async (req: Request, res: Response) => {
  const { datacenterId, message } = req.body;
  // @ts-ignore
  const senderId = req.user?.userId;

  try {
    const datacenter = await prisma.datacenter.findUnique({
      where: { id: datacenterId },
      include: { owner: true }
    });

    if (!datacenter) {
      return res.status(404).json({ message: 'Datacenter not found' });
    }

    console.log(`Contact Request for DC ${datacenter.name} from User ${senderId}: ${message}`);
    // In a real app, send email via EmailService
    
    res.json({ message: 'Contact request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
