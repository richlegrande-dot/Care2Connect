# Docker Production Deployment Guide
# PRODUCTION HARDENING: Complete containerization solution

## Quick Start

### Prerequisites
```powershell
# Install Docker Desktop for Windows
winget install Docker.DockerDesktop

# Verify installation
docker --version
docker-compose --version
```

### Basic Production Deployment
```powershell
# 1. Set environment variables
cp .env.example .env.production
# Edit .env.production with your production values

# 2. Build and start services
docker-compose -f docker-compose.production.yml --profile production up -d

# 3. Monitor startup
docker-compose -f docker-compose.production.yml logs -f

# 4. Verify health
docker-compose -f docker-compose.production.yml ps
```

## Configuration Profiles

### 1. Minimal Production (Core Services Only)
```powershell
docker-compose -f docker-compose.production.yml --profile production up -d
```
**Includes**: postgres, backend, frontend, cloudflare-tunnel

### 2. Production + Monitoring
```powershell
docker-compose -f docker-compose.production.yml --profile monitoring up -d
```
**Includes**: Core services + Prometheus monitoring + Log aggregation

### 3. Full Stack (Everything)
```powershell
docker-compose -f docker-compose.production.yml --profile full up -d
```
**Includes**: All services + Redis cache + Full monitoring stack

## Environment Configuration

### Required Environment Variables (.env.production)
```bash
# Database
DB_PASSWORD=your_secure_database_password_here

# Security
JWT_SECRET=your_jwt_secret_minimum_32_characters
SESSION_SECRET=your_session_secret_minimum_32_chars

# API Keys (Optional - set if using features)
OPENAI_API_KEY=sk-your-openai-key-if-needed
ASSEMBLYAI_API_KEY=your-assemblyai-key-if-needed
TWILIO_ACCOUNT_SID=your-twilio-sid-if-needed
TWILIO_AUTH_TOKEN=your-twilio-token-if-needed
```

### Cloudflare Tunnel Configuration
```powershell
# Mount your existing tunnel configuration
# Ensure tunnel-config volume points to your .cloudflared directory
mkdir tunnel-config
copy C:\Users\richl\.cloudflared\* tunnel-config\
```

## Production Operations

### Health Monitoring
```powershell
# Check all service health
docker-compose -f docker-compose.production.yml ps

# Check specific service logs
docker-compose -f docker-compose.production.yml logs backend
docker-compose -f docker-compose.production.yml logs frontend

# Follow live logs
docker-compose -f docker-compose.production.yml logs -f --tail=50
```

### Service Management
```powershell
# Restart specific service
docker-compose -f docker-compose.production.yml restart backend

# Scale services (if needed)
docker-compose -f docker-compose.production.yml up -d --scale backend=2

# Stop all services
docker-compose -f docker-compose.production.yml down

# Stop and remove volumes (DESTRUCTIVE)
docker-compose -f docker-compose.production.yml down -v
```

### Database Operations
```powershell
# Connect to database
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -d care2system_db

# Backup database
docker-compose -f docker-compose.production.yml exec postgres pg_dump -U postgres care2system_db > backup.sql

# Restore database
docker-compose -f docker-compose.production.yml exec -T postgres psql -U postgres -d care2system_db < backup.sql
```

## Production Hardening Features

### 1. Security
- ✅ Non-root containers (nodejs/nextjs users)
- ✅ Read-only filesystems where possible
- ✅ Network isolation with custom bridge network
- ✅ Secrets management via environment variables
- ✅ Regular security updates (Alpine base images)

### 2. Reliability
- ✅ Health checks for all services
- ✅ Automatic restart policies (unless-stopped)
- ✅ Resource limits to prevent memory leaks
- ✅ Graceful shutdown handling with dumb-init
- ✅ Dependency ordering with health conditions

### 3. Observability
- ✅ Structured logging to volumes
- ✅ Health check endpoints
- ✅ Prometheus metrics (optional)
- ✅ Log aggregation with Loki (optional)
- ✅ Container resource monitoring

### 4. Data Persistence
- ✅ Database data persistence
- ✅ Log persistence
- ✅ Upload file persistence
- ✅ Tunnel configuration persistence

## Troubleshooting

### Common Issues

#### Service Won't Start
```powershell
# Check service logs
docker-compose -f docker-compose.production.yml logs service-name

# Check resource usage
docker stats

# Restart service
docker-compose -f docker-compose.production.yml restart service-name
```

#### Database Connection Issues
```powershell
# Verify database is running
docker-compose -f docker-compose.production.yml exec postgres pg_isready -U postgres

# Check database logs
docker-compose -f docker-compose.production.yml logs postgres

# Reset database container (DESTRUCTIVE)
docker-compose -f docker-compose.production.yml stop postgres
docker-compose -f docker-compose.production.yml rm postgres
docker volume rm care2system_postgres-data
docker-compose -f docker-compose.production.yml up -d postgres
```

#### Cloudflare Tunnel Issues
```powershell
# Check tunnel logs
docker-compose -f docker-compose.production.yml logs cloudflare-tunnel

# Verify tunnel configuration
docker-compose -f docker-compose.production.yml exec cloudflare-tunnel cloudflared tunnel info careconnect-backend

# Run tunnel outside container for debugging
docker-compose -f docker-compose.production.yml stop cloudflare-tunnel
.\scripts\tunnel-start.ps1
```

#### Memory/Resource Issues
```powershell
# Check resource usage
docker stats --no-stream

# Increase resource limits in docker-compose.production.yml
# Then restart services:
docker-compose -f docker-compose.production.yml up -d
```

## Migration from Host Installation

### 1. Backup Current Setup
```powershell
# Backup database
.\scripts\backup-database.ps1

# Backup tunnel credentials  
.\scripts\backup-tunnel-credentials.ps1

# Backup configuration
copy .env .env.backup
```

### 2. Prepare Docker Environment
```powershell
# Stop existing services
.\scripts\process-manager.ps1 -Action stop -Service all

# Set up Docker environment
copy .env .env.production
# Edit .env.production as needed
```

### 3. Deploy with Docker
```powershell
# Start with monitoring to watch startup
docker-compose -f docker-compose.production.yml --profile production up -d
docker-compose -f docker-compose.production.yml logs -f
```

### 4. Verify and Switch
```powershell
# Test the containerized deployment
curl http://localhost:3000
curl http://localhost:3001/api/health

# If successful, disable old autostart
Disable-ScheduledTask -TaskName "Care2system Auto Start" -ErrorAction SilentlyContinue
```

## Production Checklist

### Pre-Deployment
- [ ] Set all required environment variables in .env.production
- [ ] Mount Cloudflare tunnel configuration
- [ ] Ensure sufficient disk space (>5GB recommended)
- [ ] Ensure sufficient memory (>4GB recommended)
- [ ] Test environment variable loading
- [ ] Verify Docker and docker-compose versions

### Post-Deployment
- [ ] All services show "healthy" status
- [ ] Frontend accessible on http://localhost:3000
- [ ] Backend API responds on http://localhost:3001/api/health
- [ ] Database accepts connections
- [ ] Cloudflare tunnel connects successfully
- [ ] Production URL (care2connects.org) works
- [ ] Log files being written to volumes
- [ ] Resource usage within acceptable limits

### Monitoring Setup
- [ ] Set up log rotation for Docker logs
- [ ] Configure external monitoring (if needed)
- [ ] Set up alerting for service failures
- [ ] Document recovery procedures
- [ ] Test backup and restore procedures
- [ ] Schedule regular health checks

## Advanced Configuration

### Custom Network Configuration
```yaml
# In docker-compose.production.yml, modify:
networks:
  care2system-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1
```

### Load Balancing (Multiple Backend Instances)
```powershell
# Scale backend service
docker-compose -f docker-compose.production.yml up -d --scale backend=2

# Use nginx for load balancing (add to docker-compose.production.yml)
```

### SSL/TLS Termination
```yaml
# Add nginx proxy service to docker-compose.production.yml
nginx-proxy:
  image: nginx:alpine
  ports:
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf:ro
    - ./ssl:/etc/ssl:ro
```

## Maintenance

### Regular Tasks
```powershell
# Update images (monthly)
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d

# Clean up unused resources (weekly)
docker system prune -f

# Backup database (daily - set up scheduled task)
.\scripts\backup-database-docker.ps1
```

### Security Updates
```powershell
# Rebuild images with latest security updates
docker-compose -f docker-compose.production.yml build --no-cache --pull
docker-compose -f docker-compose.production.yml up -d
```

This Docker setup provides production-grade containerization that addresses all the reliability issues from the January 11, 2026 incident while providing operational flexibility and monitoring capabilities.