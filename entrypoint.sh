#!/bin/sh
set -e

echo "Running database migrations..."
npx sequelize-cli db:migrate

# Seeders are NOT run automatically in production for security reasons
# Default admin users with well-known credentials pose a security risk
# To seed the database in production, set RUN_SEEDERS=true environment variable
if [ "$NODE_ENV" = "production" ] && [ "$RUN_SEEDERS" = "true" ]; then
    echo "RUN_SEEDERS=true detected. Running production seeders..."
    echo "WARNING: This will create default admin users with well-known credentials."
    echo "Make sure to change default passwords immediately after deployment!"
    
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
elif [ "$NODE_ENV" = "production" ]; then
    echo "Skipping seeders in production (recommended for security)."
    echo "The default admin user will be created automatically by app.js on first startup."
    echo "Default credentials: admin@example.com / adminpassword"
    echo "IMPORTANT: Change the default password immediately after first login!"
fi

echo "Starting application..."
exec "$@"
