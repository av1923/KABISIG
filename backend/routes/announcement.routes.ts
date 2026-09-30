import express from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../services/supabase.service.js';
import { authenticateUser, requireActiveUser, requireRoles } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';
import type { AuthRequest } from '../types/database.types.js';

const router = express.Router();
const schema = z.object({
  title: z.string().min(3),
  content: z.string().min(1),
  category: z.enum(['Opportunity', 'Notice', 'Emergency', 'Event']),
  status: z.enum(['draft', 'published']).default('draft'),
});

function missingTable(error: any) {
  return error?.code === '42P01' || /schema cache|does not exist/i.test(error?.message || '');
}

router.get('/', authenticateUser, requireActiveUser, async (req, res) => {
  const user = (req as AuthRequest).user!;
  let query = supabaseAdmin.from('announcement').select('*').order('created_at', { ascending: false });
  if (user.role !== 'SUPER_ADMIN') query = query.eq('tenant_id', user.tenant_id);
  const { data, error } = await query;
  if (error) {
    sendError(res, missingTable(error) ? 'Announcements are not configured. Apply migration 003_add_announcements.sql.' : error.message, missingTable(error) ? 503 : 500);
    return;
  }
  sendSuccess(res, data || []);
});

router.post('/', authenticateUser, requireActiveUser, requireRoles('BARANGAY_ADMIN', 'SK_OFFICIAL', 'SUPER_ADMIN'), async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors); return; }
  const user = (req as AuthRequest).user!;
  const status = parsed.data.status;
  const { data, error } = await supabaseAdmin.from('announcement').insert({
    ...parsed.data,
    status,
    tenant_id: user.tenant_id,
    author_id: user.id,
    published_at: status === 'published' ? new Date().toISOString() : null,
  }).select().single();
  if (error) {
    sendError(res, missingTable(error) ? 'Announcements are not configured. Apply migration 003_add_announcements.sql.' : error.message, missingTable(error) ? 503 : 500);
    return;
  }
  sendSuccess(res, data, 'Announcement saved.');
});

export default router;
