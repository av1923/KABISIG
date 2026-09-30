import express from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../services/supabase.service.js';
import { authenticateUser, requireActiveUser, requireRoles } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';
const router = express.Router();
const publishSchema = z.object({ announcement_id: z.string().uuid() });
router.post('/facebook/publish', authenticateUser, requireActiveUser, requireRoles('BARANGAY_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
    const parsed = publishSchema.safeParse(req.body);
    if (!parsed.success) {
        sendError(res, 'announcement_id must be a valid UUID.', 400, parsed.error.flatten().fieldErrors);
        return;
    }
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    if (!pageId || !pageAccessToken) {
        sendError(res, 'Facebook publishing is not configured. Set FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN.', 503);
        return;
    }
    const user = req.user;
    const { data: announcement, error: announcementError } = await supabaseAdmin
        .from('announcement')
        .select('id, tenant_id, title, content, what, where_text, event_when, hashtags, status')
        .eq('id', parsed.data.announcement_id)
        .maybeSingle();
    if (announcementError) {
        sendError(res, 'Unable to load the announcement for Facebook publishing.', 500);
        return;
    }
    if (!announcement) {
        sendError(res, 'Announcement not found.', 404);
        return;
    }
    if (user.role !== 'SUPER_ADMIN' && announcement.tenant_id !== user.tenant_id) {
        sendError(res, 'You are not authorized to publish this announcement.', 403);
        return;
    }
    if (announcement.status !== 'published') {
        sendError(res, 'Only published announcements can be sent to Facebook.', 409);
        return;
    }
    const version = process.env.FACEBOOK_GRAPH_VERSION || 'v25.0';
    const graphUrl = `https://graph.facebook.com/${encodeURIComponent(version)}/${encodeURIComponent(pageId)}/feed`;
    const details = [
        announcement.what ? `What: ${announcement.what}` : '',
        announcement.where_text ? `Where: ${announcement.where_text}` : '',
        announcement.event_when ? `When: ${announcement.event_when}` : '',
        announcement.content,
        announcement.hashtags || '',
    ].filter(Boolean).join('\n\n');
    const message = `${announcement.title}\n\n${details}`;
    try {
        const graphResponse = await fetch(graphUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ message, access_token: pageAccessToken }),
        });
        const graphBody = await graphResponse.json().catch(() => null);
        if (!graphResponse.ok || !graphBody?.id) {
            const apiMessage = graphBody?.error?.message;
            const graphError = graphBody?.error;
            console.error('Facebook Graph API publishing failed', {
                status: graphResponse.status,
                code: graphError?.code,
                type: graphError?.type,
                message: apiMessage,
            });
            sendError(res, apiMessage
                ? `Facebook publishing failed: ${apiMessage}`
                : `Facebook publishing failed with status ${graphResponse.status}.`, 502, {
                graph: {
                    code: graphError?.code,
                    type: graphError?.type,
                    message: apiMessage,
                },
            });
            return;
        }
        const postUrl = graphBody.post_url || `https://www.facebook.com/${encodeURIComponent(graphBody.id)}`;
        const postedAt = graphBody.posted_at || graphBody.created_time || new Date().toISOString();
        const { data: persistedPost, error: persistenceError } = await supabaseAdmin
            .from('social_media_posts')
            .insert({
            tenant_id: announcement.tenant_id,
            platform: 'facebook',
            post_url: postUrl,
            content: message,
            posted_at: postedAt,
        })
            .select('id, post_url, posted_at')
            .single();
        if (persistenceError || !persistedPost) {
            const dbMessage = persistenceError?.message || 'The Facebook post could not be persisted.';
            console.error('Facebook post persistence failed', {
                tenantId: announcement.tenant_id,
                announcementId: announcement.id,
                message: dbMessage,
            });
            sendError(res, `Facebook published, but saving the social post failed: ${dbMessage}`, 500);
            return;
        }
        sendSuccess(res, {
            id: persistedPost.id,
            post_id: graphBody.id,
            post_url: persistedPost.post_url,
            posted_at: persistedPost.posted_at,
            persisted: true,
        }, 'Announcement published to Facebook.');
    }
    catch {
        sendError(res, 'Facebook publishing failed because the Meta Graph API could not be reached.', 502);
    }
});
export default router;
//# sourceMappingURL=social.routes.js.map