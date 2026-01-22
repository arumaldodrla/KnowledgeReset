-- Migration: 001_enable_extensions
-- Description: Enable required PostgreSQL extensions
-- Date: 2026-01-18

-- Enable pgvector for vector embeddings (semantic search)
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
