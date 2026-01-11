# Используем базовый образ Node.js
FROM node:18

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm config set strict-ssl false && npm install

# Копируем entrypoint скрипты и делаем их исполняемыми (before app code for better caching)
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
