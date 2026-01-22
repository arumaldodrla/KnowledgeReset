# Knowledge Reset Crawler

A Playwright-based web crawler for documentation sites, deployed on Google Cloud Run.

## Features

- **Multi-site support**: Works with any documentation site (Docusaurus, MkDocs, GitBook, Sphinx, VuePress, Jekyll, etc.)
- **Content extraction**: Multiple fallback selectors for robust content extraction
- **Hierarchy building**: Preserves document structure via breadcrumbs and parent-child relationships
- **Change detection**: SHA-256 hashing to detect content changes
- **Version history**: Stores previous versions when content changes
- **Vector embeddings**: Generates OpenAI embeddings for semantic search
- **Audit logging**: All crawl operations are logged for compliance

## API Endpoints

| Endpoint | Method | Description |
|:---------|:-------|:------------|
| `/` | GET | Health check |
| `/api/crawler/start` | POST | Start a new crawl job |
| `/api/crawler/status/{job_id}` | GET | Get crawl job status |
| `/api/crawler/errors/{job_id}` | GET | Get crawl errors |
| `/api/crawler/stop/{job_id}` | POST | Stop a running crawl |

## Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium

# Copy environment variables
cp .env.example .env
# Edit .env with your credentials

# Run the server
uvicorn main:app --reload
```

## Deployment to Cloud Run

See [CLOUD_RUN_SETUP.md](./CLOUD_RUN_SETUP.md) for setup instructions.

### Quick Deploy

```bash
# Build and deploy
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SUPABASE_URL=https://esfcxaeckelrelyutacu.supabase.co,_SUPABASE_SECRET_KEY=your_key,_OPENAI_API_KEY=your_key

# Or deploy directly
gcloud run deploy knowledge-reset-crawler \
  --source . \
  --region us-west1 \
  --allow-unauthenticated
```

## Usage Example

```bash
# Start a crawl
curl -X POST http://localhost:8080/api/crawler/start \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "your-tenant-id",
    "app_id": "your-app-id",
    "url": "https://docs.example.com",
    "max_depth": 3,
    "max_pages": 100
  }'

# Check status
curl http://localhost:8080/api/crawler/status/{job_id}
```

## Configuration

| Parameter | Default | Description |
|:----------|:--------|:------------|
| `max_depth` | 3 | Maximum crawl depth from starting URL |
| `max_pages` | 100 | Maximum pages to crawl |
| `delay_ms` | 1000 | Delay between requests (milliseconds) |
