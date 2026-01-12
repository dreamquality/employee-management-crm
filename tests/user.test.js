// tests/user.test.js
const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const db = require('../models');

let employeeToken;
let adminToken;

describe('User API', () => {
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

    const adminRes = await request(app)
      .post('/login')
      .send({
        email: 'admin@example.com',
        password: 'adminpassword'
      });

    adminToken = adminRes.body.token;

    // Создаем нескольких сотрудников
    const usersData = [
      {
        email: 'employee1@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Middle',
        birthDate: '1990-01-01',
        phone: '+123456789',
        programmingLanguage: 'JavaScript',
        country: 'USA',
        mentorName: 'Mentor A',
        englishLevel: 'Intermediate',
        registrationDate: '2021-01-01'
      },
      {
        email: 'employee2@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        middleName: 'Middle',
        birthDate: '1992-02-02',
        phone: '+987654321',
        programmingLanguage: 'Python',
        country: 'UK',
        mentorName: 'Mentor B',
        englishLevel: 'Advanced',
        registrationDate: '2021-02-01'
      },
      {
        email: 'employee3@example.com',
        password: 'password123',
        firstName: 'Alice',
        lastName: 'Johnson',
        middleName: 'Middle',
        birthDate: '1995-03-03',
        phone: '+111222333',
        programmingLanguage: 'Java',
        country: 'Canada',
        mentorName: 'Mentor A',
        englishLevel: 'Beginner',
        registrationDate: '2021-03-01'
      }
      // Добавьте больше сотрудников для тестирования пагинации
    ];

    for (const userData of usersData) {
      await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...userData,
          role: 'employee'
        });
    }

    // Получаем токен для одного из сотрудников
    const employeeRes = await request(app)
      .post('/login')
      .send({
        email: 'employee1@example.com',
        password: 'password123'
      });

    employeeToken = employeeRes.body.token;
  });

  describe('GET /users', () => {
    it('should get a paginated list of users', async () => {
      const res = await request(app)
        .get('/users?page=1&limit=2')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.users).to.be.an('array').that.has.lengthOf(2);
      expect(res.body).to.have.property('total');
      expect(res.body).to.have.property('page', 1);
      expect(res.body).to.have.property('totalPages');
    });

    it('should search users by first name', async () => {
      const res = await request(app)
        .get('/users?firstName=Jane')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.users).to.be.an('array');
      expect(res.body.users[0]).to.have.property('firstName', 'Jane');
    });

    it('should search users by last name', async () => {
      const res = await request(app)
        .get('/users?lastName=Johnson')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.users).to.be.an('array');
      expect(res.body.users[0]).to.have.property('lastName', 'Johnson');
    });

    it('should sort users by programmingLanguage in DESC order', async () => {
      const res = await request(app)
        .get('/users?sortBy=programmingLanguage&order=DESC')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.users).to.be.an('array');
      expect(res.body.users[0]).to.have.property('programmingLanguage', 'Python');
    });

    it('should return validation error for invalid query parameters', async () => {
      const res = await request(app)
        .get('/users?page=-1&limit=0&sortBy=invalidField')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors');
      expect(res.body.errors).to.be.an('array');
    });

    it('should sort users by englishLevel', async () => {
      const res = await request(app)
        .get('/users?sortBy=englishLevel&order=ASC')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.users).to.be.an('array');
      expect(res.body.users[0]).to.have.property('englishLevel', 'Advanced');
    });

    it('should filter users by multiple criteria', async () => {
      const res = await request(app)
        .get('/users?firstName=Alice&mentorName=Mentor A')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.users).to.be.an('array').that.has.lengthOf(1);
      expect(res.body.users[0]).to.have.property('firstName', 'Alice');
      expect(res.body.users[0]).to.have.property('mentorName', 'Mentor A');
    });
  });
});
