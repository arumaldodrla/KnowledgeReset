/**
 * Knowledge Reset - Pending Knowledge Store
 * 
 * Manages knowledge entries awaiting human approval before
 * being added to the knowledge base.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface PendingKnowledge {
    id: string;
    tenantId: string;
    userId: string;
    conversationId?: string;
    title: string;
    content: string;
    sourceType: 'document' | 'web' | 'user_input' | 'conversation';
    sourceUrl?: string;
    category?: string;
    tags?: string[];
    verificationNotes?: string;
    status: 'pending' | 'approved' | 'rejected' | 'edited';
    createdAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
}

/**
 * Create a pending knowledge entry for approval
 */
export async function createPendingKnowledge(
    entry: Omit<PendingKnowledge, 'id' | 'status' | 'createdAt'>
): Promise<PendingKnowledge | null> {
    const { data, error } = await supabase
        .from('knowledge_corrections')
        .insert({
            tenant_id: entry.tenantId,
            conversation_id: entry.conversationId,
            corrected_content: JSON.stringify({
                title: entry.title,
                content: entry.content,
                source_type: entry.sourceType,
                source_url: entry.sourceUrl,
                category: entry.category,
                tags: entry.tags,
                verification_notes: entry.verificationNotes,
            }),
            correction_type: 'addition',
            status: 'pending',
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to create pending knowledge:', error);
        return null;
    }

    const parsed = JSON.parse(data.corrected_content);
    return {
        id: data.id,
        tenantId: data.tenant_id || entry.tenantId,
        userId: entry.userId,
        conversationId: data.conversation_id,
        title: parsed.title,
        content: parsed.content,
        sourceType: parsed.source_type,
        sourceUrl: parsed.source_url,
        category: parsed.category,
        tags: parsed.tags,
        verificationNotes: parsed.verification_notes,
        status: data.status,
        createdAt: data.created_at,
        reviewedAt: data.reviewed_at,
        reviewedBy: data.reviewed_by,
    };
}

/**
 * Approve a pending knowledge entry and add to knowledge base
 */
export async function approveKnowledge(
    pendingId: string,
    reviewerId: string,
    editedContent?: string
): Promise<boolean> {
    // Get the pending entry
    const { data: pending, error: fetchError } = await supabase
        .from('knowledge_corrections')
        .select('*')
        .eq('id', pendingId)
        .single();

    if (fetchError || !pending) {
        console.error('Failed to fetch pending knowledge:', fetchError);
        return false;
    }

    const parsed = JSON.parse(editedContent || pending.corrected_content);

    // Create document in knowledge base
    const { error: insertError } = await supabase
        .from('documents')
        .insert({
            tenant_id: pending.tenant_id,
            app_id: parsed.app_id || null, // Will need to be set
            title: parsed.title,
            content_text: parsed.content,
            source_url: parsed.source_url || `knowledge://user-input/${pendingId}`,
            metadata: {
                source_type: parsed.source_type,
                category: parsed.category,
                tags: parsed.tags,
                approved_by: reviewerId,
                approved_at: new Date().toISOString(),
            },
        });

    if (insertError) {
        console.error('Failed to insert knowledge:', insertError);
        return false;
    }

    // Update pending status
    await supabase
        .from('knowledge_corrections')
        .update({
            status: 'approved',
            reviewed_by: reviewerId,
            reviewed_at: new Date().toISOString(),
        })
        .eq('id', pendingId);

    return true;
}

/**
 * Reject a pending knowledge entry
 */
export async function rejectKnowledge(
    pendingId: string,
    reviewerId: string,
    reason?: string
): Promise<boolean> {
    const { error } = await supabase
        .from('knowledge_corrections')
        .update({
            status: 'rejected',
            reviewed_by: reviewerId,
            reviewed_at: new Date().toISOString(),
            original_content: reason, // Store rejection reason
        })
        .eq('id', pendingId);

    return !error;
}

/**
 * Get pending knowledge entries for a tenant
 */
export async function getPendingKnowledge(
    tenantId: string
): Promise<PendingKnowledge[]> {
    const { data, error } = await supabase
        .from('knowledge_corrections')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to get pending knowledge:', error);
        return [];
    }

    return data.map(item => {
        const parsed = JSON.parse(item.corrected_content);
        return {
            id: item.id,
            tenantId: item.tenant_id || tenantId,
            userId: item.reviewed_by || '',
            conversationId: item.conversation_id,
            title: parsed.title,
            content: parsed.content,
            sourceType: parsed.source_type,
            sourceUrl: parsed.source_url,
            category: parsed.category,
            tags: parsed.tags,
            verificationNotes: parsed.verification_notes,
            status: item.status,
            createdAt: item.created_at,
            reviewedAt: item.reviewed_at,
            reviewedBy: item.reviewed_by,
        };
    });
}
