import express from 'express';
import { z } from 'zod';
import { supabaseAdmin, recordAuditLog } from '../services/supabase.service.js';
import { sendSuccess, sendCreated, sendError } from '../utils/response.js';
import { authenticateUser, requireRoles } from '../middleware/auth.js';
const router = express.Router();
const UpdateBarangaySchema = z.object({
    chairperson: z.string().optional(),
    chairperson_email: z.string().email().optional().or(z.literal('')),
    chairpersonEmail: z.string().email().optional().or(z.literal('')),
    contact: z.string().optional(),
    youth_population: z.number().int().min(0).optional(),
    youthPopulation: z.number().int().min(0).optional(),
    allocated_budget: z.number().min(0).optional(),
    allocatedBudget: z.number().min(0).optional(),
    totalBudget: z.number().min(0).optional(),
    status: z.enum(['Active', 'Inactive']).optional(),
    logo_url: z.string().optional().or(z.literal('')),
    logo: z.string().optional().or(z.literal('')),
});
const AssignChairpersonSchema = z.object({
    full_name: z.string().min(2, 'Chairperson full name is required'),
    email: z.string().email('Valid chairperson email is required'),
    phone: z.string().optional(),
});
const DEFAULT_BARANGAY_LOGOS = {
    'Bagumbayan Norte': '/logos/bagumbayannorte_logo.png',
    'Bagumbayan Sur': '/logos/bagumbayansur_logo.png',
    'Calauag': '/logos/calauag_logo.png',
    'Carolina': '/logos/carolina_logo.png',
    'Dayangdang': '/logos/dayangdang_logo.png',
    'Liboton': '/logos/liboton_logo.png',
    'Pacol': '/logos/pacol_logo.png',
    'Panicuason': '/logos/panicuason_logo.png',
    'Peñafrancia': '/logos/penafrancia_logo.png',
    'San Felipe': '/logos/sanfelipe_logo.png',
    'Santa Cruz': '/logos/stacruz_logo.png',
    'Abella': '/logos/abella_logo.PNG',
    'Balatas': '/logos/balatas_logo.png',
    'Cararayan': '/logos/cararayan_logo.png',
    'Concepcion Grande': '/logos/grande_logo.png',
    'Concepcion Pequeña': '/logos/pequena_logo.png',
    'Del Rosario': '/logos/delrosario_logo.png',
    'Dinaga': '/logos/dinaga_logo.png',
    'Igualdad Interior': '/logos/igualidad_logo.png',
    'Lerma': '/logos/lerma_logo.png',
    'Mabolo': '/logos/mabolo_logo.png',
    'Sabang': '/logos/sabang_logo.png',
    'San Francisco': '/logos/sanfrancisco_logo.png',
    'San Isidro': '/logos/sanisidiro_logo.png',
    'Tabuco': '/logos/tabuco_logo.png',
    'Tinago': '/logos/tinago_logo.png',
    'Triangulo': '/logos/triangulo_logo.png',
};
// GET /api/barangays - Public/Authenticated: List all 27 Naga City permanently seeded barangays
router.get('/', async (_req, res) => {
    try {
        const { data: barangays, error: bgyError } = await supabaseAdmin
            .from('barangay')
            .select('id, name, city, district, created_at, updated_at')
            .order('name', { ascending: true });
        if (bgyError) {
            sendError(res, `Failed to load barangays: ${bgyError.message}`, 500);
            return;
        }
        // Fetch assigned SK Chairpersons (role_id = 2)
        const { data: chairpersons } = await supabaseAdmin
            .from('users')
            .select('id, full_name, email, phone, tenant_id, status')
            .eq('role_id', 2)
            .eq('status', 'active');
        const chairMap = new Map();
        chairpersons?.forEach((c) => {
            if (c.tenant_id) {
                chairMap.set(c.tenant_id, {
                    full_name: c.full_name,
                    email: c.email,
                    phone: c.phone,
                });
            }
        });
        // Fetch active programs count per barangay
        const { data: programs } = await supabaseAdmin
            .from('program')
            .select('tenant_id, status');
        const progCountMap = new Map();
        programs?.forEach((p) => {
            if (p.status === 'ongoing' || p.status === 'upcoming') {
                progCountMap.set(p.tenant_id, (progCountMap.get(p.tenant_id) || 0) + 1);
            }
        });
        // Fetch registered youth population per barangay
        const { data: youthProfiles } = await supabaseAdmin
            .from('resident_profile')
            .select('tenant_id');
        const youthCountMap = new Map();
        youthProfiles?.forEach((yp) => {
            youthCountMap.set(yp.tenant_id, (youthCountMap.get(yp.tenant_id) || 0) + 1);
        });
        // Fetch current year budgets
        const currentYear = new Date().getFullYear();
        const { data: budgets } = await supabaseAdmin
            .from('budget')
            .select('tenant_id, allocated_amount, remaining_amount')
            .eq('fiscal_year', currentYear);
        const budgetMap = new Map();
        budgets?.forEach((b) => {
            const existing = budgetMap.get(b.tenant_id) || { allocated: 0, spent: 0 };
            const allocated = Number(b.allocated_amount) || 0;
            const remaining = Number(b.remaining_amount) || 0;
            existing.allocated += allocated;
            existing.spent += (allocated - remaining);
            budgetMap.set(b.tenant_id, existing);
        });
        const enrichedBarangays = (barangays || []).map((b) => {
            const chair = chairMap.get(b.id);
            const budget = budgetMap.get(b.id) || { allocated: 0, spent: 0 };
            return {
                id: b.id,
                name: b.name,
                city: b.city,
                district: b.district,
                chairperson: chair?.full_name || 'Unassigned',
                chairpersonEmail: chair?.email || '',
                contact: chair?.phone || '',
                youthPopulation: youthCountMap.get(b.id) || 0,
                activePrograms: progCountMap.get(b.id) || 0,
                totalBudget: budget.allocated,
                allocatedBudget: budget.allocated,
                spentBudget: budget.spent,
                status: 'Active',
                logo: DEFAULT_BARANGAY_LOGOS[b.name] || '',
                dateCreated: b.created_at || '2026-01-01',
            };
        });
        sendSuccess(res, enrichedBarangays, '27 Naga City barangays retrieved successfully.');
    }
    catch (err) {
        sendError(res, err.message || 'Error fetching barangays', 500);
    }
});
// GET /api/barangays/:id - Get specific barangay details
router.get('/:id', async (req, res) => {
    const id = String(req.params.id);
    const { data: barangay, error } = await supabaseAdmin
        .from('barangay')
        .select('*')
        .eq('id', id)
        .single();
    if (error || !barangay) {
        sendError(res, 'Barangay not found.', 404);
        return;
    }
    // Fetch Chairperson
    const { data: chair } = await supabaseAdmin
        .from('users')
        .select('id, full_name, email, phone, status')
        .eq('tenant_id', id)
        .eq('role_id', 2)
        .eq('status', 'active')
        .maybeSingle();
    sendSuccess(res, {
        ...barangay,
        chairperson: chair?.full_name || 'Unassigned',
        chairpersonEmail: chair?.email || '',
        contact: chair?.phone || '',
        logo: DEFAULT_BARANGAY_LOGOS[barangay.name] || '',
    }, 'Barangay details retrieved.');
});
// PATCH /api/barangays/:id - Super Admin: Initialize/Configure/Adjust barangay settings
router.patch('/:id', authenticateUser, requireRoles('SUPER_ADMIN'), async (req, res) => {
    const id = String(req.params.id);
    const admin = req.user;
    const parseResult = UpdateBarangaySchema.safeParse(req.body);
    if (!parseResult.success) {
        sendError(res, 'Validation failed', 400, parseResult.error.flatten().fieldErrors);
        return;
    }
    const { data: existingBgy, error: fetchErr } = await supabaseAdmin
        .from('barangay')
        .select('id, name')
        .eq('id', id)
        .single();
    if (fetchErr || !existingBgy) {
        sendError(res, 'Barangay not found.', 404);
        return;
    }
    const updates = parseResult.data;
    const allocatedBudget = updates.allocated_budget ?? updates.allocatedBudget ?? updates.totalBudget;
    const chairName = updates.chairperson;
    const chairEmail = updates.chairperson_email || updates.chairpersonEmail;
    const phone = updates.contact;
    // 1. If allocating budget, upsert into budget table for current year
    if (allocatedBudget !== undefined) {
        const currentYear = new Date().getFullYear();
        await supabaseAdmin.from('budget').upsert({
            tenant_id: id,
            fiscal_year: currentYear,
            category: 'General Youth Development Fund',
            allocated_amount: allocatedBudget,
            remaining_amount: allocatedBudget,
            description: `Annual budget allocation configured by SK Federation President for Brgy. ${existingBgy.name}`,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'tenant_id,fiscal_year,category' });
    }
    // 2. If chairperson provided, update or assign in users table
    if (chairName && chairName.trim() && chairName !== 'Unassigned' && chairEmail) {
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id, email')
            .eq('email', chairEmail.trim().toLowerCase())
            .maybeSingle();
        if (existingUser) {
            await supabaseAdmin
                .from('users')
                .update({
                full_name: chairName.trim(),
                tenant_id: id,
                role_id: 2, // BARANGAY_ADMIN
                status: 'active',
                approved_by: admin.id,
                phone: phone || null,
                updated_at: new Date().toISOString(),
            })
                .eq('id', existingUser.id);
        }
        else {
            const secureTempPassword = `KabisigChairperson${new Date().getFullYear()}!`;
            const { data: authData } = await supabaseAdmin.auth.admin.createUser({
                email: chairEmail.trim().toLowerCase(),
                password: secureTempPassword,
                email_confirm: true,
                user_metadata: { full_name: chairName.trim(), tenant_id: id, role_id: 2 },
            });
            if (authData?.user) {
                await supabaseAdmin.from('users').insert([
                    {
                        id: authData.user.id,
                        tenant_id: id,
                        role_id: 2, // BARANGAY_ADMIN
                        full_name: chairName.trim(),
                        email: chairEmail.trim().toLowerCase(),
                        phone: phone || null,
                        status: 'active',
                        approved_by: admin.id,
                    },
                ]);
            }
        }
    }
    await recordAuditLog({
        tenantId: id,
        userId: admin.id,
        action: 'UPDATE_BARANGAY_SETTINGS',
        entityName: 'barangay',
        entityId: id,
        details: { ...updates, updated_by: admin.full_name, barangay_name: existingBgy.name },
        ipAddress: req.ip || null,
    });
    sendSuccess(res, {
        id,
        name: existingBgy.name,
        chairperson: chairName || 'Unassigned',
        chairpersonEmail: chairEmail || '',
        contact: phone || '',
        allocatedBudget: allocatedBudget || 0,
        totalBudget: allocatedBudget || 0,
        youthPopulation: updates.youth_population ?? updates.youthPopulation ?? 0,
        logo: updates.logo || updates.logo_url || DEFAULT_BARANGAY_LOGOS[existingBgy.name] || '',
        status: updates.status || 'Active',
    }, `Settings updated for Barangay ${existingBgy.name}.`);
});
// POST /api/barangays/:id/assign-chairperson - Super Admin: Assign SK Chairperson (Barangay Admin)
router.post('/:id/assign-chairperson', authenticateUser, requireRoles('SUPER_ADMIN'), async (req, res) => {
    const id = String(req.params.id);
    const admin = req.user;
    const parseResult = AssignChairpersonSchema.safeParse(req.body);
    if (!parseResult.success) {
        sendError(res, 'Validation failed', 400, parseResult.error.flatten().fieldErrors);
        return;
    }
    const { full_name, email, phone } = parseResult.data;
    const { data: existingBgy, error: fetchErr } = await supabaseAdmin
        .from('barangay')
        .select('id, name')
        .eq('id', id)
        .single();
    if (fetchErr || !existingBgy) {
        sendError(res, 'Barangay not found in Naga City registry.', 404);
        return;
    }
    // Check if user already exists in users table with this email
    const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id, email, tenant_id, role_id')
        .eq('email', email)
        .maybeSingle();
    if (existingUser) {
        const { error: updateErr } = await supabaseAdmin
            .from('users')
            .update({
            full_name,
            tenant_id: id,
            role_id: 2, // BARANGAY_ADMIN
            status: 'active',
            approved_by: admin.id,
            phone: phone || null,
            updated_at: new Date().toISOString(),
        })
            .eq('id', existingUser.id);
        if (updateErr) {
            sendError(res, `Failed to update user to SK Chairperson: ${updateErr.message}`, 500);
            return;
        }
    }
    else {
        const tempPassword = `Kabisig${new Date().getFullYear()}!`;
        const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name, tenant_id: id, role_id: 2 },
        });
        if (authErr || !authData.user) {
            sendError(res, authErr?.message || 'Failed to create chairperson auth account.', 500);
            return;
        }
        const { error: insertUserErr } = await supabaseAdmin.from('users').insert([
            {
                id: authData.user.id,
                tenant_id: id,
                role_id: 2, // BARANGAY_ADMIN
                full_name,
                email,
                phone: phone || null,
                status: 'active',
                approved_by: admin.id,
            },
        ]);
        if (insertUserErr) {
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            sendError(res, `Failed to register SK Chairperson in database: ${insertUserErr.message}`, 500);
            return;
        }
    }
    await recordAuditLog({
        tenantId: id,
        userId: admin.id,
        action: 'ASSIGN_SK_CHAIRPERSON',
        entityName: 'users',
        entityId: id,
        details: {
            assigned_chairperson: full_name,
            email,
            barangay: existingBgy.name,
            assigned_by: admin.full_name,
        },
        ipAddress: req.ip || null,
    });
    sendCreated(res, {
        tenant_id: id,
        barangay_name: existingBgy.name,
        chairperson: full_name,
        email,
    }, `Hon. ${full_name} successfully assigned as SK Chairperson (Barangay Admin) for Barangay ${existingBgy.name}.`);
});
export default router;
//# sourceMappingURL=barangay.routes.js.map