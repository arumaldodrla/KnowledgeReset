import { openai } from '@ai-sdk/openai';
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

export const runtime = 'edge';

/**
 * Get the appropriate AI SDK model instance
 */
function getModelInstance(config: ModelConfig): LanguageModel {
    switch (config.provider) {
        case 'anthropic':
            return anthropic(config.model);
        case 'google':
            return google(config.model);
        case 'openai':
        default:
            return openai(config.model);
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

        // Step 2: Select model based on task
        const modelConfig = selectModel(taskType, false);

        // Step 3: Get task-specific system prompt
        const systemPrompt = getSystemPrompt(taskType, context);

        // Step 4: Call the LLM
        const model = getModelInstance(modelConfig);

        const result = streamText({
            model,
            system: systemPrompt,
            messages,
        });

        // Return streaming response with metadata header
        const response = result.toTextStreamResponse();

        // Add metadata headers
        response.headers.set('X-Task-Type', taskType);
        response.headers.set('X-Model-Used', modelConfig.model);
        response.headers.set('X-Model-Tier', modelConfig.tier);

        return response;

    } catch (error) {
        console.error('Chat API error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process request' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
