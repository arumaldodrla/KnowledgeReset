-- Migration: 004_create_documents
-- Description: Create documents table with vector embeddings
-- Date: 2026-01-18

-- Documents table (crawled content with vector embeddings)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    app_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    
    -- Content
    title TEXT NOT NULL,
    slug TEXT,
    content_text TEXT,
    content_html TEXT,
    content_hash TEXT,  -- SHA-256 for change detection
    
    -- Source
    source_url TEXT NOT NULL,
    breadcrumbs JSONB DEFAULT '[]',
    
    -- Vector embedding for semantic search (1536 dimensions for OpenAI embeddings)
    embedding vector(1536),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_app_id ON documents(app_id);
CREATE INDEX IF NOT EXISTS idx_documents_parent_id ON documents(parent_id);
CREATE INDEX IF NOT EXISTS idx_documents_source_url ON documents(source_url);
CREATE INDEX IF NOT EXISTS idx_documents_content_hash ON documents(content_hash);

-- Vector similarity index (IVFFlat for approximate nearest neighbor)
CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_documents_content_text_gin ON documents 
    USING gin(to_tsvector('english', content_text));

-- Trigger for updated_at
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see documents in their tenant
CREATE POLICY "Users can view own tenant documents"
    ON documents
    FOR SELECT
    USING (tenant_id::text = auth.jwt() ->> 'tenant_id');

-- RLS Policy: Service role can insert documents (for crawler)
CREATE POLICY "Service role can insert documents"
    ON documents
    FOR INSERT
    WITH CHECK (
        auth.role() = 'service_role' 
        OR tenant_id::text = auth.jwt() ->> 'tenant_id'
    );

-- RLS Policy: Service role or tenant admin can update documents
CREATE POLICY "Can update own tenant documents"
    ON documents
    FOR UPDATE
    USING (
        auth.role() = 'service_role' 
        OR tenant_id::text = auth.jwt() ->> 'tenant_id'
    )
    WITH CHECK (
        auth.role() = 'service_role' 
        OR tenant_id::text = auth.jwt() ->> 'tenant_id'
    );

-- RLS Policy: Tenant admin can delete documents
CREATE POLICY "Can delete own tenant documents"
    ON documents
    FOR DELETE
    USING (tenant_id::text = auth.jwt() ->> 'tenant_id');

-- Function for semantic search
CREATE OR REPLACE FUNCTION search_documents(
    query_embedding vector(1536),
    query_tenant_id UUID,
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content_text TEXT,
    source_url TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.title,
        d.content_text,
        d.source_url,
        1 - (d.embedding <=> query_embedding) AS similarity
    FROM documents d
    WHERE d.tenant_id = query_tenant_id
        AND d.embedding IS NOT NULL
        AND 1 - (d.embedding <=> query_embedding) > match_threshold
    ORDER BY d.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
