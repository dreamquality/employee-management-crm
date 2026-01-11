const express = require("express");
const app = express();
const config = require("./config/config");
const db = require("./models");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const projectRoutes = require("./routes/projectRoutes");
const errorHandler = require("./middleware/errorHandler");
const { scheduleNotifications } = require("./services/notificationService");
const bcrypt = require("bcryptjs");
const logger = require("./utils/logger");
const { swaggerUi, swaggerSpec } = require("./swagger");
const morgan = require("morgan");
const helmet = require("helmet"); // Добавляем helmet
const cors = require("cors"); // Добавляем CORS

// Middleware
app.use(express.json());

// Безопасность заголовков с helmet
app.use(helmet());

// Настройка CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*", // Разрешаем все домены (можно настроить на конкретные)
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions)); // Используем CORS middleware

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    // Если возникла ошибка парсинга JSON
    console.error("Ошибка парсинга JSON:", err.message);
    return res.status(400).json({
      error: "Некорректный JSON в запросе",
    });
  }
  next();
});

// Логирование HTTP-запросов
app.use(morgan("combined"));

// Swagger документация
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

// Маршрут для выдачи JSON спецификации
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Health check endpoint for Docker
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Маршруты
app.use(authRoutes);
app.use(userRoutes);
app.use(notificationRoutes);
app.use(projectRoutes);

// Обработчик ошибок
app.use(errorHandler);

// Логирование текущего окружения и порта
console.log(`Текущее окружение: ${process.env.NODE_ENV}`);
console.log(`Используемый порт: ${process.env.PORT || 3000}`);

// Получение публичного URL из переменной окружения или использование localhost как резервный вариант
const publicUrl =
  process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 10000}`;

// Initialize database and start server (only if not in test mode)
if (process.env.NODE_ENV !== "test") {
  // Синхронизация базы данных и запуск сервера
  db.sequelize
    .sync()
    .then(async () => {
      try {
        console.log("Подключение к базе данных успешно.");

        // Создание администратора по умолчанию, если его нет
        const existingAdmin = await db.User.findOne({
          where: {
            email: "admin1@example.com",
          },
        });

        if (!existingAdmin) {
          console.log(
            "Администратор не найден. Создаём администратора по умолчанию..."
          );
          const hashedPassword = await bcrypt.hash("adminpassword", 10);
          try {
            await db.User.create({
              firstName: "Default",
              lastName: "Admin",
              middleName: "User",
              birthDate: "1970-01-01",
              phone: "+0000000000",
              email: "admin1@example.com",
              programmingLanguage: "N/A",
              password: hashedPassword,
              role: "admin",
              hireDate: "2020-04-04",
            });
            console.log(
              "Администратор по умолчанию создан: admin1@example.com / adminpassword"
            );
          } catch (createError) {
            // Игнорируем ошибку, если пользователь уже существует
            if (createError.name === "SequelizeUniqueConstraintError") {
              console.log("Администратор уже существует (duplicate email).");
            } else {
              throw createError;
            }
          }
        } else {
          console.log("Администратор уже существует.");
        }

        // Запуск планировщика уведомлений
        console.log("Запуск планировщика уведомлений...");
        scheduleNotifications();
        console.log("Планировщик уведомлений успешно запущен.");

        // Запуск сервера
        const port = process.env.PORT || 10000;
        app.listen(port, () => {
          console.log(`Сервер запущен на порту ${port}`);
          console.log(`OpenAPI доступна по адресу ${publicUrl}/api-docs`);
        });
      } catch (err) {
        console.error("Ошибка при запуске приложения:", err);
        logger.error("Не удалось запустить приложение:", err);
      }
    })
    .catch((err) => {
      console.error("Ошибка синхронизации базы данных:", err);
      logger.error("Ошибка синхронизации базы данных:", err);
    });
}

module.exports = app;
