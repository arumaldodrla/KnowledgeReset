-- Migration: 007_create_conversations
-- Description: Create tables for conversational AI interface
-- Date: 2026-01-18

-- Conversations table (for expert knowledge feeding)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,  -- References auth.users
    title TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_tenant_id ON conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
    ON conversations
    FOR SELECT
    USING (
        user_id = auth.uid()
        AND tenant_id::text = auth.jwt() ->> 'tenant_id'
    );

CREATE POLICY "Users can create conversations"
    ON conversations
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND tenant_id::text = auth.jwt() ->> 'tenant_id'
    );

CREATE POLICY "Users can update own conversations"
    ON conversations
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    model_used TEXT,  -- e.g., 'claude-opus-4.5', 'gpt-5.2', 'gemini-3-pro'
    tokens_used INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages via conversation"
    ON messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversations c 
            WHERE c.id = messages.conversation_id 
            AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages to own conversations"
    ON messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations c 
            WHERE c.id = messages.conversation_id 
            AND c.user_id = auth.uid()
        )
    );

-- Knowledge Corrections table (when experts correct AI)
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

CREATE INDEX IF NOT EXISTS idx_knowledge_corrections_document_id ON knowledge_corrections(document_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_corrections_status ON knowledge_corrections(status);

ALTER TABLE knowledge_corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant users can view corrections"
    ON knowledge_corrections
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversations c 
            WHERE c.id = knowledge_corrections.conversation_id 
            AND c.tenant_id::text = auth.jwt() ->> 'tenant_id'
        )
        OR EXISTS (
            SELECT 1 FROM documents d 
            WHERE d.id = knowledge_corrections.document_id 
            AND d.tenant_id::text = auth.jwt() ->> 'tenant_id'
        )
    );

CREATE POLICY "Users can create corrections"
    ON knowledge_corrections
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations c 
            WHERE c.id = knowledge_corrections.conversation_id 
            AND c.user_id = auth.uid()
        )
    );
