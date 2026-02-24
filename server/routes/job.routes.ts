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

// Live jobs from Jooble (or fallback to seed)
router.get('/live', async (_req: Request, res: Response) => {
  try {
    const apiKey = process.env.JOOBLE_API_KEY;
    if (!apiKey) {
      // Fallback: return seed jobs from local DB
      const result = listJobs({ limit: 20, offset: 0 });
      const jobs = (result.jobs || []).map((j: any) => ({ ...j, source: 'platform', externalLink: null, sourceBoard: 'LinkedWeldJobs' }));
      return res.json({ data: { jobs, total: jobs.length, source: 'platform', fetchedAt: new Date().toISOString() } });
    }
    // Fetch from Jooble
    const countries = ['Germany', 'Poland', 'Netherlands', 'Austria', 'France', 'Norway', 'Sweden', 'Slovenia'];
    const fetches = countries.map(async (country) => {
      try {
        const resp = await fetch(`https://jooble.org/api/${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keywords: 'welder', location: country, page: '1' }),
        });
        if (!resp.ok) return [];
        const json: any = await resp.json();
        return (json.jobs || []).slice(0, 5);
      } catch { return []; }
    });
    const results = await Promise.all(fetches);
    const allJobs = results.flat().map((j: any, i: number) => ({
      id: `jooble-${j.id || i}`, title: j.title || 'Welding Position', company: j.company || 'Company',
      location: j.location || '', country: '', jobType: j.type || 'Full-time', experienceLevel: 'Mid-Level',
      weldingTypes: ['General'], industry: 'Manufacturing', description: j.snippet || '',
      postedAt: j.updated || new Date().toISOString(), isActive: true, source: 'jooble',
      externalLink: j.link || null, sourceBoard: j.source || 'Jooble', salary: j.salary || null,
    }));
    res.json({ data: { jobs: allJobs.slice(0, 30), total: allJobs.length, source: 'jooble', fetchedAt: new Date().toISOString() } });
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
