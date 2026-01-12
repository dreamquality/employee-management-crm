// config/config.js

require('dotenv').config();

// Функция для логирования переменных окружения (для отладки)
function logEnvVariables(env) {
  console.log('=== Environment Variables ===');
  if (env === 'production') {
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '******' : 'Not Set'}`);
  } else {
    console.log(`DB_HOST: ${process.env.DB_HOST}`);
    console.log(`DB_PORT: ${process.env.DB_PORT}`);
    console.log(`DB_NAME: ${process.env.DB_NAME}`);
    console.log(`DB_USER: ${process.env.DB_USER}`);
    console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? '******' : 'Not Set'}`);
  }
  console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '******' : 'Not Set'}`);
  console.log(`SECRET_WORD: ${process.env.SECRET_WORD ? '******' : 'Not Set'}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`PORT: ${process.env.PORT}`);
  console.log('=============================\n');
}

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

logEnvVariables(env);

const config = {
  development: {
    username: process.env.DB_USER || 'your_local_db_user',
    password: process.env.DB_PASSWORD || 'your_local_db_password',
    database: process.env.DB_NAME || 'employee_db',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    schema: 'public', // Если вы используете схему
    dialectOptions: {
      ssl: false, // В локальной разработке SSL не требуется
    },
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME_TEST || 'my_database_test',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    schema: 'public',
    dialectOptions: {
      ssl: false,
    },
    dialect: 'postgres',
    logging: false, // Disable SQL logging in tests
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // В некоторых случаях это помогает устранить ошибки сертификата
      },
    },
    logging: console.log,
  },
};

// Логирование текущей конфигурации базы данных для отладки
console.log('Current DB Configuration:', config[env]);

module.exports = config;
