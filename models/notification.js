// models/notification.js
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      message: { type: DataTypes.STRING, allowNull: false },
      userId: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: {
          model: 'Users', // Имя таблицы Users
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      relatedUserId: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: {
          model: 'Users', // Имя таблицы Users
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "general",
      },
      eventDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      schema: "public",
      tableName: "Notifications",
      timestamps: true,
    }
  );

  // Ассоциации
  Notification.associate = function(models) {
    Notification.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Notification.belongsTo(models.User, {
      foreignKey: 'relatedUserId',
      as: 'relatedUser'
    });
  };

  return Notification;
};
