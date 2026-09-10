import { SupabaseClient } from '@supabase/supabase-js';
import type { AuthenticatedUser } from '../types/database.types.js';
export declare const supabase: SupabaseClient;
export declare const supabaseAdmin: SupabaseClient;
export declare function createUserClient(token: string): SupabaseClient;
export declare function canAccessTenant(user: AuthenticatedUser, targetTenantId: string | null | undefined): boolean;
export declare function recordAuditLog(params: {
    tenantId?: string | null | undefined;
    userId?: string | null | undefined;
    action: string;
    entityName: string;
    entityId?: string | null | undefined;
    details?: Record<string, unknown> | null | undefined;
    ipAddress?: string | null | undefined;
}): Promise<void>;
//# sourceMappingURL=supabase.service.d.ts.map