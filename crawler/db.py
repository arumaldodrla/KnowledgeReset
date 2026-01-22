"""
Knowledge Reset Crawler - Database Client
Uses Supabase with the secret key for server-side operations.
"""

import os
from typing import Optional, Dict, Any, List
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase client with secret key (service_role equivalent)
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


# ==================== APPLICATIONS ====================

def get_application(app_id: str) -> Optional[Dict[str, Any]]:
    """Get application by ID."""
    result = supabase.table("applications").select("*").eq("id", app_id).single().execute()
    return result.data


def update_application_last_crawl(app_id: str) -> None:
    """Update the last_crawl_at timestamp for an application."""
    supabase.table("applications").update({
        "last_crawl_at": "now()"
    }).eq("id", app_id).execute()


# ==================== CRAWL JOBS ====================

def create_crawl_job(tenant_id: str, app_id: str, config: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new crawl job."""
    result = supabase.table("crawl_jobs").insert({
        "tenant_id": tenant_id,
        "app_id": app_id,
        "status": "pending",
        "config": config
    }).execute()
    return result.data[0]


def update_crawl_job_status(job_id: str, status: str, stats: Optional[Dict[str, Any]] = None) -> None:
    """Update crawl job status."""
    update_data = {"status": status}
    if status == "running":
        update_data["started_at"] = "now()"
    elif status in ("completed", "failed", "cancelled"):
        update_data["finished_at"] = "now()"
    if stats:
        update_data["stats"] = stats
    
    supabase.table("crawl_jobs").update(update_data).eq("id", job_id).execute()


def get_crawl_job(job_id: str) -> Optional[Dict[str, Any]]:
    """Get crawl job by ID."""
    result = supabase.table("crawl_jobs").select("*").eq("id", job_id).single().execute()
    return result.data


# ==================== DOCUMENTS ====================

def get_document_by_url(tenant_id: str, app_id: str, source_url: str) -> Optional[Dict[str, Any]]:
    """Get document by source URL."""
    result = supabase.table("documents").select("*").eq(
        "tenant_id", tenant_id
    ).eq(
        "app_id", app_id
    ).eq(
        "source_url", source_url
    ).single().execute()
    return result.data if result.data else None


def create_document(data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new document."""
    result = supabase.table("documents").insert(data).execute()
    return result.data[0]


def update_document(doc_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Update an existing document."""
    result = supabase.table("documents").update(data).eq("id", doc_id).execute()
    return result.data[0]


def create_document_version(document_id: str, content_html: str, content_hash: str, diff_summary: str = None) -> Dict[str, Any]:
    """Create a document version for history."""
    result = supabase.table("document_versions").insert({
        "document_id": document_id,
        "content_html": content_html,
        "content_hash": content_hash,
        "diff_summary": diff_summary
    }).execute()
    return result.data[0]


def update_document_embedding(doc_id: str, embedding: List[float]) -> None:
    """Update the vector embedding for a document."""
    supabase.table("documents").update({
        "embedding": embedding
    }).eq("id", doc_id).execute()


# ==================== CRAWL ERRORS ====================

def log_crawl_error(job_id: str, url: str, error_code: str, error_message: str) -> None:
    """Log a crawl error."""
    supabase.table("crawl_errors").insert({
        "job_id": job_id,
        "url": url,
        "error_code": error_code,
        "error_message": error_message
    }).execute()


def get_crawl_errors(job_id: str) -> List[Dict[str, Any]]:
    """Get all errors for a crawl job."""
    result = supabase.table("crawl_errors").select("*").eq("job_id", job_id).execute()
    return result.data


# ==================== AUDIT LOGGING ====================

def create_audit_log(
    event_type: str,
    action: str,
    tenant_id: str = None,
    actor_id: str = None,
    target_type: str = None,
    target_id: str = None,
    metadata: Dict[str, Any] = None,
    ip_address: str = None,
    request_id: str = None
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
        "ip_address": ip_address,
        "request_id": request_id
    }).execute()
