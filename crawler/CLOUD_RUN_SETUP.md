# Google Cloud Run Setup Guide

## Prerequisites

### 1. Install Google Cloud CLI

```bash
# macOS (using Homebrew)
brew install --cask google-cloud-sdk
```

### 2. Initialize and Authenticate

```bash
# Initialize gcloud (opens browser for authentication)
gcloud init

# Verify authentication
gcloud auth list
```

### 3. Create or Select a Project

```bash
# List existing projects
gcloud projects list

# Create a new project (if needed)
gcloud projects create knowledge-reset-crawler --name="Knowledge Reset Crawler"

# Set the active project
gcloud config set project knowledge-reset-crawler
```

### 4. Enable Required APIs

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Artifact Registry (for container images)
gcloud services enable artifactregistry.googleapis.com

# Enable Cloud Build (for building containers)
gcloud services enable cloudbuild.googleapis.com
```

### 5. Set Default Region

```bash
# Set default region (us-west1 is close to your Supabase in us-west-2)
gcloud config set run/region us-west1
```

### 6. Verify Setup

```bash
# Check configuration
gcloud config list

# Expected output should show:
# [core]
# project = knowledge-reset-crawler
# [run]
# region = us-west1
```

---

## After Setup

Once you've completed these steps, let me know and I'll:
1. Create the crawler Docker container
2. Deploy it to Cloud Run
3. Configure the environment variables for Supabase and AI APIs

---

## Cost Estimate

Cloud Run pricing (as of January 2026):
- **CPU**: $0.00002400 per vCPU-second
- **Memory**: $0.00000250 per GiB-second
- **Requests**: $0.40 per million requests

**Estimated monthly cost for Knowledge Reset Crawler:**
- Assuming 1000 crawls/month, 5 minutes each
- Approximately **$2-5/month** for typical usage
- Scales to $0 when not in use (no minimum)
