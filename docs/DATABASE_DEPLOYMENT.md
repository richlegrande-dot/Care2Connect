# Database Deployment Guide

## Production Database Schema Notes

The `schema.prisma` file is already configured for production deployment with PostgreSQL.

### Key Production Settings:
- **Provider**: PostgreSQL (compatible with Supabase, Neon, Render PostgreSQL)
- **Connection Pooling**: Enabled via `?pgbouncer=true` in DATABASE_URL
- **SSL Mode**: Required for production connections

### Migration Pipeline

#### For Render Deployment:
1. Migrations run automatically via `preDeployCommand: npx prisma migrate deploy`
2. Database is created automatically through render.yaml
3. Connection string is injected as `DATABASE_URL` environment variable

#### For Fly.io Deployment:
1. Migrations run via `release_command = "npx prisma migrate deploy"`
2. Attach PostgreSQL database: `fly postgres attach --app careconnect-backend careconnect-db`

#### For Manual Database Setup:

**Supabase (Recommended):**
```bash
# 1. Create new project at supabase.com
# 2. Get connection string from Settings > Database
# 3. Set DATABASE_URL environment variable
DATABASE_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# 4. Run migrations
npx prisma migrate deploy
```

**Neon (Alternative):**
```bash
# 1. Create database at neon.tech
# 2. Get connection string
DATABASE_URL="postgresql://[user]:[password]@[endpoint]/[dbname]?sslmode=require"

# 3. Run migrations
npx prisma migrate deploy
```

### Auto-Migration Configuration for CI/CD

Add this to your deployment script:
```bash
#!/bin/bash
echo "Running database migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "✅ Database migrations completed successfully"
else
  echo "❌ Database migrations failed"
  exit 1
fi
```

### Production Database Environment Variables

Required environment variables:
```env
# Primary database connection
DATABASE_URL="postgresql://..."

# Optional: Direct database URL (bypassing connection pooler)
DIRECT_URL="postgresql://..."

# Optional: Database connection pool settings
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT=10000
```

### Database Backup Strategy

**For Supabase:**
- Automatic daily backups included
- Point-in-time recovery available
- Manual backup: Use Supabase dashboard

**For Render PostgreSQL:**
- Automatic daily backups on paid plans
- Manual backup via pg_dump:
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

**For Neon:**
- Automatic continuous backups
- Branch-based development databases
- Point-in-time recovery

### Connection Pool Configuration

For high-traffic production environments, configure connection pooling:

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Optional: for migrations and schema introspection
}
```

### Performance Optimizations

1. **Database Indexes** (already included in schema):
   - User email index for fast lookups
   - Profile public status index for search
   - Message user/timestamp indexes for chat history

2. **Connection Pooling**:
   - Use PgBouncer in transaction mode
   - Set appropriate pool size (10-20 connections)

3. **Query Optimization**:
   - Use `include` instead of separate queries
   - Implement pagination for large result sets
   - Use database-level sorting when possible

### Security Configuration

1. **SSL/TLS**: Always required in production
2. **User Permissions**: Use least-privilege principle
3. **Network Security**: Restrict database access to application servers only
4. **Audit Logging**: Enable for sensitive operations

### Monitoring

Set up monitoring for:
- Connection pool utilization
- Query performance
- Database size and growth
- Backup success/failure
- Migration status

Example monitoring queries:
```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Database size
SELECT pg_size_pretty(pg_database_size('careconnect'));

-- Slow queries (if enabled)
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```