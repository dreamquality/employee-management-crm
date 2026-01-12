# Используем базовый образ Node.js
# Note: Render provides health check functionality that doesn't require curl in the container
FROM node:20-slim

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем все зависимости (включая devDependencies для миграций)
# sequelize-cli нужен для запуска миграций при старте
RUN npm ci

# Копируем entrypoint скрипт и делаем его исполняемым
# (copy before app code to avoid cache invalidation when only app code changes)
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Копируем остальной код приложения
COPY . .

# Создаем непривилегированного пользователя для безопасности
RUN groupadd -r appuser && useradd -r -g appuser appuser && \
    chown -R appuser:appuser /app && \
    chown appuser:appuser /entrypoint.sh

# Переключаемся на непривилегированного пользователя
USER appuser

# Указываем порт, который будет использоваться
EXPOSE 3000

# Устанавливаем entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Команда для запуска приложения
CMD ["npm", "start"]
