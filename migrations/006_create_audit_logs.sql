-- Migration: 006_create_audit_logs
-- Description: Create audit_logs table for compliance
-- Date: 2026-01-18

-- Audit Logs table (append-only for compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    actor_id UUID,  -- User who performed the action
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    target_type TEXT,  -- e.g., 'document', 'application', 'user'
    target_id UUID,
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    request_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_type, target_id);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only security admins can read audit logs
-- Note: Requires 'security_admin' role in JWT claims
CREATE POLICY "Security admins can view audit logs"
    ON audit_logs
    FOR SELECT
    USING (
        auth.role() = 'service_role'
        OR (auth.jwt() ->> 'role' = 'security_admin')
    );

-- RLS Policy: Only service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
    ON audit_logs
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- IMPORTANT: No UPDATE or DELETE policies - audit logs are immutable

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
    p_event_type TEXT,
    p_actor_id UUID,
    p_tenant_id UUID,
    p_target_type TEXT,
    p_target_id UUID,
    p_action TEXT,
    p_metadata JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_request_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO audit_logs (
        event_type, actor_id, tenant_id, target_type, target_id,
        action, metadata, ip_address, user_agent, request_id
    ) VALUES (
        p_event_type, p_actor_id, p_tenant_id, p_target_type, p_target_id,
        p_action, p_metadata, p_ip_address, p_user_agent, p_request_id
    )
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;
