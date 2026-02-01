/**
 * Conversation Modes for Knowledge Reset Chat
 * 
 * Defines different interaction modes and context tracking
 * for intelligent conversational knowledge ingestion.
 */

export type ConversationMode =
    | 'query'              // Standard Q&A - retrieve existing knowledge
    | 'knowledge_capture'  // Ingesting new knowledge through conversation
    | 'validation'         // Reviewing and validating drafted knowledge
    | 'investigation';     // Research mode with web search

export type GeographicScope = 'global' | 'regional' | 'country';

export type KnowledgeDomain =
    | 'legal'
    | 'accounting'
    | 'technical'
    | 'business'
    | 'compliance'
    | 'general';

export interface GeographicContext {
    scope: GeographicScope;
    country?: string;      // ISO country code (e.g., 'US', 'GB', 'DE')
    region?: string;       // e.g., 'EU', 'LATAM', 'APAC', 'North America'
    state?: string;        // For country-specific (e.g., 'Delaware', 'California')
}

export interface ConversationContext {
    mode: ConversationMode;
    topic?: string;
    domain?: KnowledgeDomain;
    geographic?: GeographicContext;
    missingInfo: string[];          // Questions that still need answers
    researchedTopics: string[];     // Topics we've already investigated
    confidence: number;             // 0-1, how confident we are in the knowledge
    readyToDraft: boolean;          // Whether we have enough info to create draft
}

export interface KnowledgeDraft {
    title: string;
    summary: string;
    content: string;
    metadata: {
        domain: KnowledgeDomain;
        geographic: GeographicContext;
        tags: string[];
        sources: string[];
        confidence: number;
        needsReview: boolean;
        createdAt: Date;
    };
}

export interface InvestigationResult {
    topic: string;
    findings: Array<{
        source: string;
        snippet: string;
        url: string;
        reliability: 'high' | 'medium' | 'low';
    }>;
    questions: string[];  // New questions raised by research
    confidence: number;
}

/**
 * Initialize a new conversation context
 */
export function createConversationContext(
    mode: ConversationMode = 'query',
    topic?: string
): ConversationContext {
    return {
        mode,
        topic,
        missingInfo: [],
        researchedTopics: [],
        confidence: 0,
        readyToDraft: false,
    };
}

/**
 * Update conversation context with new information
 */
export function updateContext(
    context: ConversationContext,
    updates: Partial<ConversationContext>
): ConversationContext {
    return {
        ...context,
        ...updates,
    };
}

/**
 * Determine if we have enough information to draft knowledge
 */
export function canDraftKnowledge(context: ConversationContext): boolean {
    return (
        context.mode === 'knowledge_capture' &&
        context.topic !== undefined &&
        context.domain !== undefined &&
        context.geographic !== undefined &&
        context.missingInfo.length === 0 &&
        context.confidence >= 0.7
    );
}

/**
 * Extract questions from conversation that need answers
 */
export function extractMissingInfo(
    userMessage: string,
    context: ConversationContext
): string[] {
    // This would use LLM to identify gaps
    // For now, return existing missing info
    return context.missingInfo;
}
