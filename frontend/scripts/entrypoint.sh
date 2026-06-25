#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Applying database migrations..."
prisma migrate deploy --schema=/app/prisma/schema.prisma

echo "Starting Next.js standalone server..."
exec node server.js
