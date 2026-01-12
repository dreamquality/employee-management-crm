// tests/auth.test.js
const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const db = require('../models');

describe('Auth API', () => {
  before(async () => {
    // Drop and recreate schema to ensure clean state
    await db.sequelize.query('DROP SCHEMA IF EXISTS public CASCADE;');
    await db.sequelize.query('CREATE SCHEMA public;');
    await db.sequelize.sync({ force: true });
  });

  describe('POST /register', () => {
    it('should register a new employee', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'employee@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          middleName: 'Middle',
          birthDate: '1990-01-01',
          phone: '+123456789',
          programmingLanguage: 'JavaScript',
          secretWord: process.env.SECRET_WORD
        });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('userId');
    });

    it('should not register an admin without secret word', async () => {
      const res = await request(app)
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
          role: 'admin'
        });

      expect(res.status).to.equal(403);
      expect(res.body).to.have.property('error');
    });
  });

  describe('POST /login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'employee@example.com',
          password: 'password123',
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
    });

    it('should not login with invalid credentials', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'employee@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });
  });
});
