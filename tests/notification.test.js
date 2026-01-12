// tests/notification.test.js
const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const db = require('../models');

let adminToken;
let employee;

describe('Notification API', () => {
  before(async () => {
    // Drop and recreate schema to ensure clean state
    await db.sequelize.query('DROP SCHEMA IF EXISTS public CASCADE;');
    await db.sequelize.query('CREATE SCHEMA public;');
    await db.sequelize.sync({ force: true });

    // Создаем администратора и получаем токен
    await request(app)
      .post('/register')
      .send({
        email: 'admin@example.com',
        password: 'adminpassword',
        firstName: 'Admin',
        lastName: 'User',
        middleName: 'Middle',
        birthDate: '1980-01-01',
        phone: '+987654321',
        programmingLanguage: 'N/A',
        role: 'admin',
        secretWord: process.env.SECRET_WORD
      });

    const res = await request(app)
      .post('/login')
      .send({
        email: 'admin@example.com',
        password: 'adminpassword'
      });

    adminToken = res.body.token;

    // Создаем сотрудника, к которому будет относиться уведомление
    employee = await db.User.create({
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'Middle',
      email: 'john.doe@example.com',
      phone: '+123456789',
      birthDate: '1990-01-01',
      programmingLanguage: 'JavaScript',
      country: 'USA',
      hireDate: new Date(),
      salary: 1000,
      role: 'employee',
      password: 'employeePassword'
    });

    // Создаем уведомление с relatedUserId
    await db.Notification.create({
      message: 'Test notification',
      userId: 1, // Администратор
      relatedUserId: employee.id, // Сотрудник, к которому относится уведомление
      type: 'general',
      eventDate: new Date(),
      isRead: false
    });
  });

  describe('GET /notifications', () => {
    it('should get list of notifications for admin', async () => {
      const res = await request(app)
        .get('/notifications')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body.notifications[0]).to.have.property('message');
      expect(res.body.notifications[0]).to.have.property('relatedUserId', employee.id);
    });
  });

  describe('PATCH /notifications/:id/mark-as-read', () => {
    it('should mark notification as read', async () => {
      const res = await request(app)
        .patch('/notifications/1/mark-as-read')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'Уведомление отмечено как прочитанное');

      // Проверяем, что уведомление действительно отмечено как прочитанное
      const notification = await db.Notification.findByPk(1);
      expect(notification.isRead).to.be.true;
    });
  });
});
