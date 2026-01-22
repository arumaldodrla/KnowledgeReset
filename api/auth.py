"""
Knowledge Reset API - JWT Authentication
Validates JWTs from Supabase Auth via Admin Client.
"""

import os
from typing import Optional, List
from functools import wraps
from jose import jwt, JWTError # Kept for potential future use or dependency compatibility
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv

try:
    from api.db import get_user_from_token, get_first_tenant_id
except ImportError:
    from db import get_user_from_token, get_first_tenant_id

load_dotenv()

class AuthContext:
    """Context containing authenticated user info."""
    def __init__(
        self,
        user_id: Optional[str] = None,
        tenant_id: Optional[str] = None,
        email: Optional[str] = None,
        roles: Optional[List[str]] = None,
        metadata: Optional[dict] = None,
        error: Optional[str] = None
    ):
        self.user_id = user_id
        self.tenant_id = tenant_id
        self.email = email
        self.roles = roles if roles is not None else []
        self.metadata = metadata if metadata is not None else {}
        self.is_authenticated = user_id is not None
        self.error = error

def get_auth_context(request: Request) -> AuthContext:
    """Extract auth token from request and validate user."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return AuthContext(error="Missing Authorization header")
    
    try:
        parts = auth_header.split()
        if len(parts) != 2:
             return AuthContext(error="Invalid Authorization header format")
             
        scheme, token = parts
        if scheme.lower() != "bearer":
            return AuthContext(error="Invalid Authorization scheme")
            
        # Validate against Supabase Auth API directly
        user = get_user_from_token(token)
        
        if not user:
            return AuthContext(error="Invalid or expired token (get_user_from_token returned None)")
            
        # Extract tenant_id if available in metadata
        tenant_id = user.get("user_metadata", {}).get("tenant_id") or user.get("app_metadata", {}).get("tenant_id")
        
        # Fallback: If no tenant_id, fetch the first available one (for single-tenant/admin setup)
        if not tenant_id:
            tenant_id = get_first_tenant_id()
            if not tenant_id:
                # User authenticated but no tenant found
                return AuthContext(
                    user_id=user["id"],
                    email=user.get("email"),
                    metadata=user.get("user_metadata", {}),
                    error="Tenant ID not found in metadata and default tenant fallback failed"
                )
        
        return AuthContext(
            user_id=user["id"],
            tenant_id=tenant_id,
            email=user.get("email"),
            roles=[], # Populate based on metadata if needed
            metadata=user.get("user_metadata", {})
        )

    except Exception as e:
        # Log error for debugging but don't crash the request
        print(f"Auth error: {str(e)}")
        return AuthContext(error=f"Auth exception: {str(e)}")


class AuthMiddleware(BaseHTTPMiddleware):
    """Middleware to add auth context to requests."""
    
    async def dispatch(self, request: Request, call_next):
        # Skip auth for health check and GraphQL playground
        if request.url.path in ["/", "/graphql"] and request.method == "GET":
            return await call_next(request)
        
        # Add auth context to request state
        request.state.auth = get_auth_context(request)
        return await call_next(request)


def require_auth(func):
    """Decorator to require authentication for a resolver."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        info = kwargs.get("info") or args[1] if len(args) > 1 else None
        if info:
            auth = getattr(info.context.get("request").state, "auth", None)
            if not auth or not auth.is_authenticated:
                raise Exception("Authentication required")
        return func(*args, **kwargs)
    return wrapper


def require_tenant(func):
    """Decorator to require tenant context for a resolver."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        info = kwargs.get("info") or args[1] if len(args) > 1 else None
        if info:
            auth = getattr(info.context.get("request").state, "auth", None)
            if not auth or not auth.tenant_id:
                raise Exception("Tenant context required")
        return func(*args, **kwargs)
    return wrapper
