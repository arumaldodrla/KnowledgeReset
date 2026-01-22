"""
Knowledge Reset API - Main FastAPI Application
GraphQL API powered by Strawberry.
"""

import strawberry
from fastapi import FastAPI, Request
from strawberry.fastapi import GraphQLRouter

from resolvers import Query, Mutation
from auth import AuthMiddleware
from fastapi.middleware.cors import CORSMiddleware

# Create GraphQL schema
schema = strawberry.Schema(query=Query, mutation=Mutation)

# Create FastAPI app
app = FastAPI(
    title="Knowledge Reset API",
    description="GraphQL API for the Knowledge Reset knowledge base platform",
    version="1.0.0",
)

# Add auth middleware
app.add_middleware(AuthMiddleware)


# Add CORS middleware (must be last to check first)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://chat-nu-blue-54.vercel.app",
        "https://crawler-admin.vercel.app",
        "https://knowledge-reset-crawler-639493422168.us-west1.run.app",
        "https://admin-refine-three.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add auth middleware
app.add_middleware(AuthMiddleware)

# Create GraphQL router with context
def get_context(request: Request):
    return {"request": request}

graphql_app = GraphQLRouter(
    schema,
    context_getter=get_context,
)

# Mount GraphQL
app.include_router(graphql_app, prefix="/graphql")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Knowledge Reset API",
        "graphql_endpoint": "/graphql"
    }


@app.get("/health")
async def health():
    """Detailed health check."""
    return {
        "status": "healthy",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
