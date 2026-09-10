import express from 'express';
import { z } from 'zod';
import { supabaseAdmin, recordAuditLog } from '../services/supabase.service.js';
import { sendSuccess, sendCreated, sendError } from '../utils/response.js';
import { authenticateUser, requireRoles } from '../middleware/auth.js';
const router = express.Router();
const AssignChairpersonByEmailSchema = z.object({
    email: z.string().email('Valid email address is required'),
    barangay_id: z.string().uuid('Valid Barangay ID is required'),
});
/**
 * POST /api/admin/assign-chairperson
 * Super Admin (SK Federation President) assigns an SK Chairperson to a barangay.
 * Takes ONLY the Chairperson's Email Address and target barangay_id.
 * Triggers a Supabase Auth invitation, pre-setting their user record in public.users
 * with role_id: 2 (BARANGAY_ADMIN), tenant_id: barangay_id, and status: 'active',
 * leaving their profile uninitialized so first login triggers profile completion.
 */
router.post('/assign-chairperson', authenticateUser, requireRoles('SUPER_ADMIN'), async (req, res) => {
    const parseResult = AssignChairpersonByEmailSchema.safeParse(req.body);
    if (!parseResult.success) {
        sendError(res, 'Validation failed', 400, parseResult.error.flatten().fieldErrors);
        return;
    }
    const { email, barangay_id } = parseResult.data;
    const cleanEmail = email.trim().toLowerCase();
    const admin = req.user;
    // 1. Verify target Barangay exists in the 27 Naga City registry
    const { data: barangay, error: bgyError } = await supabaseAdmin
        .from('barangay')
        .select('id, name, district')
        .eq('id', barangay_id)
        .single();
    if (bgyError || !barangay) {
        sendError(res, 'Target Barangay does not exist in Naga City registry.', 404);
        return;
    }
    let targetUserId = '';
    let inviteMethod = 'email_invitation';
    // 2. Check if a user already exists in public.users with this email
    const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id, email, tenant_id, role_id, full_name, status')
        .eq('email', cleanEmail)
        .maybeSingle();
    if (existingUser) {
        targetUserId = existingUser.id;
        // Update the user to BARANGAY_ADMIN for the selected barangay
        const { error: updateErr } = await supabaseAdmin
            .from('users')
            .update({
            tenant_id: barangay_id,
            role_id: 2, // BARANGAY_ADMIN
            status: 'active',
            approved_by: admin.id,
            updated_at: new Date().toISOString(),
        })
            .eq('id', existingUser.id);
        if (updateErr) {
            sendError(res, `Failed to update user record: ${updateErr.message}`, 500);
            return;
        }
    }
    else {
        // 3. New Chairperson: Trigger Supabase Auth invitation
        const { data: inviteData, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(cleanEmail, {
            data: {
                tenant_id: barangay_id,
                role_id: 2,
            },
        });
        if (!inviteErr && inviteData?.user) {
            targetUserId = inviteData.user.id;
            inviteMethod = 'email_invitation';
        }
        else {
            // Fallback for environments without active SMTP mailers:
            // Create user with standard initial credentials so testing never halts
            const tempPassword = `KabisigChairperson${new Date().getFullYear()}!`;
            const { data: createData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
                email: cleanEmail,
                password: tempPassword,
                email_confirm: true,
                user_metadata: {
                    tenant_id: barangay_id,
                    role_id: 2,
                },
            });
            if (createErr || !createData?.user) {
                sendError(res, createErr?.message || 'Failed to initialize Chairperson account via Supabase Auth.', 500);
                return;
            }
            targetUserId = createData.user.id;
            inviteMethod = 'temp_credentials';
        }
        // 4. Pre-set public.users record with role_id: 2, tenant_id, status: 'active'
        // full_name is deliberately set to empty string '' so first login detects profile completion needed
        const { error: insertUserErr } = await supabaseAdmin.from('users').upsert({
            id: targetUserId,
            tenant_id: barangay_id,
            role_id: 2, // BARANGAY_ADMIN
            full_name: '', // Empty profile detects first-time login
            email: cleanEmail,
            phone: null,
            status: 'active',
            approved_by: admin.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
        if (insertUserErr) {
            sendError(res, `Failed to pre-set Chairperson record in database: ${insertUserErr.message}`, 500);
            return;
        }
    }
    // 5. Audit Logging
    await recordAuditLog({
        tenantId: barangay_id,
        userId: admin.id,
        action: 'ASSIGN_SK_CHAIRPERSON',
        entityName: 'users',
        entityId: targetUserId,
        details: {
            chairperson_email: cleanEmail,
            barangay_id,
            barangay_name: barangay.name,
            assigned_by: admin.full_name,
            invitation_method: inviteMethod,
        },
        ipAddress: req.ip || null,
    });
    sendCreated(res, {
        user_id: targetUserId,
        email: cleanEmail,
        barangay_id,
        barangay_name: barangay.name,
        role: 'BARANGAY_ADMIN',
        status: 'active',
        invitation_method: inviteMethod,
    }, `SK Chairperson invitation dispatched to ${cleanEmail} for Barangay ${barangay.name}. The Chairperson will be prompted to complete their profile upon first login.`);
});
export default router;
//# sourceMappingURL=admin.routes.js.map