-- =============================================================================
-- KNOWLEDGE RESET: COMPLETE DATABASE MIGRATION
-- =============================================================================
-- Description: Combined migration file for initial database setup
-- Date: 2026-01-18
-- 
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Paste this entire file
-- 3. Click "Run" to execute
-- =============================================================================

-- =====================
-- 001: ENABLE EXTENSIONS
-- =====================
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================
-- HELPER FUNCTION
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================
-- 002: TENANTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);

CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant"
    ON tenants FOR SELECT
    USING (id::text = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Service role can insert tenants"
    ON tenants FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins can update own tenant"
    ON tenants FOR UPDATE
    USING (id::text = auth.jwt() ->> 'tenant_id')
    WITH CHECK (id::text = auth.jwt() ->> 'tenant_id');

-- =====================
-- 003: APPLICATIONS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    url_doc_base TEXT NOT NULL,
    crawl_freq_days INTEGER DEFAULT 7,
    last_crawl_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_tenant_id ON applications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant applications"
    ON applications FOR SELECT
    USING (tenant_id::text = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Admins can insert applications"
    ON applications FOR INSERT
    WITH CHECK (tenant_id::text = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Admins can update own applications"
    ON applications FOR UPDATE
    USING (tenant_id::text = auth.jwt() ->> 'tenant_id')
    WITH CHECK (tenant_id::text = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Admins can delete own applications"
    ON applications FOR DELETE
    USING (tenant_id::text = auth.jwt() ->> 'tenant_id');

-- =====================
-- 004: DOCUMENTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    app_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT,
    content_text TEXT,
    content_html TEXT,
    content_hash TEXT,
    source_url TEXT NOT NULL,
    breadcrumbs JSONB DEFAULT '[]',
    embedding vector(1536),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_app_id ON documents(app_id);
CREATE INDEX IF NOT EXISTS idx_documents_parent_id ON documents(parent_id);
CREATE INDEX IF NOT EXISTS idx_documents_source_url ON documents(source_url);
CREATE INDEX IF NOT EXISTS idx_documents_content_hash ON documents(content_hash);
CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents 
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_documents_content_text_gin ON documents 
    USING gin(to_tsvector('english', content_text));

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant documents"
    ON documents FOR SELECT
    USING (tenant_id::text = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Service role can insert documents"
    ON documents FOR INSERT
    WITH CHECK (auth.role() = 'service_role' OR tenant_id::text = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Can update own tenant documents"
    ON documents FOR UPDATE
    USING (auth.role() = 'service_role' OR tenant_id::text = auth.jwt() ->> 'tenant_id')
    WITH CHECK (auth.role() = 'service_role' OR tenant_id::text = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Can delete own tenant documents"
    ON documents FOR DELETE
    USING (tenant_id::text = auth.jwt() ->> 'tenant_id');

-- Semantic search function
CREATE OR REPLACE FUNCTION search_documents(
    query_embedding vector(1536),
    query_tenant_id UUID,
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10
)
RETURNS TABLE (id UUID, title TEXT, content_text TEXT, source_url TEXT, similarity FLOAT)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT d.id, d.title, d.content_text, d.source_url,
        1 - (d.embedding <=> query_embedding) AS similarity
    FROM documents d
    WHERE d.tenant_id = query_tenant_id AND d.embedding IS NOT NULL
        AND 1 - (d.embedding <=> query_embedding) > match_threshold
    ORDER BY d.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- =====================
-- 005: CRAWL TABLES
-- =====================
CREATE TABLE IF NOT EXISTS crawl_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    app_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    stats JSONB DEFAULT '{}',
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crawl_jobs_tenant_id ON crawl_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_app_id ON crawl_jobs(app_id);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_status ON crawl_jobs(status);

CREATE TRIGGER update_crawl_jobs_updated_at
    BEFORE UPDATE ON crawl_jobs FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE crawl_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant crawl jobs"
    ON crawl_jobs FOR SELECT
    USING (tenant_id::text = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Service role can manage crawl jobs"
    ON crawl_jobs FOR ALL
    USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS crawl_errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES crawl_jobs(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    error_code TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crawl_errors_job_id ON crawl_errors(job_id);

ALTER TABLE crawl_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view errors via crawl jobs"
    ON crawl_errors FOR SELECT
    USING (EXISTS (SELECT 1 FROM crawl_jobs cj WHERE cj.id = crawl_errors.job_id 
        AND cj.tenant_id::text = auth.jwt() ->> 'tenant_id'));

CREATE POLICY "Service role can manage crawl errors"
    ON crawl_errors FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    content_html TEXT,
    content_hash TEXT NOT NULL,
    diff_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);

ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions via documents"
    ON document_versions FOR SELECT
    USING (EXISTS (SELECT 1 FROM documents d WHERE d.id = document_versions.document_id 
        AND d.tenant_id::text = auth.jwt() ->> 'tenant_id'));

CREATE POLICY "Service role can manage document versions"
    ON document_versions FOR ALL USING (auth.role() = 'service_role');

-- =====================
-- 006: AUDIT LOGS
-- =====================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    actor_id UUID,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    target_type TEXT,
    target_id UUID,
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    request_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Security admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'security_admin');

CREATE POLICY "Service role can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- =====================
-- 007: CONVERSATIONS
-- =====================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    title TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_tenant_id ON conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
    ON conversations FOR SELECT
    USING (user_id = auth.uid() AND tenant_id::text = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Users can create conversations"
    ON conversations FOR INSERT
    WITH CHECK (user_id = auth.uid() AND tenant_id::text = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Users can update own conversations"
    ON conversations FOR UPDATE
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    model_used TEXT,
    tokens_used INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages via conversation"
    ON messages FOR SELECT
    USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()));

CREATE POLICY "Users can insert messages to own conversations"
    ON messages FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS knowledge_corrections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    original_content TEXT,
    corrected_content TEXT NOT NULL,
    correction_type TEXT NOT NULL CHECK (correction_type IN ('factual', 'clarification', 'addition', 'removal')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_corrections_status ON knowledge_corrections(status);

ALTER TABLE knowledge_corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant users can view corrections"
    ON knowledge_corrections FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM conversations c WHERE c.id = knowledge_corrections.conversation_id 
            AND c.tenant_id::text = auth.jwt() ->> 'tenant_id')
        OR EXISTS (SELECT 1 FROM documents d WHERE d.id = knowledge_corrections.document_id 
            AND d.tenant_id::text = auth.jwt() ->> 'tenant_id')
    );

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
