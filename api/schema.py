"""
Knowledge Reset API - GraphQL Schema
Defines types, queries, and mutations using Strawberry GraphQL.
"""

import strawberry
from typing import Optional, List
from datetime import datetime


# ==================== TYPES ====================

@strawberry.type
class Tenant:
    id: str
    name: str
    domain: Optional[str]
    status: str
    errors: Optional[List[strawberry.scalars.JSON]]
    
    @classmethod
    def from_dict(cls, data: dict) -> "Tenant":
        return cls(
            id=data["id"],
            name=data["name"],
            domain=data.get("domain"),
            status=data["status"],
            errors=data.get("errors")
        )


@strawberry.input
class CreateUserInput:
    email: str
    password: str
    full_name: Optional[str] = None


@strawberry.input
class UpdateUserInput:
    email: Optional[str] = None
    full_name: Optional[str] = None


@strawberry.type
class DeleteUserResponse:
    success: bool
    message: str


@strawberry.type
class Application:
    id: str
    tenant_id: str
    name: str
    description: Optional[str]
    url_doc_base: str
    crawl_freq_days: int
    last_crawl_at: Optional[datetime]
    status: str
    created_at: datetime
    
    @classmethod
    def from_dict(cls, data: dict) -> "Application":
        last_crawl = None
        if data.get("last_crawl_at"):
            last_crawl = datetime.fromisoformat(data["last_crawl_at"].replace("Z", "+00:00"))
        return cls(
            id=data["id"],
            tenant_id=data["tenant_id"],
            name=data["name"],
            description=data.get("description"),
            url_doc_base=data["url_doc_base"],
            crawl_freq_days=data.get("crawl_freq_days", 7),
            last_crawl_at=last_crawl,
            status=data["status"],
            created_at=datetime.fromisoformat(data["created_at"].replace("Z", "+00:00")),
        )


@strawberry.type
class Breadcrumb:
    text: str
    href: str


@strawberry.type
class Document:
    id: str
    tenant_id: str
    app_id: str
    parent_id: Optional[str]
    title: str
    content_text: Optional[str]
    source_url: str
    breadcrumbs: List[Breadcrumb]
    created_at: datetime
    updated_at: datetime
    
    @classmethod
    def from_dict(cls, data: dict) -> "Document":
        crumbs = data.get("breadcrumbs", []) or []
        breadcrumbs = [Breadcrumb(text=c.get("text", ""), href=c.get("href", "")) for c in crumbs]
        return cls(
            id=data["id"],
            tenant_id=data["tenant_id"],
            app_id=data["app_id"],
            parent_id=data.get("parent_id"),
            title=data["title"],
            content_text=data.get("content_text"),
            source_url=data["source_url"],
            breadcrumbs=breadcrumbs,
            created_at=datetime.fromisoformat(data["created_at"].replace("Z", "+00:00")),
            updated_at=datetime.fromisoformat(data["updated_at"].replace("Z", "+00:00")),
        )


@strawberry.type
class SearchResult:
    document: Document
    score: float


@strawberry.type
class User:
    id: str
    email: str
    created_at: datetime
    last_sign_in_at: Optional[datetime]
    
    @classmethod
    def from_dict(cls, data: dict) -> "User":
        last_sign_in = None
        if data.get("last_sign_in_at"):
            val = data["last_sign_in_at"]
            if isinstance(val, str):
                last_sign_in = datetime.fromisoformat(val.replace("Z", "+00:00"))
            else:
                last_sign_in = val
            
        created_val = data["created_at"]
        if isinstance(created_val, str):
            created_at = datetime.fromisoformat(created_val.replace("Z", "+00:00"))
        else:
            created_at = created_val

        return cls(
            id=data["id"],
            email=data["email"],
            created_at=created_at,
            last_sign_in_at=last_sign_in,
        )


@strawberry.type
class CrawlError:
    id: str
    error_message: str
    url: Optional[str]

@strawberry.type
class CrawlJob:
    id: str
    tenant_id: str
    app_id: str
    status: str
    # Snake_case fields for internal use if needed, but alias for frontend
    started_at: Optional[datetime]
    finished_at: Optional[datetime]
    stats: Optional[str]  # JSON string
    created_at: datetime
    
    @strawberry.field
    def start_time(self) -> Optional[datetime]:
        return self.started_at

    @strawberry.field
    def end_time(self) -> Optional[datetime]:
        return self.finished_at

    @strawberry.field
    def pages_processed(self) -> int:
        if not self.stats:
            return 0
        import json
        try:
            data = json.loads(self.stats)
            return data.get("pages_processed", 0)
        except:
            return 0

    @strawberry.field
    def errors(self) -> List[CrawlError]:
        # Return empty list for now as errors might be in stats or separate table
        # If explicitly needed, we'd need to fetch them. returning empty to satisfy schema.
        return []

    @classmethod
    def from_dict(cls, data: dict) -> "CrawlJob":
        started = None
        finished = None
        if data.get("started_at"):
            started = datetime.fromisoformat(data["started_at"].replace("Z", "+00:00"))
        if data.get("finished_at"):
            finished = datetime.fromisoformat(data["finished_at"].replace("Z", "+00:00"))
        return cls(
            id=data["id"],
            tenant_id=data["tenant_id"],
            app_id=data["app_id"],
            status=data["status"],
            started_at=started,
            finished_at=finished,
            stats=str(data.get("stats")) if data.get("stats") else None,
            created_at=datetime.fromisoformat(data["created_at"].replace("Z", "+00:00")),
        )


# ==================== INPUTS ====================

@strawberry.input
class CreateApplicationInput:
    name: str
    url_doc_base: str
    description: Optional[str] = None
    crawl_freq_days: int = 7


@strawberry.input
class SearchInput:
    query: str
    app_id: Optional[str] = None
    limit: int = 10


@strawberry.input
class AuditLogInput:
    action: str
    actor: Optional[str] = None
    target_type: Optional[str] = None
    target_id: Optional[str] = None
    metadata_json: Optional[strawberry.scalars.JSON] = None
    ip_address: Optional[str] = None
    request_id: Optional[str] = None


@strawberry.type
class CrawlerSetting:
    id: str
    tenant_id: str
    setting_key: str
    setting_value: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    @classmethod
    def from_dict(cls, data: dict) -> "CrawlerSetting":
        return cls(
            id=data["id"],
            tenant_id=data["tenant_id"],
            setting_key=data["setting_key"],
            setting_value=data["setting_value"],
            description=data.get("description"),
            created_at=datetime.fromisoformat(data["created_at"].replace("Z", "+00:00")),
            updated_at=datetime.fromisoformat(data["updated_at"].replace("Z", "+00:00")),
        )


@strawberry.input
class UpdateSettingInput:
    key: str
    value: str


# ==================== RESPONSES ====================

@strawberry.type
class CrawlResponse:
    job_id: str
    status: str
    message: str
