# Используем базовый образ Node.js
# Note: curl is used for health checks and is available in the official Node.js images
FROM node:18-slim

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости (используем npm ci для более надежной установки)
# На этапе сборки устанавливаются все зависимости; NODE_ENV=production задается на этапе запуска (например, через render.yaml) и не влияет на установку здесь
RUN npm ci

# Копируем entrypoint скрипты и делаем их исполняемыми (copy before app code to avoid cache invalidation when only app code changes)
COPY entrypoint.sh /entrypoint.sh
COPY entrypoint-test.sh /entrypoint-test.sh
RUN chmod +x /entrypoint.sh /entrypoint-test.sh

# Копируем остальной код приложения
COPY . .

# Указываем порт, который будет использоваться
EXPOSE 3000

# Устанавливаем entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Команда для запуска приложения
CMD ["npm", "start"]
