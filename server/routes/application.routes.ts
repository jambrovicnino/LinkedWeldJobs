import { Router, Response } from 'express';
import { createApplication, getUserApplications } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Apply to a job
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { jobId, coverLetter } = req.body;
    const application = createApplication(jobId, req.userId!, coverLetter);
    res.status(201).json({ data: application });
  } catch (err: any) {
    if (err.message === 'Already applied') {
      return res.status(409).json({ error: 'Already applied to this job' });
    }
    res.status(500).json({ error: err.message });
  }
});

// List my applications
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const applications = getUserApplications(req.userId!);
    res.json({ data: applications });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
