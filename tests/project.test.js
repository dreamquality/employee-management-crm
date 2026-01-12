// tests/project.test.js
const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const db = require('../models');

let employeeToken;
let adminToken;
let testProjectId;

describe('Project API', () => {
  before(async () => {
    // Drop and recreate schema to ensure clean state
    await db.sequelize.query('DROP SCHEMA IF EXISTS public CASCADE;');
    await db.sequelize.query('CREATE SCHEMA public;');
    await db.sequelize.sync({ force: true });

    // Create admin and get token
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

    // Create employee and get token
    await request(app)
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
        country: 'USA',
        englishLevel: 'Intermediate',
        registrationDate: '2021-01-01'
      });

    const employeeRes = await request(app)
      .post('/login')
      .send({
        email: 'employee@example.com',
        password: 'password123'
      });

    employeeToken = employeeRes.body.token;
  });

  describe('POST /projects', () => {
    it('should create a project as admin', async () => {
      const res = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Project',
          description: 'This is a test project description',
          wage: 5000,
          active: true
        });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('project');
      expect(res.body.project).to.have.property('id');
      expect(res.body.project.name).to.equal('Test Project');
      testProjectId = res.body.project.id;
    });

    it('should fail to create project without authentication', async () => {
      const res = await request(app)
        .post('/projects')
        .send({
          name: 'Unauthenticated Project',
          description: 'This should fail'
        });

      expect(res.status).to.equal(401);
    });

    it('should fail to create project as employee', async () => {
      const res = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          name: 'Employee Project',
          description: 'This should fail because employee is not admin'
        });

      expect(res.status).to.equal(403);
    });

    it('should fail to create project with invalid data', async () => {
      const res = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'A', // Too short
          description: 'Short' // Too short
        });

      expect(res.status).to.equal(400);
    });

    it('should fail to create duplicate project name', async () => {
      const res = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Project', // Duplicate
          description: 'This is a duplicate project name'
        });

      expect(res.status).to.equal(400);
    });
  });

  describe('GET /projects', () => {
    it('should get all projects as admin', async () => {
      const res = await request(app)
        .get('/projects')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('projects');
      expect(res.body.projects).to.be.an('array');
      expect(res.body.projects.length).to.be.greaterThan(0);
      expect(res.body.projects[0]).to.have.property('wage'); // Admin can see wage
    });

    it('should get all projects as employee without wage field', async () => {
      const res = await request(app)
        .get('/projects')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('projects');
      expect(res.body.projects).to.be.an('array');
      expect(res.body.projects.length).to.be.greaterThan(0);
      expect(res.body.projects[0]).to.not.have.property('wage'); // Employee cannot see wage
    });

    it('should filter active projects', async () => {
      const res = await request(app)
        .get('/projects?active=true')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.projects).to.be.an('array');
      if (res.body.projects.length > 0) {
        expect(res.body.projects.every(p => p.active === true)).to.be.true;
      }
    });

    it('should search projects by name', async () => {
      const res = await request(app)
        .get('/projects?search=Test')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.projects.length).to.be.greaterThan(0);
    });

    it('should paginate projects', async () => {
      const res = await request(app)
        .get('/projects?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.projects.length).to.equal(1);
      expect(res.body).to.have.property('totalPages');
    });
  });

  describe('GET /projects/:id', () => {
    it('should get a single project as admin', async () => {
      const res = await request(app)
        .get(`/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('id');
      expect(res.body.id).to.equal(testProjectId);
      expect(res.body).to.have.property('wage'); // Admin can see wage
    });

    it('should get a single project as employee without wage', async () => {
      const res = await request(app)
        .get(`/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('id');
      expect(res.body).to.not.have.property('wage'); // Employee cannot see wage
    });

    it('should return 404 for non-existent project', async () => {
      const res = await request(app)
        .get('/projects/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(404);
    });

    it('should return 400 for invalid project ID', async () => {
      const res = await request(app)
        .get('/projects/invalid')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(400);
    });
  });

  describe('PUT /projects/:id', () => {
    it('should update a project as admin', async () => {
      const res = await request(app)
        .put(`/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Test Project',
          description: 'This is an updated description',
          wage: 6000
        });

      expect(res.status).to.equal(200);
      expect(res.body.project.name).to.equal('Updated Test Project');
      expect(res.body.project.wage).to.equal(6000);
    });

    it('should fail to update project as employee', async () => {
      const res = await request(app)
        .put(`/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          name: 'Should Fail'
        });

      expect(res.status).to.equal(403);
    });

    it('should fail to update with invalid data', async () => {
      const res = await request(app)
        .put(`/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Short' // Too short
        });

      expect(res.status).to.equal(400);
    });
  });

  describe('POST /projects/:id/employees', () => {
    let employeeId;

    before(async () => {
      const userRes = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      const employee = userRes.body.users.find(u => u.role === 'employee');
      if (!employee) {
        throw new Error('No employee found for project assignment tests');
      }
      employeeId = employee.id;
    });

    it('should assign employees to project as admin', async () => {
      const res = await request(app)
        .post(`/projects/${testProjectId}/employees`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          employeeIds: [employeeId]
        });

      expect(res.status).to.equal(200);
    });

    it('should allow empty array to remove all employees', async () => {
      const res = await request(app)
        .post(`/projects/${testProjectId}/employees`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          employeeIds: []
        });

      expect(res.status).to.equal(200);
    });

    it('should fail with invalid employee IDs', async () => {
      const res = await request(app)
        .post(`/projects/${testProjectId}/employees`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          employeeIds: [99999]
        });

      expect(res.status).to.equal(400);
    });

    it('should fail as employee', async () => {
      const res = await request(app)
        .post(`/projects/${testProjectId}/employees`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          employeeIds: [employeeId]
        });

      expect(res.status).to.equal(403);
    });
  });

  describe('DELETE /projects/:id', () => {
    it('should delete a project as admin', async () => {
      const res = await request(app)
        .delete(`/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
    });

    it('should return 404 when deleting non-existent project', async () => {
      const res = await request(app)
        .delete(`/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(404);
    });

    it('should fail to delete as employee', async () => {
      // Create a new project first
      const createRes = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'To Delete Project',
          description: 'This project will be used for delete test'
        });

      const projectId = createRes.body.project.id;

      const res = await request(app)
        .delete(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).to.equal(403);
    });
  });
});
