"""
Knowledge Reset Crawler - FastAPI Application
REST API for managing crawler jobs.
"""

import asyncio
from typing import Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, HttpUrl
import uvicorn

from db import (
    create_crawl_job,
    get_crawl_job,
    update_crawl_job_status,
    get_application,
    get_crawl_errors,
    update_application_last_crawl,
)
from crawler import start_crawl

app = FastAPI(
    title="Knowledge Reset Crawler",
    description="Web crawler service for Knowledge Reset knowledge base",
    version="1.0.0",
)


# ==================== MODELS ====================

class CrawlRequest(BaseModel):
    tenant_id: str
    app_id: str
    url: Optional[str] = None  # If not provided, uses app's url_doc_base
    max_depth: int = 3
    max_pages: int = 100
    delay_ms: int = 1000
    timeout_ms: int = 30000


class CrawlResponse(BaseModel):
    job_id: str
    status: str
    message: str


class JobStatus(BaseModel):
    job_id: str
    status: str
    stats: Optional[dict] = None
    errors: Optional[list] = None


# ==================== BACKGROUND TASK ====================

async def run_crawl_job(job_id: str, tenant_id: str, app_id: str, url: str, config: dict):
    """Run the crawl job in the background."""
    try:
        await start_crawl(
            tenant_id=tenant_id,
            app_id=app_id,
            job_id=job_id,
            base_url=url,
            config=config,
        )
        # Update application's last_crawl_at
        update_application_last_crawl(app_id)
    except Exception as e:
        update_crawl_job_status(job_id, "failed", {"error": str(e)})


# ==================== ENDPOINTS ====================

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "healthy", "service": "Knowledge Reset Crawler"}


@app.get("/test-pw")
async def test_pw():
    results = {}
    
    # Test 1: Import check
    try:
        from playwright.async_api import async_playwright
        results["import_async"] = "ok"
    except Exception as e:
        results["import_async"] = str(e)
        
    # Test 2: Driver check
    try:
        import subprocess
        # Check if the playwright CLI can run
        res = subprocess.run(["playwright", "--version"], capture_output=True, text=True)
        results["cli_version"] = res.stdout.strip()
    except Exception as e:
        results["cli_version_error"] = str(e)
        
    # Test 3: Simple Async Launch (with timeout)
    try:
        import asyncio
        async def try_launch():
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
                version = browser.version
                await browser.close()
                return version
        
        results["async_launch"] = await asyncio.wait_for(try_launch(), timeout=15)
    except Exception as e:
        results["async_launch_error"] = str(e)
        
    return results


@app.post("/api/crawler/start", response_model=CrawlResponse)
async def start_crawler(request: CrawlRequest, background_tasks: BackgroundTasks):
    """
    Start a new crawl job.
    
    This endpoint creates a crawl job and starts it in the background.
    Use the returned job_id to check status.
    """
    # Get application details
    app = get_application(request.app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if app["tenant_id"] != request.tenant_id:
        raise HTTPException(status_code=403, detail="Application does not belong to tenant")
    
    # Determine URL to crawl
    crawl_url = request.url or app["url_doc_base"]
    if not crawl_url:
        raise HTTPException(status_code=400, detail="No URL provided and application has no url_doc_base")
    
    # Create crawl job
    config = {
        "max_depth": request.max_depth,
        "max_pages": request.max_pages,
        "delay_ms": request.delay_ms,
        "timeout_ms": request.timeout_ms,
        "url": crawl_url,
    }
    
    job = create_crawl_job(request.tenant_id, request.app_id, config)
    
    # Start crawl in background
    background_tasks.add_task(
        run_crawl_job,
        job["id"],
        request.tenant_id,
        request.app_id,
        crawl_url,
        config,
    )
    
    return CrawlResponse(
        job_id=job["id"],
        status="pending",
        message="Crawl job created and starting"
    )


@app.get("/api/crawler/status/{job_id}", response_model=JobStatus)
async def get_crawler_status(job_id: str):
    """Get the status of a crawl job."""
    job = get_crawl_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Crawl job not found")
    
    return JobStatus(
        job_id=job["id"],
        status=job["status"],
        stats=job.get("stats"),
    )


@app.get("/api/crawler/errors/{job_id}")
async def get_crawler_errors(job_id: str):
    """Get errors for a crawl job."""
    job = get_crawl_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Crawl job not found")
    
    errors = get_crawl_errors(job_id)
    
    return {
        "job_id": job_id,
        "errors_count": len(errors),
        "errors": errors,
    }


@app.post("/api/crawler/stop/{job_id}")
async def stop_crawler(job_id: str):
    """
    Stop a running crawl job.
    
    Note: This marks the job as cancelled but cannot immediately stop 
    a running crawl. The crawler will stop after completing the current page.
    """
    job = get_crawl_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Crawl job not found")
    
    if job["status"] not in ("pending", "running"):
        raise HTTPException(status_code=400, detail=f"Cannot stop job with status: {job['status']}")
    
    update_crawl_job_status(job_id, "cancelled")
    
    return {"job_id": job_id, "status": "cancelled", "message": "Crawl job marked for cancellation"}


# ==================== MAIN ====================

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
