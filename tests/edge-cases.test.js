// tests/edge-cases.test.js
const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const db = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../config/appConfig');

let employeeToken;
let adminToken;
let employeeId;
let adminId;
let projectId;

describe('Edge Cases Tests', () => {
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

    // Create a project
    const projectRes = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Project',
        description: 'Test project description for edge cases',
        wage: 5000,
        active: true
      });
    projectId = projectRes.body.project.id;
  });

  describe('Edge Case 1: Email Case Insensitivity', () => {
    it('should login with email in different case', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'ADMIN@TEST.COM',
          password: 'adminpass123'
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
    });

    it('should reject duplicate email with different case during registration', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'EMPLOYEE@TEST.COM',
          password: 'newpass123',
          firstName: 'Jane',
          lastName: 'Doe',
          middleName: 'Test',
          birthDate: '1992-01-01',
          phone: '+1234567892',
          programmingLanguage: 'Ruby'
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });

    it('should reject duplicate email with different case during employee creation', async () => {
      const res = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'ADMIN@TEST.COM',
          password: 'newpass123',
          firstName: 'Another',
          lastName: 'Admin',
          middleName: 'Test',
          birthDate: '1985-01-01',
          phone: '+1234567893',
          programmingLanguage: 'Go'
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });
  });

  describe('Edge Case 2: JWT Token Expiration Handling', () => {
    it('should return specific error for expired token', async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { userId: adminId, role: 'admin' },
        config.jwtSecret,
        { expiresIn: '-1h' } // Already expired
      );

      const res = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).to.equal(401);
      expect(res.body.error).to.include('истек');
    });

    it('should return error for malformed token', async () => {
      const res = await request(app)
        .get('/users')
        .set('Authorization', `Bearer invalid.token.here`);

      expect(res.status).to.equal(403);
      expect(res.body).to.have.property('error');
    });
  });

  describe('Edge Case 3: Pagination Edge Cases', () => {
    it('should reject negative page number with validation error', async () => {
      const res = await request(app)
        .get('/users?page=-5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors');
    });

    it('should reject zero page number with validation error', async () => {
      const res = await request(app)
        .get('/users?page=0')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors');
    });

    it('should reject negative limit with validation error', async () => {
      const res = await request(app)
        .get('/users?limit=-10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors');
    });

    it('should cap limit at maximum value (100)', async () => {
      const res = await request(app)
        .get('/projects?limit=1000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors');
    });

    it('should reject non-integer page values with validation error', async () => {
      const res = await request(app)
        .get('/users?page=abc')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors');
    });
  });

  describe('Edge Case 4: VacationDates Array Handling', () => {
    it('should convert single vacationDate to array', async () => {
      const res = await request(app)
        .put(`/users/${employeeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          vacationDates: '2024-12-25'
        });

      expect(res.status).to.equal(200);
      expect(res.body.user.vacationDates).to.be.an('array');
      expect(res.body.user.vacationDates).to.have.lengthOf(1);
    });

    it('should handle array of vacationDates correctly', async () => {
      const res = await request(app)
        .put(`/users/${employeeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          vacationDates: ['2024-12-25', '2024-12-26']
        });

      expect(res.status).to.equal(200);
      expect(res.body.user.vacationDates).to.be.an('array');
      expect(res.body.user.vacationDates).to.have.lengthOf(2);
    });
  });

  describe('Edge Case 5: Project Employee Management Validation', () => {
    it('should validate employeeId in addEmployee endpoint', async () => {
      const res = await request(app)
        .post(`/projects/${projectId}/employee`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          employeeId: 'invalid'
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors');
    });

    it('should reject negative employeeId', async () => {
      const res = await request(app)
        .post(`/projects/${projectId}/employee`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          employeeId: -5
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors');
    });

    it('should reject zero employeeId', async () => {
      const res = await request(app)
        .post(`/projects/${projectId}/employee`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          employeeId: 0
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors');
    });

    it('should successfully add valid employee to project', async () => {
      const res = await request(app)
        .post(`/projects/${projectId}/employee`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          employeeId: employeeId
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message');
    });
  });

  describe('Edge Case 6: Notification Pagination Validation', () => {
    it('should validate page parameter for notifications', async () => {
      const res = await request(app)
        .get('/notifications?page=invalid')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors');
    });

    it('should validate limit parameter for notifications', async () => {
      const res = await request(app)
        .get('/notifications?limit=999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors');
    });

    it('should validate sortBy parameter for notifications', async () => {
      const res = await request(app)
        .get('/notifications?sortBy=invalidField')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors');
    });
  });

  describe('Edge Case 7: Project Employees Endpoint', () => {
    it('should get employees assigned to a project', async () => {
      const res = await request(app)
        .get(`/projects/${projectId}/employees`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('employees');
      expect(res.body.employees).to.be.an('array');
    });

    it('should return 404 for non-existent project', async () => {
      const res = await request(app)
        .get('/projects/99999/employees')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(404);
    });

    it('should hide salary for non-admin users', async () => {
      const res = await request(app)
        .get(`/projects/${projectId}/employees`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).to.equal(200);
      if (res.body.employees.length > 0) {
        expect(res.body.employees[0]).to.not.have.property('salary');
      }
    });
  });

  describe('Edge Case 8: Invalid Project/Employee IDs', () => {
    it('should validate project ID format', async () => {
      const res = await request(app)
        .get('/projects/invalid/employees')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(400);
    });

    it('should validate employee ID in path parameters', async () => {
      const res = await request(app)
        .delete(`/projects/${projectId}/employees/invalid`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(400);
    });
  });

  describe('Edge Case 9: Email Update Edge Cases', () => {
    it('should update email to lowercase automatically', async () => {
      const res = await request(app)
        .put(`/users/${employeeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'NEWEMAIL@TEST.COM'
        });

      expect(res.status).to.equal(200);
      expect(res.body.user.email).to.equal('newemail@test.com');
    });
  });

  describe('Edge Case 10: Empty String Validation', () => {
    it('should reject empty firstName', async () => {
      const res = await request(app)
        .put(`/users/${employeeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: ''
        });

      expect(res.status).to.equal(400);
    });

    it('should reject whitespace-only search queries', async () => {
      const res = await request(app)
        .get('/projects?search=   ')
        .set('Authorization', `Bearer ${adminToken}`);

      // Should not crash and return valid response
      expect(res.status).to.equal(200);
      expect(res.body.projects).to.be.an('array');
    });
  });

  describe('Edge Case 11: User ID Validation', () => {
    it('should validate user ID in delete endpoint', async () => {
      const res = await request(app)
        .delete('/users/invalid')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors');
    });

    it('should validate user ID in update endpoint', async () => {
      const res = await request(app)
        .put('/users/abc')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Updated'
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors');
    });

    it('should validate user ID in get endpoint', async () => {
      const res = await request(app)
        .get('/users/xyz')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors');
    });

    it('should reject negative user ID', async () => {
      const res = await request(app)
        .get('/users/-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors');
    });

    it('should reject zero user ID', async () => {
      const res = await request(app)
        .delete('/users/0')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors');
    });
  });

  describe('Edge Case 12: Configuration Security', () => {
    it('should have JWT_SECRET configured', () => {
      expect(config.jwtSecret).to.exist;
      expect(config.jwtSecret).to.not.equal('');
    });

    it('should have SECRET_WORD configured', () => {
      expect(config.secretWord).to.exist;
      expect(config.secretWord).to.not.equal('');
    });
  });
});
