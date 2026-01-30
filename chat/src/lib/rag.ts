import { createClient } from '@supabase/supabase-js';

export interface RetrievedDocument {
    id: string;
    title: string;
    content: string;
    source_url: string;
    similarity: number;
}

export class RAGRetriever {
    private supabase;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    /**
     * Retrieve relevant documents using vector similarity search
     */
    async retrieveRelevant(
        query: string,
        limit: number = 5,
        threshold: number = 0.7
    ): Promise<RetrievedDocument[]> {
        try {
            // Validate query
            if (!query || !query.trim()) {
                console.warn('Empty query provided to RAG retriever');
                return [];
            }

            // Check for API key
            if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
                console.error('GOOGLE_GENERATIVE_AI_API_KEY not set');
                return [];
            }

            // 1. Generate embedding for query using Gemini
            const embeddingResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'models/text-embedding-004',
                        content: { parts: [{ text: query }] },
                    }),
                }
            );

            if (!embeddingResponse.ok) {
                const errorText = await embeddingResponse.text();
                console.error('Embedding API error:', errorText);
                throw new Error(`Failed to generate embedding: ${embeddingResponse.status}`);
            }

            const embeddingData = await embeddingResponse.json();
            const embedding = embeddingData.embedding?.values;

            if (!embedding) {
                console.error('No embedding in response:', embeddingData);
                throw new Error('No embedding returned from API');
            }

            // 2. Vector similarity search using Supabase RPC
            const { data, error } = await this.supabase.rpc('match_documents', {
                query_embedding: embedding,
                match_threshold: threshold,
                match_count: limit,
            });

            if (error) {
                console.error('Vector search error:', error);
                throw error;
            }

            return (data || []) as RetrievedDocument[];
        } catch (error) {
            console.error('RAG retrieval error:', error);
            return []; // Return empty array on error to allow graceful degradation
        }
    }

    /**
     * Format retrieved documents as context for LLM prompt
     */
    formatContext(docs: RetrievedDocument[]): string {
        if (docs.length === 0) {
            return '';
        }

        const contextHeader = '# Context from Knowledge Base\n\n';
        const formattedDocs = docs
            .map(
                (doc, i) =>
                    `[Source ${i + 1}] **${doc.title}**\n` +
                    `URL: ${doc.source_url}\n` +
                    `Relevance: ${Math.round(doc.similarity * 100)}%\n` +
                    `Content: ${doc.content.slice(0, 800)}${doc.content.length > 800 ? '...' : ''}\n`
            )
            .join('\n---\n\n');

        return contextHeader + formattedDocs;
    }

    /**
     * Check if retrieved documents are high quality
     */
    hasHighQualityResults(docs: RetrievedDocument[], minSimilarity: number = 0.75): boolean {
        return docs.length > 0 && docs.some(doc => doc.similarity >= minSimilarity);
    }
}
