// models/project.js
module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define(
    "Project",
    {
      name: { 
        type: DataTypes.STRING, 
        allowNull: false,
        unique: true
      },
      description: { 
        type: DataTypes.TEXT, 
        allowNull: false 
      },
      wage: { 
        type: DataTypes.FLOAT, 
        allowNull: true,
        defaultValue: 0
      },
      active: { 
        type: DataTypes.BOOLEAN, 
        allowNull: false,
        defaultValue: true 
      },
    },
    {
      schema: "public",
      tableName: "Projects",
      timestamps: true,
    }
  );

  Project.associate = function(models) {
    Project.belongsToMany(models.User, { 
      through: 'UserProjects',
      as: 'employees',
      foreignKey: 'projectId',
      otherKey: 'userId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return Project;
};
