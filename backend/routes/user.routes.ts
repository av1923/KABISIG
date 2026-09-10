import express from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin, recordAuditLog } from '../services/supabase.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { authenticateUser } from '../middleware/auth.js';
import type { AuthRequest } from '../types/database.types.js';

const router = express.Router();

function calculateAge(birthdateStr: string): number {
  const birthdate = new Date(birthdateStr);
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const monthDiff = today.getMonth() - birthdate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }
  return age;
}

const CompleteProfileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional(),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Birthdate must be formatted as YYYY-MM-DD'),
  sex: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']),
  address: z.string().min(3, 'Address is required'),
});

/**
 * PUT /api/users/complete-profile
 * First-time login profile completion for SK Chairpersons and newly provisioned users.
 * Updates public.users with personal name and contact info,
 * and upserts public.resident_profile with birthdate, sex, and residential address.
 */
router.put('/complete-profile', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  const parseResult = CompleteProfileSchema.safeParse(req.body);
  if (!parseResult.success) {
    sendError(res, 'Validation failed', 400, parseResult.error.flatten().fieldErrors);
    return;
  }

  const { full_name, phone, birthdate, sex, address } = parseResult.data;
  const user = (req as AuthRequest).user!;

  // 1. Age Verification (Republic Act No. 10742 - SK Reform Act: 15 to 30 years old)
  const age = calculateAge(birthdate);
  if (age < 15 || age > 30) {
    sendError(
      res,
      `Republic Act No. 10742 requires SK officials and members to be between 15 and 30 years old. Calculated age is ${age}.`,
      422,
      { calculatedAge: age, requiredRange: '15-30' }
    );
    return;
  }

  // 2. Fetch current user from DB to obtain tenant_id if missing in token
  let tenantId = user.tenant_id;
  if (!tenantId) {
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single();
    if (dbUser?.tenant_id) {
      tenantId = dbUser.tenant_id;
    }
  }

  if (!tenantId) {
    sendError(res, 'User is not bound to a valid Naga City Barangay tenant.', 400);
    return;
  }

  // 3. Update public.users record
  const { error: userUpdateErr } = await supabaseAdmin
    .from('users')
    .update({
      full_name: full_name.trim(),
      phone: phone ? phone.trim() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (userUpdateErr) {
    sendError(res, `Failed to update user profile: ${userUpdateErr.message}`, 500);
    return;
  }

  // 4. Upsert into public.resident_profile
  const { error: profileUpsertErr } = await supabaseAdmin
    .from('resident_profile')
    .upsert(
      {
        user_id: user.id,
        tenant_id: tenantId,
        birthdate,
        sex,
        address: address.trim(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (profileUpsertErr) {
    sendError(res, `Failed to initialize resident profile: ${profileUpsertErr.message}`, 500);
    return;
  }

  // 5. Update auth user metadata in Supabase Auth
  try {
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: { full_name: full_name.trim() },
    });
  } catch (authErr) {
    console.warn('Failed to update Supabase Auth user_metadata:', authErr);
  }

  // 6. Record system audit log
  await recordAuditLog({
    tenantId,
    userId: user.id,
    action: 'COMPLETE_CHAIRPERSON_PROFILE',
    entityName: 'users',
    entityId: user.id,
    details: {
      full_name: full_name.trim(),
      email: user.email,
      birthdate,
      sex,
      age,
    },
    ipAddress: req.ip || null,
  });

  // 7. Retrieve refreshed comprehensive profile
  const { data: updatedProfile } = await supabaseAdmin
    .from('users')
    .select('*, roles(role_name), barangay(name, city, district), resident_profile(birthdate, sex, address, digital_youth_id, qr_code_url)')
    .eq('id', user.id)
    .single();

  sendSuccess(
    res,
    updatedProfile || {
      id: user.id,
      full_name: full_name.trim(),
      email: user.email,
      tenant_id: tenantId,
      phone: phone || null,
      role: user.role,
      role_id: user.role_id,
    },
    'Chairperson profile completed successfully. Full administrative access unlocked.'
  );
});

export default router;

