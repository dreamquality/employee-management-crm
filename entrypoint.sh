#!/bin/sh
set -e

echo "Running database migrations..."
npx sequelize-cli db:migrate

# Run seeders in production if needed (creates default admin user)
if [ "$NODE_ENV" = "production" ]; then
    echo "Running production seeders..."
    npx sequelize-cli db:seed:all || echo "Seeders already applied or failed"
fi

echo "Starting application..."
exec "$@"
