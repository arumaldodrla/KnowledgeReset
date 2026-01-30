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
  query GetApplication($id: String!) {
    application(id: $id) {
      id
      name
      urlDocBase
      description
      status
      lastCrawlAt
      createdAt
      crawlFreqDays
    }
  }
`;

const CREATE_APPLICATION = gql`
  mutation CreateApplication($input: CreateApplicationInput!) {
    createApplication(input: $input) {
      id
      name
      urlDocBase
      description
      status
      createdAt
    }
  }
`;

const DELETE_APPLICATION = gql`
  mutation DeleteApplication($appId: ID!) {
    deleteApplication(appId: $appId)
  }
`;

const GET_CRAWL_JOBS = gql`
  query GetCrawlJobs($limit: Int, $offset: Int, $appId: ID) {
    crawlJobs(limit: $limit, offset: $offset, appId: $appId) {
      id
      appId
      status
      startedAt
      finishedAt
      pagesProcessed
      stats
      application {
        name
      }
    }
  }
`;

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      createdAt
      lastSignInAt
      role {
        id
        name
        description
      }
    }
  }
`;

const GET_USER = gql`
  query GetUser($id: ID!) {
    users {
      id
      email
      createdAt
      lastSignInAt
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
      createdAt
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      email
      createdAt
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      success
      message
    }
  }
`;

const GET_ROLES = gql`
  query GetRoles {
    roles {
      id
      name
      description
      isSystem
    }
  }
`;

const ASSIGN_ROLE = gql`
  mutation AssignRole($userId: ID!, $roleId: ID!) {
    assignRole(userId: $userId, roleId: $roleId) {
      id
      email
      role {
        id
        name
      }
    }
  }
`;

const GET_DOCUMENTS = gql`
  query GetDocuments($limit: Int, $offset: Int, $appId: ID) {
    documents(limit: $limit, offset: $offset, appId: $appId) {
      id
      appId
      jobId
      title
      sourceUrl
      breadcrumbs {
        text
        href
      }
      createdAt
    }
  }
`;

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters }) => {
    try {
      const client = await getClient();
      const { current = 1, pageSize = 10 } = pagination ?? {};
      const limit = pageSize;
      const offset = (current - 1) * pageSize;

      // Extract filters
      const appIdFilter = filters?.find((filter) => filter.operator === "eq" && filter.field === "appId");
      const appId = appIdFilter?.value;

      const variables = { limit, offset, appId };

      if (resource === "applications") {
        const data: any = await client.request(GET_APPLICATIONS);
        // Applications query doesn't support pagination yet, so we slice locally if needed or just return all
        // For now returning all to be safe as schema doesn't have offset for apps
        const apps = data.applications || [];
        return {
          data: apps,
          total: apps.length,
        };
      }

      if (resource === "crawlJobs") {
        const data: any = await client.request(GET_CRAWL_JOBS, variables);
        const jobs = data.crawlJobs || [];
        return {
          data: jobs,
          total: jobs.length, // Use actual count to prevent empty pagination
        };
      }

      if (resource === "users") {
        const data: any = await client.request(GET_USERS);
        // Users query doesn't support pagination yet
        return {
          data: data.users || [],
          total: data.users?.length || 0,
        };
      }

      if (resource === "roles") {
        // Roles query doesn't support pagination yet
        const data: any = await client.request(GET_ROLES);
        return {
          data: data.roles || [],
          total: data.roles?.length || 0,
        };
      }

      if (resource === "documents") {
        const data: any = await client.request(GET_DOCUMENTS, variables);
        const docs = data.documents || [];
        return {
          data: docs,
          total: docs.length, // Use actual count to prevent empty pagination
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

      if (resource === "users") {
        // For users, we need to get from the list since we don't have a single user query
        const data: any = await client.request(GET_USERS);
        const user = data.users?.find((u: any) => u.id === id);
        return {
          data: user || {},
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
        const data: any = await client.request(CREATE_APPLICATION, { input: variables } as any);
        return {
          data: data.createApplication || {},
        };
      }

      if (resource === "users") {
        const data: any = await client.request(CREATE_USER, { input: variables } as any);
        return {
          data: data.createUser || {},
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
      const client = await getClient();

      if (resource === "users") {
        const data: any = await client.request(UPDATE_USER, { id, input: variables } as any);
        return {
          data: data.updateUser || {},
        };
      }

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

      if (resource === "users") {
        await client.request(DELETE_USER, { id });
        return { data: { id } } as any;
      }

      return { data: { id } } as any;
    } catch (error) {
      console.error("deleteOne error:", error);
      throw error;
    }
  },

  custom: async ({ url, method, payload, query, headers }) => {
    try {
      console.log("DATA PROVIDER CUSTOM METHOD CALLED", { url, method, payload });
      const client = await getClient();
      const customPayload = payload as any;

      if (customPayload?.query && customPayload?.variables) {
        console.log("Executing GraphQL mutation:", customPayload.query);
        const data = await client.request(customPayload.query, customPayload.variables);
        console.log("GraphQL response:", data);
        return { data };
      }

      console.log("No query/variables in payload, returning empty");
      return { data: {} };
    } catch (error) {
      console.error("custom error:", error);
      throw error;
    }
  },

  getApiUrl: () => API_URL,
};
