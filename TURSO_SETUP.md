# Turso Database Setup Guide

This guide will help you set up Turso for your habit tracker app deployment on Vercel.

## Why Turso?

- SQLite-compatible (minimal code changes from local SQLite)
- Generous free tier: 500M rows read, 10M rows written, 5GB storage
- No cold starts on free tier (as of March 2025)
- No minimum usage requirements
- Works perfectly with Vercel serverless functions

## Setup Steps

### 1. Install Turso CLI

```bash
# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash

# Windows (PowerShell)
powershell -c "irm https://get.tur.so/install.ps1 | iex"
```

### 2. Sign Up for Turso

```bash
turso auth signup
```

This will open your browser to complete the signup process.

### 3. Create a Database

```bash
# Create a new database (replace 'habit-tracker' with your preferred name)
turso db create habit-tracker
```

### 4. Get Database Credentials

```bash
# Get the database URL
turso db show habit-tracker --url

# Get the auth token
turso db tokens create habit-tracker
```

### 5. Update Environment Variables

Update your `.env` file with the credentials from step 4:

```env
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```

### 6. Initialize the Database Schema

Run the initialization script to create tables:

```bash
bun run scripts/init-db.ts
```

This will create the following tables:
- `users` - User accounts
- `habits` - User habits
- `habit_completions` - Habit completion records

### 7. Configure Vercel Environment Variables

In your Vercel project dashboard:

1. Go to Settings → Environment Variables
2. Add the following variables:
   - `TURSO_DATABASE_URL` - Your Turso database URL
   - `TURSO_AUTH_TOKEN` - Your Turso auth token
3. Make sure they're available for all environments (Production, Preview, Development)

### 8. Deploy to Vercel

```bash
# If using Vercel CLI
vercel --prod

# Or push to your git repository and Vercel will auto-deploy
git add .
git commit -m "Migrate to Turso database"
git push
```

## Useful Turso Commands

```bash
# Open SQL shell
turso db shell habit-tracker

# List all databases
turso db list

# View database info
turso db show habit-tracker

# Create a new auth token
turso db tokens create habit-tracker

# Invalidate an auth token
turso db tokens revoke habit-tracker <token-name>
```

## SQL Shell Examples

Once in the shell (`turso db shell habit-tracker`), you can run SQL queries:

```sql
-- View all users
SELECT * FROM users;

-- View all habits
SELECT * FROM habits;

-- View habit completions
SELECT * FROM habit_completions;

-- Count users
SELECT COUNT(*) FROM users;
```

## Troubleshooting

### "Missing Turso environment variables" Error

Make sure both `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set in your `.env` file and in Vercel's environment variables.

### Database Connection Fails

- Verify your auth token is valid: `turso db tokens list habit-tracker`
- Check the database URL: `turso db show habit-tracker --url`
- Ensure the database exists: `turso db list`

### Tables Not Created

Run the initialization script: `bun run scripts/init-db.ts`

## Local Development

For local development, you can either:

1. **Use Turso (Recommended)**: Set up `.env` with Turso credentials and develop against your cloud database
2. **Use local Turso replica**: Set up a local replica that syncs with your cloud database

### Option 2: Local Replica (Advanced)

```bash
# Create a local replica
turso db replicate habit-tracker --to local.db

# In your .env, use the local database
TURSO_DATABASE_URL=file:local.db
TURSO_AUTH_TOKEN=  # Leave empty for local file
```

## Migration from Local SQLite

Your existing local `database.sqlite` file won't be automatically migrated. To migrate data:

1. Export data from local SQLite
2. Import into Turso using the SQL shell or write a migration script

If you need to migrate existing users/habits, let me know and I can help create a migration script.
