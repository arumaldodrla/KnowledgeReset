# Knowledge Reset - Django Admin

Fast, lightweight admin interface for managing the Knowledge Reset crawler using Django with Unfold theme.

## Features

- ⚡ **Fast**: Server-side rendering, <500ms load times
- 🎨 **Beautiful**: Modern Unfold theme
- 🔧 **Simple**: Django's built-in admin
- 📊 **Complete**: Manage applications, crawl jobs, documents, and settings

## Quick Start

### 1. Install Dependencies

```bash
cd admin
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
SUPABASE_PASSWORD=your_actual_database_password
SUPABASE_HOST=db.esfcxaeckelrelyutacu.supabase.co
```

### 3. Run Migrations

```bash
python manage.py migrate
```

### 4. Create Admin User

```bash
python manage.py createsuperuser
```

### 5. Start Server

```bash
python manage.py runserver
```

Visit: http://localhost:8000/admin

## Admin Sections

### Applications
- View all documentation sites
- Create new applications
- Start crawls with custom action
- Delete applications (cascades to jobs and documents)

### Crawl Jobs
- Monitor all crawl jobs
- View status, pages processed, errors
- Filter by application and status

### Documents
- Browse all crawled documents
- Search by title, URL, content
- View breadcrumbs and metadata

### Crawler Settings
- Configure max depth, max pages
- Set timeout and concurrent requests
- Manage robots.txt compliance

## Custom Actions

### Start Crawl
Select one or more applications and use the "Start crawl for selected applications" action to initiate crawling.

## Database

This admin connects to the existing Supabase PostgreSQL database. All models use `managed = False` to prevent Django from modifying the schema.

## Deployment

### Local Development
```bash
python manage.py runserver 0.0.0.0:8000
```

### Production (Railway/Vercel)
1. Set environment variables
2. Run migrations
3. Collect static files: `python manage.py collectstatic`
4. Use gunicorn: `gunicorn crawler_admin.wsgi`

## Architecture

```
Django Admin (Port 8000)
    ↓
Supabase PostgreSQL
    ↑
FastAPI (GraphQL) + Crawler Service
```

The Django admin provides a fast, simple interface while the FastAPI backend handles the chat application's GraphQL queries.
