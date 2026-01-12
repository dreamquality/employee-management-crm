#!/bin/sh
set -e

echo "Running database migrations..."
npx sequelize-cli db:migrate

# Run seeders in production if needed (creates default admin user)
if [ "$NODE_ENV" = "production" ]; then
    echo "Running production seeders..."
    # Note: Seeders may fail if already applied, which is expected behavior
    npx sequelize-cli db:seed:all 2>&1 | grep -v "SequelizeUniqueConstraintError" || true
fi

echo "Starting application..."
exec "$@"
