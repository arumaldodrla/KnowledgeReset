/**
 * useConversation Hook
 * Manages conversation state for knowledge capture mode
 */

import { useState, useCallback } from 'react';
import type { ConversationContext, KnowledgeDraft } from '../lib/conversation-modes';
import { createConversationContext, canDraftKnowledge } from '../lib/conversation-modes';

export type ChatMode = 'query' | 'knowledge_capture';

export function useConversation() {
    const [mode, setMode] = useState<ChatMode>('query');
    const [context, setContext] = useState<ConversationContext>(
        createConversationContext('query')
    );
    const [draft, setDraft] = useState<KnowledgeDraft | null>(null);

    const switchMode = useCallback((newMode: ChatMode) => {
        setMode(newMode);
        setContext(createConversationContext(newMode));
        setDraft(null);
    }, []);

    const updateContext = useCallback((updates: Partial<ConversationContext>) => {
        setContext(prev => ({
            ...prev,
            ...updates,
            // Auto-check if ready to draft
            readyToDraft: canDraftKnowledge({ ...prev, ...updates }),
        }));
    }, []);

    const setTopic = useCallback((topic: string) => {
        updateContext({ topic });
    }, [updateContext]);

    const setDomain = useCallback((domain: ConversationContext['domain']) => {
        updateContext({ domain });
    }, [updateContext]);

    const setGeographic = useCallback((geographic: ConversationContext['geographic']) => {
        updateContext({ geographic });
    }, [updateContext]);

    const addMissingInfo = useCallback((info: string) => {
        setContext(prev => ({
            ...prev,
            missingInfo: [...prev.missingInfo, info],
        }));
    }, []);

    const removeMissingInfo = useCallback((info: string) => {
        setContext(prev => ({
            ...prev,
            missingInfo: prev.missingInfo.filter(i => i !== info),
        }));
    }, []);

    const updateConfidence = useCallback((confidence: number) => {
        updateContext({ confidence });
    }, [updateContext]);

    const createDraft = useCallback((newDraft: KnowledgeDraft) => {
        setDraft(newDraft);
    }, []);

    const clearDraft = useCallback(() => {
        setDraft(null);
    }, []);

    const resetConversation = useCallback(() => {
        setContext(createConversationContext(mode));
        setDraft(null);
    }, [mode]);

    return {
        mode,
        context,
        draft,
        switchMode,
        updateContext,
        setTopic,
        setDomain,
        setGeographic,
        addMissingInfo,
        removeMissingInfo,
        updateConfidence,
        createDraft,
        clearDraft,
        resetConversation,
    };
}
