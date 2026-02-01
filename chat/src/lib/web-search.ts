export interface WebSearchResult {
    title: string;
    url: string;
    snippet: string;
    score?: number;
}

export interface InvestigationResult {
    topic: string;
    mainFindings: WebSearchResult[];
    questionAnswers: Array<{
        question: string;
        findings: WebSearchResult[];
    }>;
    sources: string[];
    reliability: {
        reliable: WebSearchResult[];
        questionable: WebSearchResult[];
    };
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
 * Conduct deep investigation on a topic with multiple queries
 * Used for knowledge ingestion to gather comprehensive information
 */
export async function investigateTopic(
    topic: string,
    questions: string[] = []
): Promise<InvestigationResult> {
    try {
        // Main topic search
        const mainFindings = await searchWeb(topic, 10);

        // Search for each specific question
        const questionAnswers = await Promise.all(
            questions.map(async (question) => ({
                question,
                findings: await searchWeb(question, 5),
            }))
        );

        // Collect all sources
        const allResults = [
            ...mainFindings,
            ...questionAnswers.flatMap(qa => qa.findings),
        ];

        const sources = Array.from(new Set(allResults.map(r => r.url)));

        // Validate source reliability
        const reliability = validateSources(allResults);

        return {
            topic,
            mainFindings,
            questionAnswers,
            sources,
            reliability,
        };
    } catch (error) {
        console.error('Investigation error:', error);
        return {
            topic,
            mainFindings: [],
            questionAnswers: [],
            sources: [],
            reliability: { reliable: [], questionable: [] },
        };
    }
}

/**
 * Validate source reliability based on domain
 */
export function validateSources(sources: WebSearchResult[]): {
    reliable: WebSearchResult[];
    questionable: WebSearchResult[];
} {
    // Highly reliable domains
    const reliableDomains = [
        // Government
        '.gov', '.gov.uk', '.gc.ca', '.gov.au',
        // Education
        '.edu', '.ac.uk', '.edu.au',
        // International organizations
        'un.org', 'oecd.org', 'worldbank.org', 'imf.org',
        // Legal/Financial authorities
        'irs.gov', 'sec.gov', 'ftc.gov', 'fca.org.uk',
        // Established references
        'wikipedia.org', 'britannica.com',
        // Professional organizations
        'aicpa.org', 'aba.com', 'ieee.org',
    ];

    const reliable: WebSearchResult[] = [];
    const questionable: WebSearchResult[] = [];

    sources.forEach(source => {
        const isReliable = reliableDomains.some(domain =>
            source.url.toLowerCase().includes(domain)
        );

        if (isReliable) {
            reliable.push(source);
        } else {
            questionable.push(source);
        }
    });

    return { reliable, questionable };
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

/**
 * Format investigation results for LLM with reliability indicators
 */
export function formatInvestigationContext(investigation: InvestigationResult): string {
    let context = `# Investigation Results: ${investigation.topic}\n\n`;

    // Reliable sources first
    if (investigation.reliability.reliable.length > 0) {
        context += '## Reliable Sources\n\n';
        investigation.reliability.reliable.forEach((result, i) => {
            context += `[${i + 1}] **${result.title}**\n`;
            context += `URL: ${result.url}\n`;
            context += `${result.snippet}\n\n`;
        });
    }

    // Question-specific findings
    if (investigation.questionAnswers.length > 0) {
        context += '## Specific Questions Researched\n\n';
        investigation.questionAnswers.forEach(qa => {
            context += `### Q: ${qa.question}\n\n`;
            qa.findings.forEach((result, i) => {
                context += `[${i + 1}] ${result.title}\n`;
                context += `${result.snippet}\n`;
                context += `Source: ${result.url}\n\n`;
            });
        });
    }

    // Other sources
    if (investigation.reliability.questionable.length > 0) {
        context += '## Additional Sources (verify independently)\n\n';
        investigation.reliability.questionable.slice(0, 5).forEach((result, i) => {
            context += `[${i + 1}] ${result.title} - ${result.url}\n`;
        });
    }

    return context;
}

