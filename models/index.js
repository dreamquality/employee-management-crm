// models/index.js
'use strict';

const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config')[env]; // Получаем конфигурацию для текущего окружения

let sequelize;

// Инициализация Sequelize в зависимости от среды
if (config.use_env_variable && process.env[config.use_env_variable]) {
  // Для продакшн-среды используется DATABASE_URL
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // Для локальной разработки и тестирования используются отдельные параметры
  sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    dialectOptions: config.dialectOptions, // Включаем дополнительные опции для диалекта
  });
}

const db = {};

// Сохранение ссылок на Sequelize и его экземпляр
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Импорт моделей
db.User = require('./user')(sequelize, DataTypes);
db.Notification = require('./notification')(sequelize, DataTypes);
db.Project = require('./project')(sequelize, DataTypes);

// Установление связей между моделями через associate methods
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
