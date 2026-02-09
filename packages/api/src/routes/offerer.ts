import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// --- CONFIGURATION ---
// Ensure 'uploads' directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });
const router = Router();

// Apply protection to all routes
router.use(authenticate);

// --- HELPER: Parse Form Data ---
// Multer sends everything as strings. We need to convert numbers/booleans back.
const parseNodeBody = (body: any) => ({
  capacity: parseInt(body.capacity) || 1000,
  latitude: parseFloat(body.latitude) || 0,
  longitude: parseFloat(body.longitude) || 0,
  rental_rate: parseFloat(body.rental_rate) || 0,
  powerKW: parseFloat(body.powerKW) || 0,
  surfaceArea: parseFloat(body.surfaceArea) || 0,
  constructionYear: parseInt(body.constructionYear) || 2022,
  coolingSystem: body.coolingSystem === 'true',
  heatNetwork: body.heatNetwork === 'true',
  electricityGenerator: body.electricityGenerator === 'true',
  // Handle arrays (which might come as single strings or arrays of strings)
  uses: Array.isArray(body.uses) ? body.uses : (body.uses ? [body.uses] : []),
  securityFeatures: Array.isArray(body.securityFeatures) ? body.securityFeatures : (body.securityFeatures ? [body.securityFeatures] : [])
});

// --- ROUTES ---

// GET Stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  try {
    const nodes = await prisma.node.findMany({
      where: { owner_id: userId },
      include: { contracts: true }
    });
    
    let totalRevenue = 0;
    nodes.forEach(node => {
      node.contracts.forEach((contract: any) => {
        const start = new Date(contract.start_date);
        const end = contract.end_date ? new Date(contract.end_date) : new Date();
        const hours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
        totalRevenue += (hours * (node.rental_rate / 24));
      });
    });

    res.json({
      nodeCount: nodes.length,
      throughput: "850 TB",
      securityScore: "98%",
      totalRevenue: totalRevenue.toFixed(2)
    });
  } catch (error) { res.status(500).json({ message: 'Internal server error' }); }
});

// GET Nodes
router.get('/nodes', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;
  const skip = (page - 1) * limit;

  try {
    const [nodes, total] = await Promise.all([
      prisma.node.findMany({
        where: { owner_id: userId },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.node.count({ where: { owner_id: userId } })
    ]);

    res.json({ nodes, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch nodes' }); }
});

// POST Create Node (With File Upload)
router.post('/nodes', upload.single('image'), async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const parsed = parseNodeBody(req.body);
  
  // Construct Image URL
  let imageUrl = req.body.image_url; 
  if (req.file) {
    imageUrl = `http://localhost:5001/uploads/${req.file.filename}`;
  }

  try {
    const newNode = await prisma.node.create({
      data: {
        ...req.body, // Text fields
        ...parsed,   // Number/Boolean fields
        owner_id: userId,
        status: 'Active',
        // FIX: Added the missing required field
        utilization: '0%', 
        node_hash: 'NODE-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        image_url: imageUrl || "https://images.unsplash.com/photo-1558494949-efc535b5c4c1?q=80&w=1000&auto=format&fit=crop"
      }
    });
    res.status(201).json(newNode);
  } catch (err: any) {
    console.error("DEPLOY_ERROR:", err);
    res.status(500).json({ error: 'Deployment failed: ' + err.message });
  }
});

// PUT Update Node (New Edit Feature)
router.put('/nodes/:id', upload.single('image'), async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  // 1. Separate allowed fields from restricted fields
  // We explicitly extract 'id', 'owner_id', 'created_at' so they are NOT in 'rest'
  const { 
    id: _id, 
    owner_id, 
    created_at, 
    node_hash, 
    contracts,
    image_url, // Handle separately
    ...rest 
  } = req.body;

  const parsed = parseNodeBody(rest);

  // Construct Image URL (Only update if a new file is uploaded)
  let newImageUrl = undefined;
  if (req.file) {
    newImageUrl = `http://localhost:5001/uploads/${req.file.filename}`;
  } else if (image_url) {
    newImageUrl = image_url;
  }

  try {
    // 2. Check ownership first
    const existing = await prisma.node.findFirst({ where: { id: parseInt(id), owner_id: userId }});
    if (!existing) return res.status(404).json({ error: "Node not found or unauthorized" });

    // 3. Update with CLEAN data
    const updatedNode = await prisma.node.update({
      where: { id: parseInt(id) },
      data: {
        ...rest,    // Text fields (excluding id, owner_id, etc.)
        ...parsed,  // Number/Boolean fields
        ...(newImageUrl && { image_url: newImageUrl }) // Only update image if exists
      }
    });
    res.json(updatedNode);
  } catch (err: any) {
    console.error("UPDATE_ERROR:", err);
    res.status(500).json({ error: 'Update failed: ' + err.message });
  }
});

// DELETE Node
router.delete('/nodes/:id', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  try {
    await prisma.node.deleteMany({ where: { id: parseInt(id), owner_id: userId } });
    res.json({ message: 'Node deleted' });
  } catch (err) { res.status(500).json({ error: 'Delete failed' }); }
});

export default router;