# Knowledge Reset GraphQL API

A Strawberry GraphQL API for the Knowledge Reset knowledge base platform.

## Features

- **GraphQL Playground**: Interactive API explorer at `/graphql`
- **JWT Authentication**: Validates Supabase Auth tokens
- **Tenant Isolation**: RLS via JWT claims
- **Semantic Search**: Vector-based document search using OpenAI embeddings
- **Audit Logging**: All operations logged for compliance

## API Endpoints

| Endpoint | Description |
|:---------|:------------|
| `/` | Health check |
| `/graphql` | GraphQL endpoint and playground |

## Queries

```graphql
# Get current tenant
tenant(id: ID!): Tenant

# List applications for current tenant
applications: [Application]

# Get specific application
application(id: ID!): Application

# List documents with pagination
documents(appId: ID, limit: Int, offset: Int): [Document]

# Get specific document
document(id: ID!): Document

# Semantic search
search(input: SearchInput!): [SearchResult]

# List crawl jobs
crawlJobs(limit: Int): [CrawlJob]
```

## Mutations

```graphql
# Create a new application
createApplication(input: CreateApplicationInput!): Application

# Start a crawl job
startCrawl(appId: ID!, url: String, maxDepth: Int, maxPages: Int): CrawlResponse
```

## Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env
# Edit .env with your credentials

# Run the server
uvicorn main:app --reload
```

## Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

## Authentication

Include the Supabase Auth JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

The JWT must contain:
- `sub`: User ID
- `tenant_id`: Tenant ID (custom claim)
- `email`: User email
