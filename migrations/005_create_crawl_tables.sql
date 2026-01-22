-- Migration: 005_create_crawl_tables
-- Description: Create crawl_jobs, crawl_errors, and document_versions tables
-- Date: 2026-01-18

-- Crawl Jobs table
CREATE TABLE IF NOT EXISTS crawl_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    app_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    stats JSONB DEFAULT '{}',  -- pages_crawled, errors_count, etc.
    config JSONB DEFAULT '{}',  -- max_depth, max_pages, etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crawl_jobs_tenant_id ON crawl_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_app_id ON crawl_jobs(app_id);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_status ON crawl_jobs(status);

CREATE TRIGGER update_crawl_jobs_updated_at
    BEFORE UPDATE ON crawl_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE crawl_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant crawl jobs"
    ON crawl_jobs
    FOR SELECT
    USING (tenant_id::text = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Service role can manage crawl jobs"
    ON crawl_jobs
    FOR ALL
    USING (auth.role() = 'service_role');

-- Crawl Errors table
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
    ON crawl_errors
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM crawl_jobs cj 
            WHERE cj.id = crawl_errors.job_id 
            AND cj.tenant_id::text = auth.jwt() ->> 'tenant_id'
        )
    );

CREATE POLICY "Service role can manage crawl errors"
    ON crawl_errors
    FOR ALL
    USING (auth.role() = 'service_role');

-- Document Versions table
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
    ON document_versions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM documents d 
            WHERE d.id = document_versions.document_id 
            AND d.tenant_id::text = auth.jwt() ->> 'tenant_id'
        )
    );

CREATE POLICY "Service role can manage document versions"
    ON document_versions
    FOR ALL
    USING (auth.role() = 'service_role');
