import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { streamText, LanguageModel } from 'ai';
import {
    classifyIntent,
    selectModel,
    checkConfidence,
    TaskType,
    ModelConfig
} from '@/lib/orchestrator';
import { getSystemPrompt } from '@/lib/prompts';
import { RAGRetriever, RetrievedDocument } from '@/lib/rag';
import { searchWeb, formatWebSearchContext } from '@/lib/web-search';

export const runtime = 'edge';

/**
 * Get the appropriate AI SDK model instance
 * Using Google Gemini and Anthropic Claude only (no OpenAI)
 */
function getModelInstance(config: ModelConfig): LanguageModel {
    switch (config.provider) {
        case 'anthropic':
            return anthropic(config.model);
        case 'google':
        default:
            return google(config.model);
    }
}

export async function POST(req: Request) {
    try {
        const { messages, context, conversationId } = await req.json();

        // Get the latest user message
        const lastUserMessage = messages
            .filter((m: { role: string }) => m.role === 'user')
            .pop();

        const userInput = lastUserMessage?.content || '';

        // Step 1: Classify intent
        const taskType: TaskType = classifyIntent(userInput);

        // Step 2: RAG Retrieval (for query, verification, and summarization tasks)
        let ragContext = '';
        let sources: RetrievedDocument[] = [];
        let searchType: 'knowledge_base' | 'web' | 'none' = 'none';

        if (['query', 'verification', 'summarization'].includes(taskType)) {
            try {
                // Validate environment variables
                if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
                    console.warn('Supabase credentials not configured, skipping RAG retrieval');
                } else {
                    const retriever = new RAGRetriever(
                        process.env.NEXT_PUBLIC_SUPABASE_URL,
                        process.env.SUPABASE_SERVICE_KEY
                    );

                    sources = await retriever.retrieveRelevant(userInput, 5, 0.7);

                    if (retriever.hasHighQualityResults(sources, 0.75)) {
                        // High-quality KB results found
                        ragContext = retriever.formatContext(sources);
                        searchType = 'knowledge_base';
                    } else if (sources.length === 0 || !retriever.hasHighQualityResults(sources, 0.6)) {
                        // Low-quality or no KB results, fallback to web search
                        console.log('No high-quality KB results, searching web...');
                        const webResults = await searchWeb(userInput);

                        if (webResults.length > 0) {
                            ragContext = formatWebSearchContext(webResults);
                            searchType = 'web';
                            // Convert web results to source format for UI
                            sources = webResults.map(r => ({
                                id: r.url,
                                title: r.title,
                                content: r.snippet,
                                source_url: r.url,
                                similarity: r.score || 0.8,
                            }));
                        }
                    } else {
                        // Medium-quality KB results
                        ragContext = retriever.formatContext(sources);
                        searchType = 'knowledge_base';
                    }
                }
            } catch (ragError) {
                console.error('RAG retrieval failed, continuing without context:', ragError);
                // Continue without RAG context - don't fail the entire request
            }
        }

        // Step 3: Select model based on task
        const modelConfig = selectModel(taskType, false);

        // Step 4: Get task-specific system prompt with RAG context
        const systemPrompt = getSystemPrompt(taskType, ragContext || context);

        // Step 5: Call the LLM
        const model = getModelInstance(modelConfig);

        const result = streamText({
            model,
            system: systemPrompt,
            messages,
        });

        // Return streaming response with metadata headers
        const response = result.toTextStreamResponse();

        // Add metadata headers
        response.headers.set('X-Task-Type', taskType);
        response.headers.set('X-Model-Used', modelConfig.model);
        response.headers.set('X-Model-Tier', modelConfig.tier);
        response.headers.set('X-Search-Type', searchType);
        response.headers.set('X-Sources', JSON.stringify(sources));

        return response;

    } catch (error) {
        console.error('Chat API error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process request' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
