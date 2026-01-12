'use strict';
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const users = [];
      const salt = await bcrypt.genSalt(10);

      // Создаем администратора, если его ещё нет
      const existingAdmin = await queryInterface.sequelize.query(
        `SELECT "id" FROM "public"."Users" WHERE email = 'admin@example.com';`,
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      if (existingAdmin.length === 0) {
        const adminUser = {
          firstName: 'Default',
          lastName: 'Admin',
          middleName: 'User',
          email: 'admin@example.com',
          phone: '+0000000000',
          birthDate: '1970-01-01',
          programmingLanguage: 'N/A',
          country: null,
          bankCard: null,
          registrationDate: '2024-09-23T15:09:51.485Z',
          lastLoginDate: '2024-09-25T11:26:32.299Z',
          salary: 600,
          lastSalaryIncreaseDate: '2024-09-23',
          position: null,
          mentorName: null,
          vacationDates: null,
          githubLink: null,
          linkedinLink: null,
          adminNote: null,
          englishLevel: null,
          workingHoursPerWeek: null,
          hireDate: '2020-04-04',
          role: 'admin',
          password: await bcrypt.hash('adminpassword', salt),
          createdAt: '2024-09-23T15:09:51.491Z',
          updatedAt: '2024-09-25T11:26:32.300Z',
        };
        users.push(adminUser);
      }

      // Создаем пользователей с днем рождения через 30 дней
      const birthdayUser = {
        firstName: 'John',
        lastName: 'Doe',
        middleName: faker.person.middleName(),
        email: faker.internet.email(),
        phone: faker.phone.number('+1-###-###-####'),
        birthDate: new Date(new Date().setDate(new Date().getDate() + 30)), // День рождения через 30 дней
        programmingLanguage: 'JavaScript',
        country: 'USA',
        bankCard: null,
        registrationDate: faker.date.past(),
        lastLoginDate: faker.date.recent(),
        hireDate: faker.date.past(2),
        salary: 1000,
        lastSalaryIncreaseDate: faker.date.past(1),
        position: 'Developer',
        mentorName: null,
        vacationDates: null, // Исправлено здесь
        githubLink: `https://github.com/${faker.internet.userName()}`,
        linkedinLink: `https://linkedin.com/in/${faker.internet.userName()}`,
        adminNote: null,
        englishLevel: 'Advanced',
        workingHoursPerWeek: 40,
        role: 'employee',
        password: await bcrypt.hash('password123', salt),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.push(birthdayUser);

      // Создаем пользователей с предстоящим повышением зарплаты
      const salaryIncreaseUser = {
        firstName: 'Jane',
        lastName: 'Smith',
        middleName: faker.person.middleName(),
        email: faker.internet.email(),
        phone: faker.phone.number('+1-###-###-####'),
        birthDate: faker.date.past(40, '2000-01-01'),
        programmingLanguage: 'Python',
        country: 'Canada',
        bankCard: null,
        registrationDate: faker.date.past(),
        lastLoginDate: faker.date.recent(),
        hireDate: faker.date.past(1),
        salary: 1200,
        lastSalaryIncreaseDate: new Date(new Date().setMonth(new Date().getMonth() - 5)), // Повышение через 30 дней
        position: 'Senior Developer',
        mentorName: 'Michael Brown',
        vacationDates: null, // Исправлено здесь
        githubLink: `https://github.com/${faker.internet.userName()}`,
        linkedinLink: `https://linkedin.com/in/${faker.internet.userName()}`,
        adminNote: 'Top performer',
        englishLevel: 'Intermediate',
        workingHoursPerWeek: 40,
        role: 'employee',
        password: await bcrypt.hash('password123', salt),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.push(salaryIncreaseUser);

      // Создаем остальных сотрудников для тестов
      for (let i = 0; i < 10; i++) {
        const password = await bcrypt.hash('password123', salt);
        const user = {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          middleName: faker.person.middleName(),
          email: faker.internet.email(),
          phone: faker.phone.number('+1-###-###-####'),
          birthDate: faker.date.past(40, '2000-01-01'),
          programmingLanguage: faker.helpers.arrayElement(['JavaScript', 'Python', 'Java', 'C#', 'Ruby']),
          country: faker.location.country(),
          bankCard: faker.finance.creditCardNumber(),
          registrationDate: faker.date.past(),
          lastLoginDate: faker.date.recent(),
          hireDate: faker.date.past(10),
          salary: faker.number.int({ min: 400, max: 1400 }),
          lastSalaryIncreaseDate: faker.date.past(1),
          position: faker.helpers.arrayElement(['Junior Developer', 'Developer', 'Senior Developer', 'Lead Developer']),
          mentorName: faker.person.fullName(),
          vacationDates: null, // Исправлено здесь
          githubLink: `https://github.com/${faker.internet.userName()}`,
          linkedinLink: `https://linkedin.com/in/${faker.internet.userName()}`,
          adminNote: faker.lorem.sentence(),
          englishLevel: faker.helpers.arrayElement(['Beginner', 'Intermediate', 'Advanced', 'Fluent']),
          workingHoursPerWeek: faker.number.int({ min: 30, max: 40}),
          role: 'employee',
          password,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        users.push(user);
      }

      // Вставляем пользователей в базу данных
      await queryInterface.bulkInsert({ tableName: 'Users', schema: 'public' }, users, { transaction });

      // Получаем всех пользователей из базы данных
      const usersFromDb = await queryInterface.sequelize.query(
        `SELECT "id", "firstName", "lastName", "role" FROM "public"."Users";`,
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      const notifications = [];

      // Разделяем администраторов и сотрудников
      const adminUsers = usersFromDb.filter(user => user.role === 'admin');
      const employeeUsers = usersFromDb.filter(user => user.role === 'employee');

      // Создаем уведомления для сотрудников
      for (const employee of employeeUsers) {
        const adminUser = adminUsers[0]; // Предполагаем, что есть хотя бы один администратор
        if (adminUser) {
          // Уведомление о дне рождения
          notifications.push({
            message: `Напоминание: У сотрудника ${employee.firstName} ${employee.lastName} скоро день рождения!`,
            userId: adminUser.id,
            relatedUserId: employee.id,
            type: 'birthday_reminder',
            eventDate: new Date(new Date().setDate(new Date().getDate() + 30)),
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          // Уведомление о предстоящем повышении зарплаты
          notifications.push({
            message: `У сотрудника ${employee.firstName} ${employee.lastName} скоро планируется повышение зарплаты.`,
            userId: adminUser.id,
            relatedUserId: employee.id,
            type: 'salary_increase_reminder',
            eventDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      // Создаем общие уведомления для администраторов
      for (const admin of adminUsers) {
        notifications.push({
          message: `Добро пожаловать, ${admin.firstName} ${admin.lastName}!`,
          userId: admin.id,
          relatedUserId: admin.id,
          type: 'welcome',
          eventDate: new Date(),
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Вставляем уведомления в базу данных
      await queryInterface.bulkInsert({ tableName: 'Notifications', schema: 'public' }, notifications, { transaction });

      await transaction.commit();
      console.log('Пользователи и уведомления успешно посеяны');
    } catch (error) {
      await transaction.rollback();
      console.error('Ошибка при посеве данных:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Удаляем уведомления и пользователей
      await queryInterface.bulkDelete({ tableName: 'Notifications', schema: 'public' }, null, { transaction });
      await queryInterface.bulkDelete({ tableName: 'Users', schema: 'public' }, null, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('Ошибка при откате посева данных:', error);
      throw error;
    }
  }
};
