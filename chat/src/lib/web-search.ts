export interface WebSearchResult {
    title: string;
    url: string;
    snippet: string;
    score?: number;
}

/**
 * Search the web using Tavily API
 * Fallback for when Knowledge Base has no relevant information
 */
export async function searchWeb(
    query: string,
    maxResults: number = 5
): Promise<WebSearchResult[]> {
    try {
        const apiKey = process.env.TAVILY_API_KEY;

        if (!apiKey) {
            console.warn('TAVILY_API_KEY not set, web search disabled');
            return [];
        }

        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: apiKey,
                query,
                max_results: maxResults,
                include_answer: false,
                search_depth: 'basic',
            }),
        });

        if (!response.ok) {
            throw new Error(`Tavily API error: ${response.statusText}`);
        }

        const data = await response.json();
        return (data.results || []).map((result: any) => ({
            title: result.title,
            url: result.url,
            snippet: result.content || result.snippet || '',
            score: result.score,
        }));
    } catch (error) {
        console.error('Web search error:', error);
        return [];
    }
}

/**
 * Format web search results as context for LLM
 */
export function formatWebSearchContext(results: WebSearchResult[]): string {
    if (results.length === 0) {
        return '';
    }

    const contextHeader = '# Web Search Results\n\n';
    const formattedResults = results
        .map(
            (result, i) =>
                `[Web Source ${i + 1}] **${result.title}**\n` +
                `URL: ${result.url}\n` +
                `${result.snippet}\n`
        )
        .join('\n---\n\n');

    return contextHeader + formattedResults;
}
