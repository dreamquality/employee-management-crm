// migrations/XXXXXXXXXXXXXX-create-notifications-table.js
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "Notifications",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        message: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: {
              tableName: "Users",
              schema: "public",
            },
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        relatedUserId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: {
              tableName: "Users",
              schema: "public",
            },
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        type: {
          type: Sequelize.ENUM(
            "birthday_reminder",
            "birthday",
            "salary_increase_reminder",
            "salary_increase",
            "salary_threshold_reached",
            "welcome",
            "general",
            "employee_created",
            "user_update"
          ),
          allowNull: false,
        },
        eventDate: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        isRead: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      },
      {
        schema: "public", // Указываем схему
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Notifications", { schema: "public" });
  },
};
