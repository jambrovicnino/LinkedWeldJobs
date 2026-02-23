import { Router, Response } from 'express';
import { getUserNotifications, getUnreadCount, markAllRead, markOneRead } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get notifications
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    res.json({ data: getUserNotifications(req.userId!) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get unread count
router.get('/unread-count', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    res.json({ data: { count: getUnreadCount(req.userId!) } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all as read
router.put('/read-all', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    markAllRead(req.userId!);
    res.json({ data: { message: 'All notifications marked as read' } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mark one as read
router.put('/:id/read', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    markOneRead(Number(req.params.id), req.userId!);
    res.json({ data: { message: 'Notification marked as read' } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
