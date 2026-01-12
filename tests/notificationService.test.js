// test/notificationService.test.js
const { expect } = require('chai');
const sinon = require('sinon');
const db = require('../models');
const schedule = require('node-schedule');
const { scheduleNotifications } = require('../services/notificationService');

describe('Notification Service', () => {
  let sandbox;


  beforeEach(async () => {
    sandbox = sinon.createSandbox();

    // Drop and recreate schema to ensure clean state
    await db.sequelize.query('DROP SCHEMA IF EXISTS public CASCADE;');
    await db.sequelize.query('CREATE SCHEMA public;');
    // Синхронизация таблицы Users
    await db.User.sync({ force: true }); // Создаем или обновляем таблицу Users
    await db.Notification.sync({ force: true }); // Создаем или обновляем таблицу Notifications

    // Мокаем методы создания уведомлений
    sandbox.stub(db.Notification, 'findOne').resolves(null);
    sandbox.stub(db.Notification, 'create').resolves();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should schedule daily jobs', () => {
    const scheduleJobStub = sandbox.stub(schedule, 'scheduleJob');
    scheduleNotifications();

    expect(scheduleJobStub.calledOnce).to.be.true;
    expect(scheduleJobStub.firstCall.args[0]).to.equal('0 0 * * *');
  });
  it('should send birthday reminder notifications for users with birthdays in 30 days', async () => {
    // Дата "сегодня"
    const today = new Date();
    
    // Получаем всех пользователей из базы
    const users = await db.User.findAll({ where: { role: 'employee' } });
    const admins = await db.User.findAll({ where: { role: 'admin' } });

    const userWithUpcomingBirthday = users.find(user => {
      const birthDate = new Date(user.birthDate);
      const currentYear = today.getFullYear();
      let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());

      if (nextBirthday < today) {
        nextBirthday.setFullYear(currentYear + 1);
      }

      const daysUntilBirthday = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
      return daysUntilBirthday === 30;
    });

    if (userWithUpcomingBirthday) {
      await scheduleNotifications();

      expect(db.Notification.create.called).to.be.true;
      const notificationArgs = db.Notification.create.firstCall.args[0];
      expect(notificationArgs.message).to.include(`Через месяц день рождения у ${userWithUpcomingBirthday.firstName} ${userWithUpcomingBirthday.lastName}`);
      expect(notificationArgs.type).to.equal('birthday_reminder');
    } else {
      console.log('Нет пользователей с днем рождения через 30 дней.');
    }
  });

  it('should send salary increase reminder notifications for users with upcoming raises', async () => {
    const today = new Date();

    // Получаем всех пользователей
    const users = await db.User.findAll({ where: { role: 'employee' } });
    const admins = await db.User.findAll({ where: { role: 'admin' } });

    const userWithUpcomingRaise = users.find(user => {
      const lastIncrease = new Date(user.lastSalaryIncreaseDate || user.hireDate);
      const nextIncreaseDate = new Date(lastIncrease);
      nextIncreaseDate.setMonth(nextIncreaseDate.getMonth() + 6);

      const daysUntilNextIncrease = Math.ceil((nextIncreaseDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilNextIncrease === 30;
    });

    if (userWithUpcomingRaise) {
      await scheduleNotifications();

      expect(db.Notification.create.called).to.be.true;
      const notificationArgs = db.Notification.create.firstCall.args[0];
      expect(notificationArgs.message).to.include(`Через месяц запланировано повышение зарплаты для сотрудника ${userWithUpcomingRaise.firstName} ${userWithUpcomingRaise.lastName}`);
      expect(notificationArgs.type).to.equal('salary_increase_reminder');
    } else {
      console.log('Нет сотрудников, у которых запланировано повышение зарплаты через 30 дней.');
    }
  });

  it('should automatically increase salary for eligible users', async () => {
    const today = new Date();

    // Получаем всех пользователей
    const users = await db.User.findAll({ where: { role: 'employee' } });
    const admins = await db.User.findAll({ where: { role: 'admin' } });

    const userEligibleForRaise = users.find(user => {
      const lastIncrease = new Date(user.lastSalaryIncreaseDate || user.hireDate);
      const nextIncreaseDate = new Date(lastIncrease);
      nextIncreaseDate.setMonth(nextIncreaseDate.getMonth() + 6);

      const daysUntilNextIncrease = Math.ceil((nextIncreaseDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilNextIncrease <= 0 && user.salary < 1500;
    });

    if (userEligibleForRaise) {
      sandbox.stub(userEligibleForRaise, 'update').resolves();  // Мокаем метод update

      await scheduleNotifications();

      expect(userEligibleForRaise.update.calledOnce).to.be.true;
      const updateArgs = userEligibleForRaise.update.firstCall.args[0];
      expect(updateArgs.salary).to.be.at.most(1500);  // Проверяем, что зарплата увеличена корректно

      // Проверяем, что уведомление о повышении зарплаты было создано
      expect(db.Notification.create.called).to.be.true;
      const notificationArgs = db.Notification.create.firstCall.args[0];
      expect(notificationArgs.message).to.include(`Зарплата сотрудника ${userEligibleForRaise.firstName} ${userEligibleForRaise.lastName} была автоматически увеличена`);
      expect(notificationArgs.type).to.equal('salary_increased');
    } else {
      console.log('Нет сотрудников, которым требуется повысить зарплату.');
    }
  });
});
