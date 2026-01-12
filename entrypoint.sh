#!/bin/sh
set -e

echo "Running database migrations..."
npx sequelize-cli db:migrate

# Run seeders in production if needed (creates default admin user)
if [ "$NODE_ENV" = "production" ]; then
    echo "Running production seeders..."
    # Seeders are idempotent - they check if data exists before inserting
    # Unique constraint errors are expected and can be ignored
    # Temporarily disable 'set -e' so we can inspect the seeder exit status ourselves
    set +e
    npx sequelize-cli db:seed:all 2>&1 | tee /tmp/seeder.log
    seeder_status=$?
    set -e

    if [ "$seeder_status" -ne 0 ]; then
        if grep -q "SequelizeUniqueConstraintError" /tmp/seeder.log; then
            echo "Seeders already applied (unique constraint - expected behavior)"
        else
            echo "Warning: Seeders may have encountered issues - check logs"
        fi
    fi
fi

echo "Starting application..."
exec "$@"
