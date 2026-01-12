// tests/bugfixes.test.js
const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const db = require('../models');
const bcrypt = require('bcryptjs');

let employeeToken;
let adminToken;
let employeeId;
let employee2Id;
let adminId;

describe('Bug Fixes Tests', () => {
  before(async () => {
    // Recreate database to ensure clean state
    await db.sequelize.sync({ force: true });

    // Create admin
    await request(app)
      .post('/register')
      .send({
        email: 'admin@test.com',
        password: 'adminpass123',
        firstName: 'Admin',
        lastName: 'User',
        middleName: 'Test',
        birthDate: '1980-01-01',
        phone: '+1234567890',
        programmingLanguage: 'JavaScript',
        role: 'admin',
        secretWord: process.env.SECRET_WORD
      });

    const adminLogin = await request(app)
      .post('/login')
      .send({
        email: 'admin@test.com',
        password: 'adminpass123'
      });

    adminToken = adminLogin.body.token;
    
    // Get admin ID
    const adminUser = await db.User.findOne({ where: { email: 'admin@test.com' } });
    adminId = adminUser.id;

    // Create employee
    await request(app)
      .post('/register')
      .send({
        email: 'employee@test.com',
        password: 'emppass123',
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Test',
        birthDate: '1990-01-01',
        phone: '+1234567891',
        programmingLanguage: 'Python'
      });

    const empLogin = await request(app)
      .post('/login')
      .send({
        email: 'employee@test.com',
        password: 'emppass123'
      });

    employeeToken = empLogin.body.token;
    
    // Get employee ID
    const empUser = await db.User.findOne({ where: { email: 'employee@test.com' } });
    employeeId = empUser.id;

    // Create second employee for deletion test
    await request(app)
      .post('/register')
      .send({
        email: 'employee2@test.com',
        password: 'emppass123',
        firstName: 'Jane',
        lastName: 'Smith',
        middleName: 'Test',
        birthDate: '1991-01-01',
        phone: '+1234567892',
        programmingLanguage: 'Java'
      });
    
    const emp2User = await db.User.findOne({ where: { email: 'employee2@test.com' } });
    employee2Id = emp2User.id;
  });

  describe('Bug Fix 1: Field Permission Logic in updateProfile', () => {
    it('should allow employee to update their own profile fields', async () => {
      const res = await request(app)
        .put(`/users/${employeeId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          firstName: 'UpdatedJohn',
          phone: '+9999999999',
          linkedinLink: 'https://linkedin.com/in/johndoe',
          githubLink: 'https://github.com/johndoe'
        });

      expect(res.status).to.equal(200);
      expect(res.body.user.firstName).to.equal('UpdatedJohn');
      expect(res.body.user.phone).to.equal('+9999999999');
      expect(res.body.user.linkedinLink).to.equal('https://linkedin.com/in/johndoe');
      expect(res.body.user.githubLink).to.equal('https://github.com/johndoe');
    });

    it('should reject employee trying to update admin-only fields', async () => {
      const res = await request(app)
        .put(`/users/${employeeId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          salary: 50000,
          role: 'admin'
        });

      expect(res.status).to.equal(403);
      expect(res.body).to.have.property('error');
    });

    it('should allow admin to update all fields including salary and role', async () => {
      const res = await request(app)
        .put(`/users/${employeeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          salary: 60000,
          position: 'Senior Developer',
          workingHoursPerWeek: 40
        });

      expect(res.status).to.equal(200);
      expect(res.body.user.salary).to.equal(60000);
      expect(res.body.user.position).to.equal('Senior Developer');
      expect(res.body.user.workingHoursPerWeek).to.equal(40);
    });
  });

  describe('Bug Fix 3: Register Field Injection Prevention', () => {
    it('should not allow salary injection during registration', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'hacker@test.com',
          password: 'hackerpass',
          firstName: 'Hacker',
          lastName: 'User',
          middleName: 'Test',
          birthDate: '1995-01-01',
          phone: '+1234567893',
          programmingLanguage: 'Ruby',
          salary: 999999, // Attempting to inject salary
          role: 'employee'
        });

      expect(res.status).to.equal(201);
      
      // Verify the user was created without the injected salary
      const user = await db.User.findOne({ where: { email: 'hacker@test.com' } });
      expect(user.salary).to.not.equal(999999);
      expect(user.salary).to.equal(400); // Default value from model
    });
  });

  describe('Bug Fix 5: sortBy validation with position', () => {
    it('should allow sorting by position', async () => {
      const res = await request(app)
        .get('/users?sortBy=position&order=ASC')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('users');
    });

    it('should reject invalid sortBy parameter', async () => {
      const res = await request(app)
        .get('/users?sortBy=invalidField')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors');
    });
  });

  describe('Bug Fix 6: User existence check in updateProfile', () => {
    it('should return 404 when trying to update non-existent user', async () => {
      const res = await request(app)
        .put('/users/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Updated'
        });

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('error');
    });
  });

  describe('Bug Fix 7: Self-deletion prevention', () => {
    it('should prevent admin from deleting themselves', async () => {
      const res = await request(app)
        .delete(`/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });

    it('should allow admin to delete other employees', async () => {
      const res = await request(app)
        .delete(`/users/${employee2Id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message');
    });
  });

  describe('Bug Fix 8: Role handling in createEmployee', () => {
    it('should create employee with default role when role not provided', async () => {
      const res = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'newemployee@test.com',
          password: 'newpass123',
          firstName: 'New',
          lastName: 'Employee',
          middleName: 'Test',
          birthDate: '1992-01-01',
          phone: '+1234567894',
          programmingLanguage: 'Go'
        });

      expect(res.status).to.equal(201);
      
      const user = await db.User.findOne({ where: { email: 'newemployee@test.com' } });
      expect(user.role).to.equal('employee');
    });
  });

  describe('Bug Fix 9: Password hashing in updateProfile', () => {
    it('should hash password when admin updates user password', async () => {
      const newPassword = 'newSecurePassword123';
      
      const updateRes = await request(app)
        .put(`/users/${employeeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          password: newPassword
        });

      expect(updateRes.status).to.equal(200);

      // Verify password is hashed, not stored in plain text
      const user = await db.User.scope('withPassword').findByPk(employeeId);
      expect(user.password).to.not.equal(newPassword);
      
      // Verify the hashed password works for login
      const isValid = await bcrypt.compare(newPassword, user.password);
      expect(isValid).to.be.true;

      // Verify user can login with new password
      const loginRes = await request(app)
        .post('/login')
        .send({
          email: 'employee@test.com',
          password: newPassword
        });

      expect(loginRes.status).to.equal(200);
      expect(loginRes.body).to.have.property('token');
    });
  });
});
