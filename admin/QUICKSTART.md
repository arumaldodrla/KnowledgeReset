# Django Admin - Quick Start

## ✅ Deployed and Ready!

**Admin URL**: https://admin-beta-neon.vercel.app/admin

## Create Your Admin Account

### Option 1: Via Vercel CLI (Recommended)

```bash
cd /Users/arumaldo/KnowledgeReset/KnowledgeReset/admin
vercel exec -- python manage.py create_superuser
```

### Option 2: Manual Creation

Add `ADMIN_PASSWORD` environment variable in Vercel:
- Go to: https://vercel.com/digital-reset/admin/settings/environment-variables
- Add: `ADMIN_PASSWORD=your_secure_password`
- Redeploy: `vercel --prod --yes`

The superuser will be created automatically with:
- Username: `admin`
- Email: `admin@knowledgereset.com`
- Password: (from ADMIN_PASSWORD env var)

### Option 3: Django Shell

```bash
vercel exec -- python manage.py shell

# Then in the shell:
from django.contrib.auth import get_user_model
User = get_user_model()
User.objects.create_superuser('admin', 'admin@example.com', 'your_password')
```

## Access the Admin

1. Visit: https://admin-beta-neon.vercel.app/admin
2. Login with your superuser credentials
3. Start managing applications, crawl jobs, and documents!

## Features

- 📚 **Applications**: Create, edit, delete, start crawls
- 🔄 **Crawl Jobs**: Monitor status and progress
- 📄 **Documents**: Browse crawled content
- ⚙️ **Settings**: Configure crawler behavior

## Next Steps

1. Create your superuser account (see above)
2. Delete the old `crawler-admin` project from Vercel
3. Update project documentation to reference Django admin
