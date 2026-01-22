/**
 * Knowledge Reset - Conversation Store
 * 
 * Full conversation history stored in Supabase for:
 * - No memory loss
 * - Audit trail
 * - Context retrieval
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface ConversationMessage {
    id: string;
    conversationId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    modelUsed?: string;
    tokensUsed?: number;
    taskType?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
}

export interface Conversation {
    id: string;
    tenantId: string;
    userId: string;
    title?: string;
    status: 'active' | 'archived';
    createdAt: string;
    updatedAt: string;
}

/**
 * Create a new conversation
 */
export async function createConversation(
    tenantId: string,
    userId: string,
    title?: string
): Promise<Conversation | null> {
    const { data, error } = await supabase
        .from('conversations')
        .insert({
            tenant_id: tenantId,
            user_id: userId,
            title: title || 'New Conversation',
            status: 'active',
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to create conversation:', error);
        return null;
    }

    return {
        id: data.id,
        tenantId: data.tenant_id,
        userId: data.user_id,
        title: data.title,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
}

/**
 * Add a message to a conversation
 */
export async function addMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    options?: {
        modelUsed?: string;
        tokensUsed?: number;
        taskType?: string;
        metadata?: Record<string, unknown>;
    }
): Promise<ConversationMessage | null> {
    const { data, error } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            role,
            content,
            model_used: options?.modelUsed,
            tokens_used: options?.tokensUsed,
            metadata: {
                task_type: options?.taskType,
                ...options?.metadata,
            },
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to add message:', error);
        return null;
    }

    return {
        id: data.id,
        conversationId: data.conversation_id,
        role: data.role,
        content: data.content,
        modelUsed: data.model_used,
        tokensUsed: data.tokens_used,
        taskType: data.metadata?.task_type,
        metadata: data.metadata,
        createdAt: data.created_at,
    };
}

/**
 * Get conversation history
 */
export async function getConversationHistory(
    conversationId: string,
    limit: number = 50
): Promise<ConversationMessage[]> {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(limit);

    if (error) {
        console.error('Failed to get conversation history:', error);
        return [];
    }

    return data.map(msg => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        role: msg.role,
        content: msg.content,
        modelUsed: msg.model_used,
        tokensUsed: msg.tokens_used,
        taskType: msg.metadata?.task_type,
        metadata: msg.metadata,
        createdAt: msg.created_at,
    }));
}

/**
 * Get recent context for a conversation (for RAG)
 */
export async function getRecentContext(
    conversationId: string,
    messageCount: number = 10
): Promise<{ role: string; content: string }[]> {
    const history = await getConversationHistory(conversationId, messageCount);
    return history.map(msg => ({
        role: msg.role,
        content: msg.content,
    }));
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(
    conversationId: string,
    title: string
): Promise<void> {
    await supabase
        .from('conversations')
        .update({ title })
        .eq('id', conversationId);
}
