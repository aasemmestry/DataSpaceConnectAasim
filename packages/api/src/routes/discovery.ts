import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { DatacenterStatus } from '@prisma/client';

const router = Router();

router.get('/map', async (req: Request, res: Response) => {
  const { minPower, maxPower, serverType } = req.query;

  try {
    const filters: any = {
      status: DatacenterStatus.ACTIVE,
    };

    if (minPower || maxPower) {
      filters.powerCapacityKW = {};
      if (minPower) filters.powerCapacityKW.gte = parseFloat(minPower as string);
      if (maxPower) filters.powerCapacityKW.lte = parseFloat(maxPower as string);
    }

    if (serverType) {
      filters.serverModels = {
        hasSome: (serverType as string).split(','),
      };
    }

    const datacenters = await prisma.datacenter.findMany({
      where: filters,
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        powerCapacityKW: true,
        serverModels: true,
      },
    });

    res.json(datacenters);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
