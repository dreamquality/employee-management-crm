# Use Node.js base image
# Note: Render provides health check functionality that doesn't require curl in the container
FROM node:20-slim

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies needed for migrations)
# sequelize-cli is required to run database migrations at startup
RUN npm ci

# Copy entrypoint script and make it executable
# (copy before app code to avoid cache invalidation when only app code changes)
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy application code
COPY . .

# Create non-root user for enhanced security
RUN groupadd -r appuser && useradd -r -g appuser appuser && \
    chown -R appuser:appuser /app && \
    chown appuser:appuser /entrypoint.sh

# Switch to non-root user
USER appuser

# Expose the port used by the application
EXPOSE 3000

# Set entrypoint to run migrations before starting
ENTRYPOINT ["/entrypoint.sh"]

# Command to start the application
CMD ["npm", "start"]
