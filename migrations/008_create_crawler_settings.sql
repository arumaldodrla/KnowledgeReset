-- Create crawler_settings table for tenant-specific crawler configuration
CREATE TABLE IF NOT EXISTS crawler_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, setting_key)
);

-- Create index for faster lookups
CREATE INDEX idx_crawler_settings_tenant ON crawler_settings(tenant_id);

-- Insert default settings for existing tenants
INSERT INTO crawler_settings (tenant_id, setting_key, setting_value, description)
SELECT 
    t.id,
    'max_depth',
    '50',
    'Maximum depth to follow links during crawl'
FROM tenants t
ON CONFLICT (tenant_id, setting_key) DO NOTHING;

INSERT INTO crawler_settings (tenant_id, setting_key, setting_value, description)
SELECT 
    t.id,
    'max_pages',
    '100',
    'Maximum number of pages to crawl per job'
FROM tenants t
ON CONFLICT (tenant_id, setting_key) DO NOTHING;

INSERT INTO crawler_settings (tenant_id, setting_key, setting_value, description)
SELECT 
    t.id,
    'timeout',
    '30',
    'Request timeout in seconds'
FROM tenants t
ON CONFLICT (tenant_id, setting_key) DO NOTHING;

INSERT INTO crawler_settings (tenant_id, setting_key, setting_value, description)
SELECT 
    t.id,
    'concurrent_requests',
    '5',
    'Number of concurrent requests'
FROM tenants t
ON CONFLICT (tenant_id, setting_key) DO NOTHING;

INSERT INTO crawler_settings (tenant_id, setting_key, setting_value, description)
SELECT 
    t.id,
    'respect_robots_txt',
    'true',
    'Whether to respect robots.txt rules'
FROM tenants t
ON CONFLICT (tenant_id, setting_key) DO NOTHING;

INSERT INTO crawler_settings (tenant_id, setting_key, setting_value, description)
SELECT 
    t.id,
    'user_agent',
    'KnowledgeReset Crawler/1.0',
    'User agent string for crawler requests'
FROM tenants t
ON CONFLICT (tenant_id, setting_key) DO NOTHING;

-- Enable RLS
ALTER TABLE crawler_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access settings for their tenant
CREATE POLICY crawler_settings_tenant_isolation ON crawler_settings
    FOR ALL
    USING (tenant_id IN (
        SELECT (raw_user_meta_data->>'tenant_id')::uuid 
        FROM auth.users 
        WHERE id = auth.uid()
    ));
