import { Router, Request, Response } from 'express';
import { listJobs, findJobById, toggleSaveJob, getUserSavedJobs } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// List jobs (public)
router.get('/', (req: Request, res: Response) => {
  try {
    const { weldingType, country, jobType, search, limit = '20', offset = '0' } = req.query;
    const result = listJobs({
      search: search as string,
      country: country as string,
      jobType: jobType as string,
      weldingType: weldingType as string,
      limit: Number(limit),
      offset: Number(offset),
    });
    res.json({ data: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get saved jobs (must be before /:id to avoid conflict)
router.get('/user/saved', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const saved = getUserSavedJobs(req.userId!);
    res.json({ data: saved });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get job detail
router.get('/:id', (req: Request, res: Response) => {
  try {
    const job = findJobById(Number(req.params.id));
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ data: job });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Save/unsave job
router.post('/:id/save', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const saved = toggleSaveJob(Number(req.params.id), req.userId!);
    res.json({ data: { saved } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
