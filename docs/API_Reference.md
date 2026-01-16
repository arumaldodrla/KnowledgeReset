# Knowledge Reset: API Reference (GraphQL)

**Version:** 1.0  
**Date:** January 16, 2026  
**Author:** Manus AI  
**Status:** Draft

---

## 1. Introduction

This document provides a high-level overview of the Knowledge Reset GraphQL API. The API is the primary interface for all other Digital Reset platforms to interact with the Knowledge Reset platform.

---

## 2. Authentication

All API requests must be authenticated using a JSON Web Token (JWT). The JWT must be included in the `Authorization` header of each request:

```
Authorization: Bearer <your-jwt>
```

---

## 3. Schema Overview

The GraphQL schema is organized around the core concepts of Knowledge Reset:

*   **Tenant:** Represents a customer or internal team.
*   **KnowledgeAsset:** A single piece of knowledge, such as a document, image, or voice note.
*   **KnowledgeGraph:** A collection of interconnected KnowledgeAssets.

### 3.1. Queries

*   `knowledgeAsset(id: ID!): KnowledgeAsset`: Retrieve a single KnowledgeAsset by its ID.
*   `knowledgeAssets(filter: KnowledgeAssetFilter): [KnowledgeAsset]`: Retrieve a list of KnowledgeAssets based on a filter.
*   `search(query: String!): [SearchResult]`: Perform a natural language search across the entire knowledge base.

### 3.2. Mutations

*   `createKnowledgeAsset(input: CreateKnowledgeAssetInput!): KnowledgeAsset`: Create a new KnowledgeAsset.
*   `updateKnowledgeAsset(id: ID!, input: UpdateKnowledgeAssetInput!): KnowledgeAsset`: Update an existing KnowledgeAsset.
*   `deleteKnowledgeAsset(id: ID!): Boolean`: Delete a KnowledgeAsset.

---

## 4. Example Queries

### 4.1. Retrieve a single KnowledgeAsset

```graphql
query {
  knowledgeAsset(id: "123") {
    id
    title
    content
    createdAt
  }
}
```

### 4.2. Search for KnowledgeAssets

```graphql
query {
  search(query: "How do I reset my password?") {
    asset {
      id
      title
      content
    }
    score
  }
}
```

---

## 5. Error Handling

The API uses standard GraphQL error handling. Errors will be returned in the `errors` field of the response.

---

## 6. Rate Limiting

To ensure fair usage, the API is rate-limited. The rate limit is based on the number of requests per minute per tenant. The current rate limit is 1000 requests per minute.

---

## 7. API Documentation

A detailed, interactive API documentation will be available via a GraphQL Playground interface.
