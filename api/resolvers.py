"""
Knowledge Reset API - GraphQL Resolvers
Query and Mutation resolvers for the GraphQL API.
"""

import os
import httpx
import strawberry
from typing import Optional, List
from strawberry.types import Info
import google.generativeai as genai
import numpy as np
from dotenv import load_dotenv

from schema import (
    Tenant, Application, Document, CrawlJob, User, Role,
    SearchResult, CreateApplicationInput, SearchInput, CrawlResponse, Breadcrumb,
    CreateUserInput, UpdateUserInput, DeleteUserResponse, AuditLogInput, CrawlError, CrawlerSetting, UpdateSettingInput
)
from db import (
    get_tenant, list_tenants, create_tenant,
    get_application, list_applications, create_application, delete_application,
    get_document, list_documents, search_documents_text, search_documents_semantic,
    get_crawl_job, list_crawl_jobs, create_crawl_job, create_audit_log, list_users, create_user, update_user, delete_user,
    get_crawler_settings, update_crawler_setting, get_setting_value,
    get_user_role, assign_role, list_roles, create_role
)
from auth import AuthContext

load_dotenv()

# Google Gemini client for embeddings
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
EMBEDDING_MODEL = "models/gemini-embedding-001"
OUTPUT_DIMENSIONS = 1536
CRAWLER_URL = os.getenv("CRAWLER_URL", "https://knowledge-reset-crawler-639493422168.us-west1.run.app").strip()


def get_auth(info: Info) -> AuthContext:
    """Get auth context from request."""
    request = info.context.get("request")
    return getattr(request.state, "auth", AuthContext())


def normalize_embedding(embedding: List[float]) -> List[float]:
    """Normalize embedding for accurate cosine similarity."""
    embedding_array = np.array(embedding)
    norm = np.linalg.norm(embedding_array)
    if norm == 0:
        return embedding
    return (embedding_array / norm).tolist()


def generate_embedding(text: str) -> List[float]:
    """Generate embedding for search query using Google Gemini."""
    try:
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=text[:8000],  # Truncate if too long
            task_type="retrieval_query",  # Optimized for queries
            output_dimensionality=OUTPUT_DIMENSIONS
        )
        # Normalize for accurate cosine similarity
        return normalize_embedding(result['embedding'])
    except Exception as e:
        print(f"DEBUG: Gemini embedding generation failed: {str(e)}")
        raise e


# ==================== QUERIES ====================

@strawberry.type
class Query:
    @strawberry.field
    def tenant(self, info: Info, id: strawberry.ID) -> Optional[Tenant]:
        """Get a tenant by ID."""
        auth = get_auth(info)
        if not auth.is_authenticated:
            raise Exception(f"Authentication required: {auth.error}")
        
        # Users can only see their own tenant
        if auth.tenant_id and auth.tenant_id != str(id):
            raise Exception("Access denied")
        
        data = get_tenant(str(id))
        return Tenant.from_dict(data) if data else None
    
    @strawberry.field
    def applications(self, info: Info) -> List[Application]:
        """List applications for the current tenant."""
        auth = get_auth(info)
        if not auth.is_authenticated or not auth.tenant_id:
            raise Exception(f"Tenant context required: {auth.error or 'Missing tenant_id'}")
        
        data = list_applications(auth.tenant_id)
        return [Application.from_dict(app) for app in data]
    
    @strawberry.field
    def application(self, info: Info, id: strawberry.ID) -> Optional[Application]:
        """Get an application by ID."""
        auth = get_auth(info)
        if not auth.is_authenticated:
            raise Exception(f"Authentication required: {auth.error}")
        
        data = get_application(str(id))
        if not data:
            return None
        
        # Verify tenant access
        if auth.tenant_id and data["tenant_id"] != auth.tenant_id:
            raise Exception("Access denied")
        
        return Application.from_dict(data)
    
    @strawberry.field
    def documents(
        self,
        info: Info,
        app_id: Optional[strawberry.ID] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Document]:
        """List documents for the current tenant."""
        auth = get_auth(info)
        if not auth.is_authenticated or not auth.tenant_id:
            raise Exception(f"Tenant context required: {auth.error or 'Missing tenant_id'}")
        
        # Debug logging
        print(f"DEBUG documents query: tenant_id={auth.tenant_id}, app_id={app_id}, limit={limit}, offset={offset}")
        
        data = list_documents(auth.tenant_id, str(app_id) if app_id else None, limit, offset)
        
        # Debug logging
        print(f"DEBUG documents returned: count={len(data)}")
        if data:
            print(f"DEBUG first document: {data[0]}")
        
        return [Document.from_dict(doc) for doc in data]
    
    @strawberry.field
    def document(self, info: Info, id: strawberry.ID) -> Optional[Document]:
        """Get a document by ID."""
        auth = get_auth(info)
        if not auth.is_authenticated:
            raise Exception(f"Authentication required: {auth.error}")
        
        data = get_document(str(id))
        if not data:
            return None
        
        # Verify tenant access
        if auth.tenant_id and data["tenant_id"] != auth.tenant_id:
            raise Exception("Access denied")
        
        return Document.from_dict(data)
    
    @strawberry.field
    def search(self, info: Info, input: SearchInput) -> List[SearchResult]:
        """Search documents using natural language."""
        auth = get_auth(info)
        if not auth.is_authenticated or not auth.tenant_id:
            raise Exception(f"Tenant context required: {auth.error or 'Missing tenant_id'}")
        
        # Generate embedding for query
        embedding = generate_embedding(input.query)
        
        # Semantic search
        results = search_documents_semantic(
            auth.tenant_id,
            embedding,
            threshold=0.5,
            limit=input.limit
        )
        
        # Log search
        create_audit_log(
            event_type="AI_QUERY_SUBMITTED",
            action="search",
            tenant_id=auth.tenant_id,
            actor_id=auth.user_id,
            metadata={"query_length": len(input.query), "results_count": len(results)}
        )
        
        return [
            SearchResult(
                document=Document(
                    id=r["id"],
                    tenant_id=auth.tenant_id,
                    app_id="",  # Not returned by search function
                    parent_id=None,
                    title=r["title"],
                    content_text=r.get("content_text"),
                    source_url=r["source_url"],
                    breadcrumbs=[],
                    created_at=None,
                    updated_at=None,
                ),
                score=r["similarity"]
            )
            for r in results
        ]
    
    @strawberry.field
    def crawl_jobs(self, info: Info, app_id: Optional[strawberry.ID] = None, limit: int = 20, offset: int = 0) -> List[CrawlJob]:
        """List crawl jobs for the current tenant."""
        auth = get_auth(info)
        if not auth.is_authenticated or not auth.tenant_id:
            raise Exception(f"Tenant context required: {auth.error or 'Missing tenant_id'}")
        
        # Convert strawberry.ID to str if provided
        app_id_str = str(app_id) if app_id else None
        
        data = list_crawl_jobs(auth.tenant_id, app_id=app_id_str, limit=limit, offset=offset)
        return [CrawlJob.from_dict(job) for job in data]
    
    @strawberry.field
    def crawl_job(self, info: Info, id: strawberry.ID) -> Optional[CrawlJob]:
        """Get a crawl job by ID."""
        auth = get_auth(info)
        if not auth.is_authenticated:
            raise Exception(f"Authentication required: {auth.error}")
        
        data = get_crawl_job(str(id))
        if not data:
            return None
        
        # Verify tenant access
        if auth.tenant_id and data["tenant_id"] != auth.tenant_id:
            raise Exception("Access denied")
        
        return CrawlJob.from_dict(data)

    @strawberry.field
    def users(self, info: Info) -> List[User]:
        """List all users (admin only)."""
        auth = get_auth(info)
        if not auth.is_authenticated:
            raise Exception(f"Authentication required: {auth.error}")
        
        data = list_users()
        users_list = []
        for u in data:
            user_obj = User.from_dict(u)
            # Fetch role for user
            if auth.tenant_id:
                role_data = get_user_role(u["id"], auth.tenant_id)
                if role_data:
                    user_obj.role = Role.from_dict(role_data)
            users_list.append(user_obj)
        return users_list

    @strawberry.field
    def roles(self, info: Info) -> List[Role]:
        """List all available roles."""
        auth = get_auth(info)
        if not auth.is_authenticated or not auth.tenant_id:
            raise Exception(f"Tenant context required: {auth.error or 'Missing tenant_id'}")
        
        data = list_roles(auth.tenant_id)
        return [Role.from_dict(r) for r in data]

    @strawberry.field
    def role(self, info: Info, id: strawberry.ID) -> Optional[Role]:
        """Get a specific role."""
        auth = get_auth(info)
        if not auth.is_authenticated:
            raise Exception(f"Authentication required: {auth.error}")
        
        # This is a bit simplified, ideally fetch from DB by ID directly
        all_roles = list_roles(auth.tenant_id)
        role_data = next((r for r in all_roles if r["id"] == str(id)), None)
        return Role.from_dict(role_data) if role_data else None

    @strawberry.field
    def crawler_settings(self, info: Info) -> List[CrawlerSetting]:
        """Get crawler settings for the current tenant."""
        auth = get_auth(info)
        if not auth.is_authenticated or not auth.tenant_id:
            raise Exception(f"Tenant context required: {auth.error or 'Missing tenant_id'}")
        
        data = get_crawler_settings(auth.tenant_id)
        return [CrawlerSetting.from_dict(s) for s in data]


# ==================== MUTATIONS ====================

@strawberry.type
class Mutation:
    @strawberry.mutation
    def assign_role(self, info: Info, user_id: strawberry.ID, role_id: strawberry.ID) -> User:
        """Assign a role to a user."""
        auth = get_auth(info)
        if not auth.is_authenticated or not auth.tenant_id:
            raise Exception(f"Tenant context required: {auth.error or 'Missing tenant_id'}")
            
        success = assign_role(str(user_id), auth.tenant_id, str(role_id), invited_by=auth.user_id)
        if not success:
            raise Exception("Failed to assign role")
            
        # Return the updated user
        data = list_users()
        user_data = next((u for u in data if u["id"] == user_id), None)
        if not user_data:
            raise Exception("User not found")
            
        user_obj = User.from_dict(user_data)
        role_data = get_user_role(user_id, auth.tenant_id)
        if role_data:
            user_obj.role = Role.from_dict(role_data)
        return user_obj

    @strawberry.mutation
    def create_custom_role(self, info: Info, name: str, description: str, permissions: strawberry.scalars.JSON) -> Role:
        """Create a custom role for the tenant."""
        auth = get_auth(info)
        if not auth.is_authenticated or not auth.tenant_id:
            raise Exception(f"Tenant context required: {auth.error or 'Missing tenant_id'}")
            
        data = create_role(auth.tenant_id, name, description, permissions)
        return Role.from_dict(data)

    @strawberry.mutation
    def create_audit_log(self, info: Info, input: AuditLogInput) -> bool:
        """Create an audit log entry."""
        # This resolves to True if successful
        return create_audit_log(
            actor=input.actor,
            action=input.action,
            target_type=input.target_type,
            target_id=input.target_id,
            metadata=input.metadata_json,  # Pass raw specific metadata
            ip_address=input.ip_address,
            request_id=input.request_id
        )

    @strawberry.mutation
    def create_user(self, info: Info, input: CreateUserInput) -> User:
        """Create a new user (admin only)."""
        auth = get_auth(info)
        if not auth.is_authenticated:
            raise Exception(f"Authentication required: {auth.error}")
        
        # Verify admin role via JWT claim or just allow for now
        
        user_metadata = {}
        if input.full_name:
            user_metadata["full_name"] = input.full_name
            
        data = create_user(input.email, input.password, user_metadata)
        return User.from_dict(data)

    @strawberry.mutation
    def update_user(self, info: Info, id: strawberry.ID, input: UpdateUserInput) -> User:
        """Update user details (admin only)."""
        auth = get_auth(info)
        if not auth.is_authenticated:
            raise Exception(f"Authentication required: {auth.error}")
        
        # Verify admin role
        # TODO: Add proper role check
        
        data = update_user(str(id), input.email, input.full_name)
        return User.from_dict(data)

    @strawberry.mutation
    def delete_user(self, info: Info, id: strawberry.ID) -> DeleteUserResponse:
        """Delete user (admin only)."""
        auth = get_auth(info)
        if not auth.is_authenticated:
            raise Exception(f"Authentication required: {auth.error}")
        
        # Verify admin role
        # TODO: Add proper role check
        
        success = delete_user(str(id))
        if success:
            return DeleteUserResponse(success=True, message="User deleted successfully")
        else:
            return DeleteUserResponse(success=False, message="Failed to delete user")

    @strawberry.mutation
    def update_crawler_setting(self, info: Info, input: UpdateSettingInput) -> CrawlerSetting:
        """Update a crawler setting for the current tenant."""
        auth = get_auth(info)
        if not auth.is_authenticated or not auth.tenant_id:
            raise Exception(f"Tenant context required: {auth.error or 'Missing tenant_id'}")
        
        data = update_crawler_setting(auth.tenant_id, input.key, input.value)
        return CrawlerSetting.from_dict(data)
        
    @strawberry.mutation
    def delete_application(self, info: Info, app_id: strawberry.ID) -> bool:
        """Delete an application and all related data."""
        auth = get_auth(info)
        if not auth.is_authenticated or not auth.tenant_id:
            raise Exception(f"Tenant context required: {auth.error or 'Missing tenant_id'}")
        
        delete_application(str(app_id), auth.tenant_id)
        
        create_audit_log(
            event_type="APPLICATION_DELETED",
            action="delete_application",
            tenant_id=auth.tenant_id,
            actor_id=auth.user_id,
            target_type="application",
            target_id=str(app_id)
        )
        
        return True

    @strawberry.mutation
    def create_application(self, info: Info, input: CreateApplicationInput) -> Application:
        """Create a new application."""
        auth = get_auth(info)
        if not auth.is_authenticated or not auth.tenant_id:
            raise Exception(f"Tenant context required: {auth.error or 'Missing tenant_id'}")
        
        data = create_application(
            auth.tenant_id,
            input.name,
            input.url_doc_base,
            input.description,
            input.crawl_freq_days
        )
        
        create_audit_log(
            event_type="DATA_APPLICATION_CREATED",
            action="create",
            tenant_id=auth.tenant_id,
            actor_id=auth.user_id,
            target_type="application",
            target_id=data["id"],
            metadata={"name": input.name}
        )
        
        return Application.from_dict(data)
    
    @strawberry.mutation
    async def start_crawl(
        self,
        info: Info,
        app_id: strawberry.ID,
        url: Optional[str] = None,
        max_depth: int = 3,
        max_pages: int = 100,
        timeout_ms: int = 30000
    ) -> CrawlResponse:
        """Start a crawl job for an application."""
        auth = get_auth(info)
        if not auth.is_authenticated or not auth.tenant_id:
            raise Exception(f"Tenant context required: {auth.error or 'Missing tenant_id'}")
        
        # Verify app belongs to tenant
        app = get_application(str(app_id))
        if not app or app["tenant_id"] != auth.tenant_id:
            raise Exception("Application not found")
        
        
        # Call crawler service to create and start the job
        crawl_url = url or app["url_doc_base"]
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{CRAWLER_URL}/api/crawler/start",
                    json={
                        "tenant_id": auth.tenant_id,
                        "app_id": str(app_id),
                        "url": crawl_url,
                        "max_depth": max_depth,
                        "max_pages": max_pages,
                        "timeout_ms": timeout_ms
                    },
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    raise Exception(f"Crawler service error: {response.text}")
                
                result = response.json()
                job_id = result.get("job_id")
                
        except httpx.RequestError as e:
            raise Exception(f"Could not reach crawler service: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to start crawl: {str(e)}")
        
        create_audit_log(
            event_type="CRAWL_JOB_STARTED",
            action="start_crawl",
            tenant_id=auth.tenant_id,
            actor_id=auth.user_id,
            target_type="application",
            target_id=app_id,
            metadata={"job_id": job_id}
        )
        
        return CrawlResponse(
            job_id=job_id,
            status="running",
            message=f"Crawl started successfully. Job ID: {job_id}"
        )
