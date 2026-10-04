import express from 'express';
import type { Request, Response } from 'express';
import { supabaseAdmin } from '../services/supabase.service.js';
import { authenticateUser } from '../middleware/auth.js';
import type { AuthRequest } from '../types/database.types.js';
import { sendError, sendSuccess } from '../utils/response.js';

const router = express.Router();

router.get('/', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user!;
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('id, notification_type, title, message, link, is_read, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    sendError(res, `Failed to retrieve notifications: ${error.message}`, 500);
    return;
  }

  sendSuccess(res, data || [], 'Notifications retrieved successfully.');
});

router.patch('/read-all', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user!;
  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) {
    sendError(res, `Failed to mark notifications as read: ${error.message}`, 500);
    return;
  }

  sendSuccess(res, null, 'Notifications marked as read.');
});

router.patch('/:id/read', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user!;
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('id', req.params.id)
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle();

  if (error) {
    sendError(res, `Failed to mark notification as read: ${error.message}`, 500);
    return;
  }
  if (!data) {
    sendError(res, 'Notification not found.', 404);
    return;
  }

  sendSuccess(res, data, 'Notification marked as read.');
});

export default router;
