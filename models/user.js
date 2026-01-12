// models/user.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, allowNull: false },
      middleName: { type: DataTypes.STRING, allowNull: false },
      birthDate: { type: DataTypes.DATEONLY, allowNull: false },
      phone: { type: DataTypes.STRING, allowNull: false },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: { isEmail: true },
      },
      programmingLanguage: { type: DataTypes.STRING, allowNull: false },
      country: { type: DataTypes.STRING },
      bankCard: { type: DataTypes.STRING },
      password: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM("employee", "admin"),
        allowNull: false,
        defaultValue: 'employee',
      },
      registrationDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      lastLoginDate: { type: DataTypes.DATE },
      // Поля только для администратора
      salary: { type: DataTypes.FLOAT, defaultValue: 400 },
      lastSalaryIncreaseDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      position: { type: DataTypes.STRING },
      mentorName: { type: DataTypes.STRING },
      vacationDates: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      githubLink: { type: DataTypes.STRING },
      linkedinLink: { type: DataTypes.STRING },
      adminNote: { type: DataTypes.TEXT },
      englishLevel: { type: DataTypes.STRING },
      workingHoursPerWeek: {
        type: DataTypes.INTEGER,
        allowNull: true, // Можно установить значение по умолчанию
      },
      hireDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      schema: "public",
      tableName: "Users",
      timestamps: true,
      defaultScope: {
        attributes: { exclude: ['password'] }
      },
      scopes: {
        withPassword: {
          attributes: { include: ['password'] }
        }
      }
    }
  );

  // Ассоциация с моделью Notification с каскадным удалением
  User.associate = function(models) {
    User.hasMany(models.Notification, { 
      as: 'notifications', 
      foreignKey: 'userId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      hooks: true,
    });
    User.hasMany(models.Notification, { 
      as: 'relatedNotifications', 
      foreignKey: 'relatedUserId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      hooks: true,
    });
    User.belongsToMany(models.Project, { 
      through: 'UserProjects',
      as: 'projects',
      foreignKey: 'userId',
      otherKey: 'projectId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return User;
};
