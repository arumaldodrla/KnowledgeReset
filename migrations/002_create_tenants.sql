-- Migration: 002_create_tenants
-- Description: Create tenants table with RLS
-- Date: 2026-01-18

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for domain lookups
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own tenant
-- Note: auth.jwt() ->> 'tenant_id' should be set in your JWT claims
CREATE POLICY "Users can view own tenant"
    ON tenants
    FOR SELECT
    USING (id::text = auth.jwt() ->> 'tenant_id');

-- RLS Policy: Only service role can insert tenants
CREATE POLICY "Service role can insert tenants"
    ON tenants
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- RLS Policy: Tenant admins can update their tenant
CREATE POLICY "Admins can update own tenant"
    ON tenants
    FOR UPDATE
    USING (id::text = auth.jwt() ->> 'tenant_id')
    WITH CHECK (id::text = auth.jwt() ->> 'tenant_id');
