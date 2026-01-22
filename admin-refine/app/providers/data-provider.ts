import { GraphQLClient } from "graphql-request";
import { DataProvider } from "@refinedev/core";
import { gql } from "graphql-request";
import { supabaseClient } from "../utils/supabase-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api-nu-seven-51.vercel.app/graphql";

const supabase = supabaseClient;

const getClient = async () => {
  let { data } = await supabase.auth.getSession();
  let token = data.session?.access_token;

  if (!token) {
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

    if (refreshData.session) {
      token = refreshData.session.access_token;
    } else {
      console.error("❌ [DataProvider] Session refresh failed:", refreshError);
      // Construct a custom error that Refine might handle gracefully, or just throw
      // to prevents the network request.
      const error = new Error("Auth session missing!");
      (error as any).statusCode = 401; // Mimic a 401
      throw error;
    }
  }

  return new GraphQLClient(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/* GraphQL Queries */
const GET_APPLICATIONS = gql`
  query GetApplications {
    applications {
      id
      name
      urlDocBase
      description
      status
      lastCrawlAt
      createdAt
    }
  }
`;

const GET_APPLICATION = gql`
  query GetApplication($id: ID!) {
    application(id: $id) {
      id
      name
      urlDocBase
      description
      status
      lastCrawlAt
      createdAt
    }
  }
`;

const CREATE_APPLICATION = gql`
  mutation CreateApplication($name: String!, $urlDocBase: String!, $description: String) {
    createApplication(name: $name, urlDocBase: $urlDocBase, description: $description) {
      success
      message
      application {
        id
        name
        urlDocBase
        description
      }
    }
  }
`;

const DELETE_APPLICATION = gql`
  mutation DeleteApplication($appId: ID!) {
    deleteApplication(appId: $appId)
  }
`;

const GET_CRAWL_JOBS = gql`
  query GetCrawlJobs {
    crawlJobs {
      id
      appId
      status
      startedAt
      stats
    }
  }
`;

const GET_DOCUMENTS = gql`
  query GetDocuments {
    documents {
      id
      appId
      title
      sourceUrl
      contentText
      breadcrumbs {
        text
        href
      }
      createdAt
    }
  }
`;

export const dataProvider: DataProvider = {
  getList: async ({ resource }) => {
    try {
      const client = await getClient();

      if (resource === "applications") {
        const data: any = await client.request(GET_APPLICATIONS);
        return {
          data: data.applications || [],
          total: data.applications?.length || 0,
        };
      }

      if (resource === "crawlJobs") {
        const data: any = await client.request(GET_CRAWL_JOBS);
        return {
          data: data.crawlJobs || [],
          total: data.crawlJobs?.length || 0,
        };
      }

      if (resource === "documents") {
        const data: any = await client.request(GET_DOCUMENTS);
        return {
          data: data.documents || [],
          total: data.documents?.length || 0,
        };
      }

      return { data: [], total: 0 };
    } catch (error) {
      console.error("getList error:", error);
      throw error;
    }
  },

  getOne: async ({ resource, id }) => {
    try {
      const client = await getClient();

      if (resource === "applications") {
        const data: any = await client.request(GET_APPLICATION, { id });
        return {
          data: data.application || {},
        };
      }

      return { data: {} } as any;
    } catch (error) {
      console.error("getOne error:", error);
      throw error;
    }
  },

  create: async ({ resource, variables }) => {
    try {
      const client = await getClient();

      if (resource === "applications") {
        const data: any = await client.request(CREATE_APPLICATION, variables as any);
        return {
          data: data.createApplication?.application || {},
        };
      }

      return { data: {} } as any;
    } catch (error) {
      console.error("create error:", error);
      throw error;
    }
  },

  update: async ({ resource, id, variables }) => {
    try {
      // Update mutations would go here
      return { data: { id, ...variables } } as any;
    } catch (error) {
      console.error("update error:", error);
      throw error;
    }
  },

  deleteOne: async ({ resource, id }) => {
    try {
      const client = await getClient();

      if (resource === "applications") {
        await client.request(DELETE_APPLICATION, { appId: id });
        return { data: { id } } as any;
      }

      return { data: { id } } as any;
    } catch (error) {
      console.error("deleteOne error:", error);
      throw error;
    }
  },

  getApiUrl: () => API_URL,
};
