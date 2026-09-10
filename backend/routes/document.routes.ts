import express from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin, canAccessTenant, recordAuditLog } from '../services/supabase.service.js';
import { sendSuccess, sendCreated, sendError } from '../utils/response.js';
import { authenticateUser, requireActiveUser, requireRoles } from '../middleware/auth.js';
import type { AuthRequest } from '../types/database.types.js';

const router = express.Router();

const CreateDocumentSchema = z.object({
  title: z.string().min(3, 'Document title is required'),
  document_type: z.enum([
    'Resolution',
    'Ordinance',
    'Financial Report',
    'Minutes',
    'Project Proposal',
    'Other',
  ]),
  file_url: z.string().url('A valid file URL is required'),
  status: z.enum(['draft', 'pending_approval']).default('pending_approval'),
});

const RejectDocumentSchema = z.object({
  feedback: z.string().min(5, 'A clear reason for rejection must be provided in feedback'),
});

router.get('/', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user!;
  const { status, document_type, tenant_id } = req.query;

  let query = supabaseAdmin
    .from('documents')
    .select('*, submitter:users!submitted_by(full_name, email), reviewer:users!reviewed_by(full_name)');

  if (user.role !== 'SUPER_ADMIN' && user.role !== 'FEDERATION_OBSERVER' && user.role !== 'LGU_AUDITOR') {
    query = query.eq('tenant_id', user.tenant_id);
  } else if (tenant_id && typeof tenant_id === 'string') {
    query = query.eq('tenant_id', tenant_id);
  }

  if (status && typeof status === 'string') {
    query = query.eq('status', status);
  }

  if (document_type && typeof document_type === 'string') {
    query = query.eq('document_type', document_type);
  }

  const { data: documents, error } = await query.order('created_at', { ascending: false });

  if (error) {
    sendError(res, `Failed to retrieve documents: ${error.message}`, 500);
    return;
  }

  sendSuccess(res, documents, 'Documents retrieved successfully.');
});

router.get('/:id', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id || '');
  const user = (req as AuthRequest).user!;

  const { data: document, error } = await supabaseAdmin
    .from('documents')
    .select('*, submitter:users!submitted_by(full_name, email), reviewer:users!reviewed_by(full_name)')
    .eq('id', id)
    .single();

  if (error || !document) {
    sendError(res, 'Document not found.', 404);
    return;
  }

  if (!canAccessTenant(user, document.tenant_id)) {
    sendError(res, 'Forbidden: You cannot access documents belonging to another Barangay.', 403);
    return;
  }

  sendSuccess(res, document, 'Document details retrieved.');
});

router.post(
  '/',
  authenticateUser,
  requireActiveUser,
  requireRoles('BARANGAY_ADMIN', 'SK_OFFICIAL', 'SUPER_ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    const parseResult = CreateDocumentSchema.safeParse(req.body);
    if (!parseResult.success) {
      sendError(res, 'Validation failed', 400, parseResult.error.flatten().fieldErrors);
      return;
    }

    const user = (req as AuthRequest).user!;
    const { title, document_type, file_url, status } = parseResult.data;

    const tenantId = user.tenant_id;
    if (!tenantId) {
      sendError(res, 'User has no assigned Barangay tenant.', 400);
      return;
    }

    const { data: newDoc, error } = await supabaseAdmin
      .from('documents')
      .insert([
        {
          tenant_id: tenantId,
          title,
          document_type,
          file_url,
          status,
          submitted_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      sendError(res, `Failed to submit document: ${error.message}`, 500);
      return;
    }

    await recordAuditLog({
      tenantId,
      userId: user.id,
      action: 'SUBMIT_DOCUMENT',
      entityName: 'documents',
      entityId: newDoc.id,
      details: { title, type: document_type, status },
      ipAddress: req.ip || null,
    });

    sendCreated(res, newDoc, `Document "${title}" submitted for approval workflow.`);
  }
);

router.patch(
  '/:id/approve',
  authenticateUser,
  requireActiveUser,
  requireRoles('BARANGAY_ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id || '');
    const reviewer = (req as AuthRequest).user!;

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('documents')
      .select('id, tenant_id, title, status')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      sendError(res, 'Document not found.', 404);
      return;
    }

    if (!canAccessTenant(reviewer, existing.tenant_id)) {
      sendError(res, 'Forbidden: You cannot review documents from another Barangay.', 403);
      return;
    }

    if (existing.status === 'approved') {
      sendError(res, 'Document is already approved.', 400);
      return;
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('documents')
      .update({
        status: 'approved',
        reviewed_by: reviewer.id,
        feedback: 'Approved by Barangay Administrator',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      sendError(res, `Failed to approve document: ${updateError.message}`, 500);
      return;
    }

    await recordAuditLog({
      tenantId: existing.tenant_id,
      userId: reviewer.id,
      action: 'APPROVE_DOCUMENT',
      entityName: 'documents',
      entityId: id,
      details: { title: existing.title, reviewer: reviewer.full_name },
      ipAddress: req.ip || null,
    });

    sendSuccess(res, updated, `Document "${existing.title}" has been approved.`);
  }
);

router.patch(
  '/:id/reject',
  authenticateUser,
  requireActiveUser,
  requireRoles('BARANGAY_ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id || '');
    const reviewer = (req as AuthRequest).user!;

    const parseResult = RejectDocumentSchema.safeParse(req.body);
    if (!parseResult.success) {
      sendError(res, 'Validation failed', 400, parseResult.error.flatten().fieldErrors);
      return;
    }

    const { feedback } = parseResult.data;

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('documents')
      .select('id, tenant_id, title')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      sendError(res, 'Document not found.', 404);
      return;
    }

    if (!canAccessTenant(reviewer, existing.tenant_id)) {
      sendError(res, 'Forbidden: You cannot review documents from another Barangay.', 403);
      return;
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('documents')
      .update({
        status: 'rejected',
        reviewed_by: reviewer.id,
        feedback,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      sendError(res, `Failed to reject document: ${updateError.message}`, 500);
      return;
    }

    await recordAuditLog({
      tenantId: existing.tenant_id,
      userId: reviewer.id,
      action: 'REJECT_DOCUMENT',
      entityName: 'documents',
      entityId: id,
      details: { title: existing.title, feedback },
      ipAddress: req.ip || null,
    });

    sendSuccess(res, updated, `Document "${existing.title}" rejected with feedback.`);
  }
);

export default router;
