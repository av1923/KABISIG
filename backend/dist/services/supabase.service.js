import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
// Resolve .env.local dynamically relative to current execution context
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
// Support both Express backend and Next.js frontend env key naming conventions
const supabaseUrl = process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
    supabaseAnonKey;
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️ Environment variables missing in supabase.service.ts:', {
        SUPABASE_URL: supabaseUrl ? 'Set' : 'Missing',
        SUPABASE_ANON_KEY: supabaseAnonKey ? 'Set' : 'Missing',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
    });
}
// Client for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});
// Admin client using service_role key to bypass RLS for server-side logic
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});
export function createUserClient(token) {
    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
        global: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    });
}
export function canAccessTenant(user, targetTenantId) {
    const citywideRoles = ['SUPER_ADMIN'];
    if (citywideRoles.includes(user.role)) {
        return true;
    }
    if (!user.tenant_id || !targetTenantId) {
        return false;
    }
    return user.tenant_id.toLowerCase() === targetTenantId.toLowerCase();
}
export async function recordAuditLog(params) {
    try {
        await supabaseAdmin.from('audit_logs').insert([
            {
                tenant_id: params.tenantId || null,
                user_id: params.userId || null,
                action: params.action,
                entity_name: params.entityName,
                entity_id: params.entityId || null,
                details: params.details || null,
                ip_address: params.ipAddress || null,
            },
        ]);
    }
    catch (err) {
        console.error('Failed to write audit log:', err);
    }
}
//# sourceMappingURL=supabase.service.js.map