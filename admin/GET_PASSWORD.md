# Getting Your Supabase Database Password

The Django admin needs your Supabase database password to connect.

## Where to Find It

1. Go to https://supabase.com/dashboard
2. Select your project: `esfcxaeckelrelyutacu`
3. Click **Settings** (gear icon in sidebar)
4. Click **Database**
5. Scroll to **Connection string** section
6. Click **Show** next to "Database password"
7. Copy the password

## Where to Add It

Edit: `/Users/arumaldo/KnowledgeReset/KnowledgeReset/admin/.env`

Line 3, replace:
```
SUPABASE_PASSWORD=your_database_password_here
```

With:
```
SUPABASE_PASSWORD=your_actual_password_from_supabase
```

## Then Start the Server

```bash
cd /Users/arumaldo/KnowledgeReset/KnowledgeReset/admin
./venv/bin/python manage.py runserver
```

Visit: http://localhost:8000/admin

## If You Don't Have the Password

If you don't have access to the password, you can reset it in the Supabase dashboard:
1. Settings → Database
2. Click "Reset database password"
3. Copy the new password
4. Update the `.env` file
