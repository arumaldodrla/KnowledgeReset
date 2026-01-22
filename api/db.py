"""
Knowledge Reset API - Database Client
Uses Supabase with the secret key for server-side operations.
"""

import os
from typing import Optional, Dict, Any, List
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")

if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_SECRET_KEY must be set")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)


# ==================== TENANTS ====================

def get_tenant(tenant_id: str) -> Optional[Dict[str, Any]]:
    """Get tenant by ID."""
    result = supabase.table("tenants").select("*").eq("id", tenant_id).single().execute()
    return result.data


def list_tenants() -> List[Dict[str, Any]]:
    """List all tenants (admin only)."""
    result = supabase.table("tenants").select("*").execute()
    return result.data


def create_tenant(name: str, domain: Optional[str] = None) -> Dict[str, Any]:
    """Create a new tenant."""
    data = {"name": name}
    if domain:
        data["domain"] = domain
    result = supabase.table("tenants").insert(data).execute()
    return result.data[0]


def get_first_tenant_id() -> Optional[str]:
    """Get the ID of the first tenant found, or create one if none exists."""
    try:
        # Try to find existing tenant
        result = supabase.table("tenants").select("id").limit(1).execute()
        if result.data and len(result.data) > 0:
            return result.data[0]["id"]
            
        # If no tenants exist, create a default one
        print("No tenants found. Auto-creating 'Default Tenant'.")
        default_tenant = create_tenant("Default Tenant")
        return default_tenant["id"]
    except Exception as e:
        print(f"Error finding/creating default tenant: {str(e)}")
        pass
    return None


# ==================== APPLICATIONS ====================

def get_application(app_id: str) -> Optional[Dict[str, Any]]:
    """Get application by ID."""
    result = supabase.table("applications").select("*").eq("id", app_id).single().execute()
    return result.data


def list_applications(tenant_id: str) -> List[Dict[str, Any]]:
    """List applications for a tenant."""
    result = supabase.table("applications").select("*").eq("tenant_id", tenant_id).execute()
    return result.data


def create_application(tenant_id: str, name: str, url_doc_base: str, description: Optional[str] = None) -> Dict[str, Any]:
    """Create a new application."""
    data = {
        "tenant_id": tenant_id,
        "name": name,
        "url_doc_base": url_doc_base,
    }
    if description:
        data["description"] = description
    result = supabase.table("applications").insert(data).execute()
    return result.data[0]


def delete_application(app_id: str, tenant_id: str) -> bool:
    """Delete an application and cascade delete related data."""
    # Verify app belongs to tenant
    app = get_application(app_id)
    if not app or app["tenant_id"] != tenant_id:
        raise Exception("Application not found or access denied")
    
    # Delete related documents
    supabase.table("documents").delete().eq("app_id", app_id).execute()
    
    # Delete related crawl jobs
    supabase.table("crawl_jobs").delete().eq("app_id", app_id).execute()
    
    # Delete application
    result = supabase.table("applications").delete().eq("id", app_id).execute()
    return True


# ==================== DOCUMENTS ====================

def get_document(doc_id: str) -> Optional[Dict[str, Any]]:
    """Get document by ID."""
    result = supabase.table("documents").select("*").eq("id", doc_id).single().execute()
    return result.data


def list_documents(tenant_id: str, app_id: Optional[str] = None, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    """List documents for a tenant."""
    query = supabase.table("documents").select("*").eq("tenant_id", tenant_id)
    if app_id:
        query = query.eq("app_id", app_id)
    result = query.limit(limit).offset(offset).execute()
    return result.data


def search_documents_text(tenant_id: str, query_text: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Full-text search for documents."""
    result = supabase.table("documents").select("*").eq(
        "tenant_id", tenant_id
    ).text_search(
        "content_text", query_text
    ).limit(limit).execute()
    return result.data


def search_documents_semantic(tenant_id: str, embedding: List[float], threshold: float = 0.7, limit: int = 10) -> List[Dict[str, Any]]:
    """Semantic search using vector embeddings."""
    result = supabase.rpc("search_documents", {
        "query_embedding": embedding,
        "query_tenant_id": tenant_id,
        "match_threshold": threshold,
        "match_count": limit
    }).execute()
    return result.data


# ==================== CRAWL JOBS ====================

def get_crawl_job(job_id: str) -> Optional[Dict[str, Any]]:
    """Get crawl job by ID."""
    result = supabase.table("crawl_jobs").select("*").eq("id", job_id).single().execute()
    return result.data


def list_crawl_jobs(tenant_id: str, app_id: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
    """List crawl jobs for a tenant."""
    query = supabase.table("crawl_jobs").select("*").eq("tenant_id", tenant_id)
    if app_id:
        query = query.eq("app_id", app_id)
    result = query.order("created_at", desc=True).limit(limit).execute()
    return result.data


# ==================== AUDIT LOGGING ====================

def create_audit_log(
    event_type: str,
    action: str,
    tenant_id: Optional[str] = None,
    actor_id: Optional[str] = None,
    target_type: Optional[str] = None,
    target_id: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    request_id: Optional[str] = None
) -> None:
    """Create an audit log entry."""
    supabase.table("audit_logs").insert({
        "event_type": event_type,
        "action": action,
        "tenant_id": tenant_id,
        "actor_id": actor_id,
        "target_type": target_type,
        "target_id": target_id,
        "metadata": metadata or {},
        "request_id": request_id
    }).execute()


# ==================== USERS ====================

def list_users() -> List[Dict[str, Any]]:
    """List all users (admin only)."""
    # Use the admin auth client to list users
    response = supabase.auth.admin.list_users()
    # Convert User objects to dictionaries
    users = []
    for user in response:
        users.append({
            "id": user.id,
            "email": user.email,
            "created_at": user.created_at,
            "last_sign_in_at": user.last_sign_in_at,
            "user_metadata": user.user_metadata
        })
    return users


def create_user(email: str, password: str, user_metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Create a new user (admin only)."""
    attributes = {"email": email, "password": password, "email_confirm": True}
    if user_metadata:
        attributes["user_metadata"] = user_metadata
        
    response = supabase.auth.admin.create_user(attributes)
    user = response.user
    
    return {
        "id": user.id,
        "email": user.email,
        "created_at": user.created_at,
        "last_sign_in_at": user.last_sign_in_at,
        "user_metadata": user.user_metadata
    }


def get_user_from_token(token: str) -> Optional[Dict[str, Any]]:
    """Validate a JWT token against Supabase Auth API and return the user."""
    try:
        response = supabase.auth.get_user(token)
        user = response.user
        if not user:
            return None
            
        return {
            "id": user.id,
            "email": user.email,
            "user_metadata": user.user_metadata,
            "app_metadata": user.app_metadata,
            "aud": user.aud
        }
    except Exception as e:
        print(f"Token validation failed: {str(e)}")
        return None


# ==================== CRAWLER SETTINGS ====================

def get_crawler_settings(tenant_id: str) -> List[Dict[str, Any]]:
    """Get all crawler settings for a tenant."""
    result = supabase.table("crawler_settings").select("*").eq("tenant_id", tenant_id).execute()
    return result.data


def get_setting_value(tenant_id: str, key: str, default: Any = None) -> Any:
    """Get a specific setting value with fallback to default."""
    result = supabase.table("crawler_settings").select("setting_value").eq("tenant_id", tenant_id).eq("setting_key", key).single().execute()
    if result.data:
        value = result.data["setting_value"]
        # Try to convert to appropriate type
        if value.lower() in ('true', 'false'):
            return value.lower() == 'true'
        try:
            return int(value)
        except ValueError:
            try:
                return float(value)
            except ValueError:
                return value
    return default


def update_crawler_setting(tenant_id: str, key: str, value: str) -> Dict[str, Any]:
    """Update or create a crawler setting."""
    data = {
        "tenant_id": tenant_id,
        "setting_key": key,
        "setting_value": str(value),
        "updated_at": datetime.now().isoformat()
    }
    result = supabase.table("crawler_settings").upsert(data, on_conflict="tenant_id,setting_key").execute()
    return result.data[0] if result.data else {}
