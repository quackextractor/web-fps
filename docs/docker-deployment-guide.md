# Docker Deployment Guide

This guide provides instructions for deploying the INDUSTRIALIST web application and database using Docker and Docker Compose.

## Prerequisites
Ensure you have the following installed on your target environment:
- **Docker** (v20.10 or higher)
- **Docker Compose** (v2.0 or higher)

## Quick Start (Local Deployment)

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/quackextractor/web-fps.git
   cd web-fps
   ```

2. **Configure Environment Variables**:
   By default, `docker-compose.yml` is pre-configured with development credentials. For production environments, update the database user, passwords, and `JWT_SECRET` in `docker-compose.yml` or create a `.env` file in the root directory:
   ```env
   POSTGRES_USER=industrialist
   POSTGRES_PASSWORD=secure_production_password
   POSTGRES_DB=industrialist
   JWT_SECRET=a_very_secure_random_string_of_at_least_32_characters
   ```

3. **Start the Containers**:
   Execute the following command in the project root directory:
   ```bash
   docker compose up -d --build
   ```

4. **Verify Deployment**:
   - The web app will be accessible at [http://localhost:3000](http://localhost:3000).
   - Check container status and logs:
     ```bash
     docker compose ps
     docker compose logs -f
     ```

## Database Migrations
On startup, the web container's entrypoint script automatically checks the database readiness and runs Prisma migrations (`prisma migrate deploy`) to ensure the PostgreSQL schema matches the codebase definitions. You do not need to manually push or seed the schema on initial startup.

## Customizing Configurations

- **Port Mapping**:
  To change the port exposed on your host machine, modify the port binding under the `web` service in `docker-compose.yml`. E.g., to use port 8080:
  ```yaml
  ports:
    - "8080:3000"
  ```

- **Data Persistence**:
  A Docker named volume `pgdata` is declared to persist PostgreSQL data. This ensures your user profiles, saves, and leaderboards survive container restarts and updates.
