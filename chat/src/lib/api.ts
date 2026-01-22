import { GraphQLClient } from 'graphql-request';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/graphql';

export function createClient(token?: string) {
    return new GraphQLClient(API_URL, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
}

// Queries
export const SEARCH_DOCUMENTS = `
  query SearchDocuments($query: String!, $limit: Int) {
    search(input: { query: $query, limit: $limit }) {
      document {
        id
        title
        contentText
        sourceUrl
      }
      score
    }
  }
`;

export const GET_APPLICATIONS = `
  query GetApplications {
    applications {
      id
      name
      description
      urlDocBase
      status
    }
  }
`;

export const GET_DOCUMENTS = `
  query GetDocuments($appId: ID, $limit: Int, $offset: Int) {
    documents(appId: $appId, limit: $limit, offset: $offset) {
      id
      title
      contentText
      sourceUrl
      breadcrumbs {
        text
        href
      }
    }
  }
`;

// Types
export interface SearchResult {
    document: {
        id: string;
        title: string;
        contentText: string | null;
        sourceUrl: string;
    };
    score: number;
}

export interface Application {
    id: string;
    name: string;
    description: string | null;
    urlDocBase: string;
    status: string;
}

export interface Document {
    id: string;
    title: string;
    contentText: string | null;
    sourceUrl: string;
    breadcrumbs: { text: string; href: string }[];
}

// API functions
export async function searchDocuments(
    query: string,
    token?: string,
    limit: number = 5
): Promise<SearchResult[]> {
    const client = createClient(token);
    try {
        const data = await client.request<{ search: SearchResult[] }>(SEARCH_DOCUMENTS, {
            query,
            limit,
        });
        return data.search;
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

export async function getApplications(token?: string): Promise<Application[]> {
    const client = createClient(token);
    try {
        const data = await client.request<{ applications: Application[] }>(GET_APPLICATIONS);
        return data.applications;
    } catch (error) {
        console.error('Get applications error:', error);
        return [];
    }
}

export async function getDocuments(
    token?: string,
    appId?: string,
    limit: number = 50,
    offset: number = 0
): Promise<Document[]> {
    const client = createClient(token);
    try {
        const data = await client.request<{ documents: Document[] }>(GET_DOCUMENTS, {
            appId,
            limit,
            offset,
        });
        return data.documents;
    } catch (error) {
        console.error('Get documents error:', error);
        return [];
    }
}
