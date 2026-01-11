#!/bin/sh
set -e

echo "Running database migrations..."
npx sequelize-cli db:migrate

echo "Starting application..."
exec "$@"
