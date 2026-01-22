# Google Cloud Run Deployment Guide

This guide outlines the steps to deploy the Python crawler service to Google Cloud Run.

## Prerequisites

1.  **Google Cloud Project**: You need a GCP project.
2.  **Google Cloud CLI (`gcloud`)**: Installed and authenticated.
3.  **Docker**: Installed locally for building (or use Cloud Build).

## Steps

### 1. Setup Environment

Authenticated your CLI:
```bash
gcloud auth login
gcloud config set project [YOUR_PROJECT_ID]
```

### 2. Enable Services

Enable the necessary APIs:
```bash
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 3. Deploy using Source (easiest)

You can deploy directly from source code without manually building a Docker container first.

Run this command from the `crawler` directory:

```bash
gcloud run deploy knowledge-reset-crawler \
  --source . \
  --region us-west1 \
  --allow-unauthenticated \
  --set-env-vars SUPABASE_URL=[YOUR_SUPABASE_URL] \
  --set-env-vars SUPABASE_SECRET_KEY=[YOUR_SERVICE_ROLE_KEY] \
  --set-env-vars OPENAI_API_KEY=[YOUR_OPENAI_KEY]
```

*Note: Replace `[YOUR_...]` with your actual keys.*

### 4. Verify Deployment

After deployment, Google Cloud Run will provide a URL (e.g., `https://knowledge-reset-crawler-xyz.us-west1.run.app`).
Update your `api` and `crawler-admin` environment variables (`CRAWLER_URL` / `NEXT_PUBLIC_CRAWLER_URL`) with this new URL.

### Troubleshooting

- **Logs**: View logs in the Google Cloud Console > Cloud Run > Logs.
- **Permissions**: Ensure the service account has permissions if accessing other GCP resources.
