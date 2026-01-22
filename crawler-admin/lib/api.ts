import { GraphQLClient } from 'graphql-request';
import { createClient } from '@supabase/supabase-js';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const graphql = {
  request: async <T>(query: string, variables?: any) => {
    console.log('Fetching from API:', API_URL);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const client = new GraphQLClient(API_URL, { headers });
      return await client.request<T>(query, variables);
    } catch (error) {
      console.error('API Request Failed:', error);
      console.error('API URL:', API_URL);
      throw error;
    }
  }
};

// Create Application
export const CREATE_APPLICATION = `
  mutation CreateApplication($input: CreateApplicationInput!) {
    createApplication(input: $input) {
      id
      name
      urlDocBase
      description
    }
  }
`;

// List Applications
export const GET_APPLICATIONS = `
  query GetApplications {
    applications {
      id
      name
      urlDocBase
      description
      status
      createdAt
    }
  }
`;

// Start Crawl Job
export const START_CRAWL = `
  mutation StartCrawl($appId: String!, $url: String, $maxDepth: Int, $maxPages: Int) {
    startCrawl(appId: $appId, url: $url, maxDepth: $maxDepth, maxPages: $maxPages) {
      jobId
      status
      message
    }
  }
`;

// Get Crawl Jobs  
export const GET_CRAWL_JOBS = `
  query GetCrawlJobs($appId: ID, $limit: Int) {
    crawlJobs(appId: $appId, limit: $limit) {
      id
      appId
      status
      startTime
      endTime
      pagesProcessed
      errors {
        id
        errorMessage
        url
      }
    }
  }
`;

export interface Application {
  id: string;
  name: string;
  urlDocBase: string;
  description?: string;
  status?: string;
  createdAt?: string;
}

export interface CrawlJob {
  id: string;
  appId: string;
  status: string;
  startTime: string;
  endTime?: string;
  pagesProcessed?: number;
  errors?: Array<{
    id: string;
    errorMessage: string;
    url: string;
  }>;
}

export interface CreateUserInput {
  email: string;
  password: string;
  fullName?: string;
}

export const CREATE_USER = `
    mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
            id
            email
            createdAt
        }
    }
`;

export interface User {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt?: string;
}

export const GET_USERS = `
    query GetUsers {
        users {
            id
            email
            createdAt
            lastSignInAt
        }
    }
`;
