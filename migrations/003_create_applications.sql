-- Migration: 003_create_applications
-- Description: Create applications table for documentation sources
-- Date: 2026-01-18

-- Applications table (documentation sources to crawl)
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_applications_tenant_id ON applications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Trigger for updated_at
CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see applications in their tenant
CREATE POLICY "Users can view own tenant applications"
    ON applications
    FOR SELECT
    USING (tenant_id::text = auth.jwt() ->> 'tenant_id');

-- RLS Policy: Tenant admins can insert applications
CREATE POLICY "Admins can insert applications"
    ON applications
    FOR INSERT
    WITH CHECK (tenant_id::text = auth.jwt() ->> 'tenant_id');

-- RLS Policy: Tenant admins can update their applications
CREATE POLICY "Admins can update own applications"
    ON applications
    FOR UPDATE
    USING (tenant_id::text = auth.jwt() ->> 'tenant_id')
    WITH CHECK (tenant_id::text = auth.jwt() ->> 'tenant_id');

-- RLS Policy: Tenant admins can delete their applications
CREATE POLICY "Admins can delete own applications"
    ON applications
    FOR DELETE
    USING (tenant_id::text = auth.jwt() ->> 'tenant_id');
