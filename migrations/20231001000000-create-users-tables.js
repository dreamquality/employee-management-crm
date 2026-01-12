// migrations/XXXXXXXXXXXXXX-create-users-table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true, // Автоматическое увеличение ID
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      middleName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      birthDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      programmingLanguage: {
        type: Sequelize.STRING,
        allowNull: false
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true // Теперь поле допускает NULL
      },
      bankCard: {
        type: Sequelize.STRING,
        allowNull: true
      },
      registrationDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      lastLoginDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      salary: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      lastSalaryIncreaseDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      position: {
        type: Sequelize.STRING,
        allowNull: true
      },
      mentorName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      vacationDates: {
        type: Sequelize.JSON, // Используем JSON для хранения массива дат
        allowNull: true
      },
      hireDate: {
        type: Sequelize.DATEONLY,
        allowNull: true, // или false, если поле обязательно
      },
      githubLink: {
        type: Sequelize.STRING,
        allowNull: true
      },
      linkedinLink: {
        type: Sequelize.STRING,
        allowNull: true
      },
      adminNote: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      currentProject: {
        type: Sequelize.STRING,
        allowNull: true
      },
      englishLevel: {
        type: Sequelize.STRING,
        allowNull: true
      },
      workingHoursPerWeek: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('employee', 'admin'),
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') // Значение по умолчанию
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') // Значение по умолчанию
      }
    }, {
      schema: 'public' // Указываем схему
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users', { schema: 'public' });
  }
};
