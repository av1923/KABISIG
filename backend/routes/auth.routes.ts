import express from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import QRCode from 'qrcode';
import { supabase, supabaseAdmin, recordAuditLog, canAccessTenant } from '../services/supabase.service.js';
import { sendSuccess, sendCreated, sendError } from '../utils/response.js';
import { authenticateUser, requireRoles } from '../middleware/auth.js';
import type { AuthRequest } from '../types/database.types.js';

const router = express.Router();

// Role IDs matching public.roles table (int4)
const ROLE_IDS = {
  SUPER_ADMIN: 1,
  BARANGAY_ADMIN: 2,
  SK_OFFICIAL: 3,
  YOUTH_CONSTITUENT: 4,
  VIEWER: 5,
  FEDERATION_OBSERVER: 6,
  LGU_AUDITOR: 7,
};

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

const SecurePasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter (A-Z)')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter (a-z)')
  .regex(/[0-9]/, 'Password must contain at least one number (0-9)')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one symbol (!@#$%^&*...)');

const RegisterYouthSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: SecurePasswordSchema,
  full_name: z.string().min(2, 'Full name is required'),
  barangay_id: z.string().uuid('Valid Barangay ID is required'),
  phone: z.string().optional(),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Birthdate must be formatted as YYYY-MM-DD'),
  sex: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']),
  address: z.string().min(3, 'Address is required'),
  educational_status: z
    .enum(['Elementary', 'High School', 'Vocational', 'College', 'Post-Graduate', 'Out of School Youth'])
    .optional(),
  employment_status: z.enum(['Employed', 'Unemployed', 'Self-Employed', 'Student']).optional(),
  is_registered_voter: z.boolean().default(false),
});

const ApproveUserSchema = z.object({
  user_id: z.string().uuid('Valid user ID is required'),
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  redirectTo: z.string().url().optional(),
});

// POST /api/auth/register-youth
router.post('/register-youth', async (req: Request, res: Response): Promise<void> => {
  const parseResult = RegisterYouthSchema.safeParse(req.body);
  if (!parseResult.success) {
    sendError(res, 'Validation failed', 400, parseResult.error.flatten().fieldErrors);
    return;
  }

  const {
    email,
    password,
    full_name,
    barangay_id,
    phone,
    birthdate,
    sex,
    address,
    educational_status,
    employment_status,
    is_registered_voter,
  } = parseResult.data;

  // 1. Age Verification (SK Reform Act: 15 to 30 years old)
  const calculatedAge = calculateAge(birthdate);
  if (calculatedAge < 15 || calculatedAge > 30) {
    sendError(
      res,
      `Registration rejected: In accordance with Republic Act No. 10742 (SK Reform Act), youth constituents must be between 15 and 30 years old. Your calculated age is ${calculatedAge}.`,
      422,
      { calculatedAge, requiredRange: '15-30' }
    );
    return;
  }

  // 2. Verify Barangay Existence
  const { data: barangay, error: bgyError } = await supabase
    .from('barangay')
    .select('id, name')
    .eq('id', barangay_id)
    .single();

  if (bgyError || !barangay) {
    sendError(res, 'Specified Barangay does not exist in Naga City registry.', 404);
    return;
  }

  // 3. Create Supabase Auth Account
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, barangay_id, tenant_id: barangay_id },
    },
  });

  if (authError || !authData.user) {
    sendError(res, authError?.message || 'Failed to create auth account.', 400);
    return;
  }

  const userId = authData.user.id;

  // 4. Create Public User Record
  const { error: userError } = await supabaseAdmin.from('users').insert([
    {
      id: userId,
      tenant_id: barangay_id,
      role_id: ROLE_IDS.YOUTH_CONSTITUENT, // Integer ID (4)
      full_name,
      email,
      phone: phone || null,
      status: 'pending',
    },
  ]);

  if (userError) {
    console.error('Users Table Insert Error:', userError);
    // Rollback auth account if public insert fails
    await supabaseAdmin.auth.admin.deleteUser(userId);
    sendError(res, `Failed to initialize user record: ${userError.message}`, 500);
    return;
  }

  // 5. Create Resident Profile Record
  const { error: profileError } = await supabaseAdmin.from('resident_profile').insert([
    {
      user_id: userId,
      tenant_id: barangay_id,
      birthdate,
      sex,
      address,
      educational_status: educational_status || null,
      employment_status: employment_status || null,
      is_registered_voter,
      digital_youth_id: null,
      qr_code_url: null,
    },
  ]);

  if (profileError) {
    console.error('Resident Profile Table Insert Error:', profileError);
    // Rollback users table record and auth account if profile creation fails
    await supabaseAdmin.from('users').delete().eq('id', userId);
    await supabaseAdmin.auth.admin.deleteUser(userId);

    sendError(res, `Failed to create resident profile: ${profileError.message}`, 500, profileError);
    return;
  }

  // 6. Record System Audit Log
  await recordAuditLog({
    tenantId: barangay_id,
    userId,
    action: 'REGISTER_YOUTH',
    entityName: 'users',
    entityId: userId,
    details: { full_name, barangay: barangay.name, age: calculatedAge },
    ipAddress: req.ip || null,
  });

  sendCreated(
    res,
    {
      user_id: userId,
      email,
      full_name,
      barangay: barangay.name,
      status: 'pending',
      age: calculatedAge,
    },
    'Youth registration submitted successfully. Your profile is currently pending verification by your Barangay SK officials.'
  );
});

// POST /api/auth/approve-user
router.post(
  '/approve-user',
  authenticateUser,
  requireRoles('BARANGAY_ADMIN', 'SK_OFFICIAL', 'SUPER_ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    const parseResult = ApproveUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      sendError(res, 'Validation failed', 400, parseResult.error.flatten().fieldErrors);
      return;
    }

    const { user_id } = parseResult.data;
    const admin = (req as AuthRequest).user!;

    const { data: targetUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email, tenant_id, status, barangay(name)')
      .eq('id', user_id)
      .single();

    if (fetchError || !targetUser) {
      sendError(res, 'Target user not found.', 404);
      return;
    }

    if (!canAccessTenant(admin, targetUser.tenant_id)) {
      sendError(res, 'Forbidden: You do not have permission to approve users outside your assigned Barangay.', 403);
      return;
    }

    if (targetUser.status === 'active') {
      sendError(res, 'User is already active.', 400);
      return;
    }

    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const digitalYouthId = `KAB-NAGA-${currentYear}-${randomSuffix}`;

    const qrPayload = JSON.stringify({
      digital_youth_id: digitalYouthId,
      user_id: targetUser.id,
      tenant_id: targetUser.tenant_id,
      full_name: targetUser.full_name,
      issued_at: new Date().toISOString(),
    });

    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 300,
        color: {
          dark: '#1E3A8A',
          light: '#FFFFFF',
        },
      });
    } catch (qrErr: any) {
      sendError(res, 'Failed to generate QR code: ' + qrErr.message, 500);
      return;
    }

    const { error: updateUserError } = await supabaseAdmin
      .from('users')
      .update({
        status: 'active',
        approved_by: admin.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetUser.id);

    if (updateUserError) {
      sendError(res, `Failed to activate user: ${updateUserError.message}`, 500);
      return;
    }

    const { error: updateProfileError } = await supabaseAdmin
      .from('resident_profile')
      .update({
        digital_youth_id: digitalYouthId,
        qr_code_url: qrCodeDataUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', targetUser.id);

    if (updateProfileError) {
      sendError(res, `Failed to assign Digital Youth ID: ${updateProfileError.message}`, 500);
      return;
    }

    await recordAuditLog({
      tenantId: targetUser.tenant_id,
      userId: admin.id,
      action: 'APPROVE_USER',
      entityName: 'users',
      entityId: targetUser.id,
      details: {
        target_email: targetUser.email,
        digital_youth_id: digitalYouthId,
        approved_by: admin.full_name,
      },
      ipAddress: req.ip || null,
    });

    sendSuccess(
      res,
      {
        user_id: targetUser.id,
        full_name: targetUser.full_name,
        status: 'active',
        digital_youth_id: digitalYouthId,
        qr_code_url: qrCodeDataUrl,
      },
      `User ${targetUser.full_name} has been approved and granted Digital Youth ID ${digitalYouthId}.`
    );
  }
);

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const parseResult = LoginSchema.safeParse(req.body);
  if (!parseResult.success) {
    sendError(res, 'Validation failed', 400, parseResult.error.flatten().fieldErrors);
    return;
  }

  const { email, password } = parseResult.data;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    sendError(res, error?.message || 'Invalid login credentials.', 401);
    return;
  }

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('*, roles(role_name), barangay(name), resident_profile(digital_youth_id, qr_code_url, birthdate)')
    .eq('id', data.user.id)
    .single();

  sendSuccess(
    res,
    {
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: profile || data.user,
    },
    'Login successful.'
  );
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  const parseResult = ForgotPasswordSchema.safeParse(req.body);
  if (!parseResult.success) {
    sendError(res, 'Validation failed', 400, parseResult.error.flatten().fieldErrors);
    return;
  }

  const { email, redirectTo } = parseResult.data;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo || 'http://localhost:3000/reset-password',
  });

  if (error) {
    sendError(res, error.message, 400);
    return;
  }

  sendSuccess(res, null, 'Password reset instructions sent to your email.');
});

// POST /api/auth/register-official
const RegisterOfficialSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: SecurePasswordSchema,
  full_name: z.string().min(2, 'Full name is required'),
  barangay_id: z.string().uuid('Valid Barangay ID is required'),
  role: z.string().default('SK_OFFICIAL'),
  phone: z.string().optional(),
});

router.post('/register-official', async (req: Request, res: Response): Promise<void> => {
  const parseResult = RegisterOfficialSchema.safeParse(req.body);
  if (!parseResult.success) {
    sendError(res, 'Validation failed', 400, parseResult.error.flatten().fieldErrors);
    return;
  }

  const { email, password, full_name, barangay_id, role, phone } = parseResult.data;

  // 1. Verify Barangay Existence
  const { data: barangay, error: bgyError } = await supabase
    .from('barangay')
    .select('id, name')
    .eq('id', barangay_id)
    .single();

  if (bgyError || !barangay) {
    sendError(res, 'Specified Barangay does not exist in Naga City registry.', 404);
    return;
  }

  // 2. Create Auth User
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, barangay_id, tenant_id: barangay_id, role },
    },
  });

  if (authError || !authData.user) {
    sendError(res, authError?.message || 'Failed to create auth account.', 400);
    return;
  }

  const userId = authData.user.id;
  const roleId = (role.includes('Chairperson') || role.includes('BARANGAY_ADMIN')) ? ROLE_IDS.BARANGAY_ADMIN : ROLE_IDS.SK_OFFICIAL;

  // 3. Insert into users table
  const { error: userError } = await supabaseAdmin.from('users').insert([
    {
      id: userId,
      tenant_id: barangay_id,
      role_id: roleId,
      full_name,
      email,
      phone: phone || null,
      status: 'pending',
    },
  ]);

  if (userError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    sendError(res, `Failed to initialize official user record: ${userError.message}`, 500);
    return;
  }

  await recordAuditLog({
    tenantId: barangay_id,
    userId,
    action: 'REGISTER_SK_OFFICIAL',
    entityName: 'users',
    entityId: userId,
    details: { full_name, role, barangay: barangay.name },
    ipAddress: req.ip || null,
  });

  sendCreated(
    res,
    {
      user_id: userId,
      email,
      full_name,
      barangay: barangay.name,
      role,
      status: 'pending',
    },
    `Official registration for Hon. ${full_name} submitted. Awaiting approval.`
  );
});

// GET /api/auth/me - Get current user profile
router.get('/me', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user!;
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('*, roles(role_name), barangay(name, city, district), resident_profile(digital_youth_id, qr_code_url, birthdate)')
    .eq('id', user.id)
    .single();

  sendSuccess(res, profile || user, 'User profile retrieved.');
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    await supabase.auth.admin.signOut(token);
  }
  sendSuccess(res, null, 'Logged out successfully.');
});

export default router;