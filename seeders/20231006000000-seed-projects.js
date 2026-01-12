// seeders/20231006000000-seed-projects.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Check if projects already exist
      const existingProjects = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as count FROM "public"."Projects";`,
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      if (existingProjects[0].count > 0) {
        await transaction.commit();
        return;
      }

      // Create sample projects
      const projects = [
        {
          name: 'CRM System',
          description: 'Customer Relationship Management system for enterprise clients with advanced analytics and reporting features.',
          wage: 5000,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'E-commerce Platform',
          description: 'Modern e-commerce platform with payment integration, inventory management, and customer portal.',
          wage: 4500,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Mobile Banking App',
          description: 'Secure mobile banking application with biometric authentication and real-time transaction processing.',
          wage: 6000,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Healthcare Portal',
          description: 'Patient management and telemedicine platform for healthcare providers.',
          wage: 5500,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Legacy System Migration',
          description: 'Migration of legacy systems to modern cloud-based architecture.',
          wage: 4000,
          active: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Internal Tools Development',
          description: 'Development and maintenance of internal productivity tools and automation scripts.',
          wage: 3500,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      await queryInterface.bulkInsert('Projects', projects, { transaction });

      // Get all users and projects to create some associations
      const users = await queryInterface.sequelize.query(
        `SELECT "id" FROM "public"."Users" WHERE role = 'employee' LIMIT 10;`,
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      const projectRecords = await queryInterface.sequelize.query(
        `SELECT "id" FROM "public"."Projects";`,
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      if (users.length > 0 && projectRecords.length > 0) {
        const userProjects = [];
        const assignedCombinations = new Set();
        
        // Fisher-Yates shuffle algorithm
        const shuffleArray = (array) => {
          const shuffled = [...array];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          return shuffled;
        };
        
        // Assign random projects to users
        users.forEach((user, index) => {
          // Assign 1-3 projects to each user
          const numProjects = Math.floor(Math.random() * 3) + 1;
          const shuffledProjects = shuffleArray(projectRecords);
          
          for (let i = 0; i < Math.min(numProjects, projectRecords.length); i++) {
            const combinationKey = `${user.id}-${shuffledProjects[i].id}`;
            
            // Only add if this combination hasn't been added yet
            if (!assignedCombinations.has(combinationKey)) {
              assignedCombinations.add(combinationKey);
              userProjects.push({
                userId: user.id,
                projectId: shuffledProjects[i].id,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            }
          }
        });

        if (userProjects.length > 0) {
          await queryInterface.bulkInsert('UserProjects', userProjects, { transaction });
        }
      }

      await transaction.commit();
      console.log('Projects seeded successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('Error seeding projects:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('UserProjects', null, { transaction });
      await queryInterface.bulkDelete('Projects', null, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
