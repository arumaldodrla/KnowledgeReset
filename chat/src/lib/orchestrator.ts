/**
 * Knowledge Reset - Intelligent LLM Orchestration
 * 
 * Automatically routes requests to optimal LLM based on:
 * - Task type (ingestion, query, extraction)
 * - Cost optimization
 * - Confidence scoring with auto-escalation
 */

export type TaskType =
    | 'knowledge_ingestion'   // Adding new docs to KB
    | 'query'                 // Simple Q&A
    | 'extraction'            // Structured data extraction
    | 'summarization'         // Compress/summarize
    | 'verification';         // Fact-check

export type Provider = 'anthropic' | 'google';
export type ModelTier = 'economy' | 'standard' | 'premium';

export interface ModelConfig {
    provider: Provider;
    model: string;
    tier: ModelTier;
    maxTokens: number;
    costPer1kInput: number;  // USD
    costPer1kOutput: number; // USD
}

// Model configurations (Google Gemini + Anthropic Claude only)
export const MODELS: Record<string, ModelConfig> = {
    // Economy tier - fast, cheap
    'gemini-2.0-flash': {
        provider: 'google',
        model: 'gemini-2.0-flash',
        tier: 'economy',
        maxTokens: 8192,
        costPer1kInput: 0.0001,
        costPer1kOutput: 0.0004,
    },

    // Standard tier - balanced
    'claude-sonnet': {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        tier: 'standard',
        maxTokens: 8192,
        costPer1kInput: 0.003,
        costPer1kOutput: 0.015,
    },

    // Premium tier - highest quality
    'claude-opus': {
        provider: 'anthropic',
        model: 'claude-opus-4-20250514',
        tier: 'premium',
        maxTokens: 32768,
        costPer1kInput: 0.015,
        costPer1kOutput: 0.075,
    },
};

// Task to model mapping (Google Gemini + Anthropic Claude only)
export const TASK_MODEL_ROUTING: Record<TaskType, {
    primary: string;
    fallback: string;
    escalation: string;
}> = {
    knowledge_ingestion: {
        primary: 'claude-sonnet',     // Best for structured extraction
        fallback: 'gemini-2.0-flash', // Fast fallback
        escalation: 'claude-opus',    // Premium for low-confidence
    },
    query: {
        primary: 'gemini-2.0-flash',  // Fast and cost-effective for simple queries
        fallback: 'claude-sonnet',
        escalation: 'claude-opus',    // Premium tier if complex
    },
    extraction: {
        primary: 'claude-sonnet',     // Excellent structured output
        fallback: 'gemini-2.0-flash',
        escalation: 'claude-opus',
    },
    summarization: {
        primary: 'gemini-2.0-flash',  // Fast, cheap, good at compression
        fallback: 'claude-sonnet',
        escalation: 'claude-opus',
    },
    verification: {
        primary: 'claude-sonnet',     // Reliable, low hallucination
        fallback: 'gemini-2.0-flash',
        escalation: 'claude-opus',
    },
};

/**
 * Intent classification patterns
 * Uses keyword matching for lightweight classification
 */
export function classifyIntent(message: string): TaskType {
    const lowerMessage = message.toLowerCase();

    // Knowledge ingestion patterns
    const ingestionPatterns = [
        'learn this', 'remember this', 'add to knowledge', 'ingest',
        'here is information about', 'document:', 'add this:',
        'store this', 'save this information', 'add to the knowledge base',
    ];

    // Extraction patterns
    const extractionPatterns = [
        'extract', 'list all', 'give me a table of', 'structured',
        'parse this', 'get the data from', 'pull out',
    ];

    // Summarization patterns
    const summaryPatterns = [
        'summarize', 'summary', 'tldr', 'brief', 'in short',
        'condense', 'main points', 'key takeaways',
    ];

    // Verification patterns
    const verificationPatterns = [
        'is it true', 'verify', 'fact check', 'confirm',
        'is this correct', 'validate', 'double check',
    ];

    if (ingestionPatterns.some(p => lowerMessage.includes(p))) {
        return 'knowledge_ingestion';
    }
    if (extractionPatterns.some(p => lowerMessage.includes(p))) {
        return 'extraction';
    }
    if (summaryPatterns.some(p => lowerMessage.includes(p))) {
        return 'summarization';
    }
    if (verificationPatterns.some(p => lowerMessage.includes(p))) {
        return 'verification';
    }

    // Default to query
    return 'query';
}

/**
 * Confidence scoring criteria
 * Returns true if response should escalate to premium model
 */
export interface ConfidenceCheck {
    shouldEscalate: boolean;
    reasons: string[];
}

export function checkConfidence(response: string, taskType: TaskType): ConfidenceCheck {
    const reasons: string[] = [];

    // Low-confidence indicators
    const uncertaintyPhrases = [
        'i\'m not sure',
        'i don\'t have information',
        'i cannot find',
        'no documentation found',
        'this may not be accurate',
        'i\'m uncertain',
        'based on limited information',
        'i couldn\'t verify',
    ];

    const hedgingPhrases = [
        'probably', 'possibly', 'might be', 'could be',
        'i think', 'it seems', 'appears to be', 'may be',
    ];

    // Check for uncertainty
    const hasUncertainty = uncertaintyPhrases.some(p =>
        response.toLowerCase().includes(p)
    );
    if (hasUncertainty) {
        reasons.push('Response contains uncertainty indicators');
    }

    // Check for excessive hedging (more than 3 instances)
    const hedgingCount = hedgingPhrases.filter(p =>
        response.toLowerCase().includes(p)
    ).length;
    if (hedgingCount >= 3) {
        reasons.push(`Response contains ${hedgingCount} hedging phrases`);
    }

    // For ingestion tasks, require sources
    if (taskType === 'knowledge_ingestion') {
        const hasNoCitations = !response.includes('[') && !response.includes('source');
        if (hasNoCitations) {
            reasons.push('Knowledge ingestion response lacks source citations');
        }
    }

    // Very short responses for complex tasks
    if (['knowledge_ingestion', 'extraction'].includes(taskType) && response.length < 200) {
        reasons.push('Response too short for complex task');
    }

    return {
        shouldEscalate: reasons.length >= 2, // Escalate if 2+ issues
        reasons,
    };
}

/**
 * Get the appropriate model for a task
 */
export function selectModel(
    taskType: TaskType,
    isEscalation: boolean = false
): ModelConfig {
    const routing = TASK_MODEL_ROUTING[taskType];
    const modelKey = isEscalation ? routing.escalation : routing.primary;
    return MODELS[modelKey];
}
