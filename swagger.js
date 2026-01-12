// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const publicUrl = process.env.PUBLIC_URL || 'http://localhost:3000';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Employee Management API',
      version: '1.0.0',
      description: 'API для управления информацией о сотрудниках',
    },
    servers: [
      {
        url: `${publicUrl}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Register: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName', 'middleName', 'birthDate', 'phone', 'programmingLanguage'],
          properties: {
            email: { 
              type: 'string', 
              format: 'email',
              description: 'Email address (must be unique)'
            },
            password: { 
              type: 'string', 
              format: 'password',
              minLength: 6,
              maxLength: 20,
              description: 'Password (6-20 characters, will be hashed)'
            },
            firstName: { 
              type: 'string',
              minLength: 2,
              maxLength: 40,
              description: 'First name (2-40 characters)'
            },
            lastName: { 
              type: 'string',
              minLength: 2,
              maxLength: 40,
              description: 'Last name (2-40 characters)'
            },
            middleName: { 
              type: 'string',
              minLength: 2,
              maxLength: 40,
              description: 'Middle name (2-40 characters)'
            },
            birthDate: { 
              type: 'string', 
              format: 'date',
              description: 'Birth date (YYYY-MM-DD)'
            },
            phone: { 
              type: 'string',
              maxLength: 50,
              description: 'Phone number'
            },
            programmingLanguage: { 
              type: 'string',
              maxLength: 100,
              description: 'Primary programming language'
            },
            role: { 
              type: 'string', 
              enum: ['employee', 'admin'],
              description: 'User role (defaults to employee if not provided)'
            },
            secretWord: { 
              type: 'string', 
              description: 'Required ONLY for admin registration - must match SECRET_WORD environment variable'
            },
          },
          description: 'Note: Only explicitly allowed fields are accepted. Admin-only fields (salary, position, mentorName, etc.) cannot be set during registration for security reasons.'
        },
        Login: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            middleName: { type: 'string' },
            birthDate: { type: 'string', format: 'date' },
            phone: { type: 'string' },
            email: { type: 'string', format: 'email' },
            programmingLanguage: { type: 'string' },
            country: { type: 'string', nullable: true },
            bankCard: { type: 'string', nullable: true },
            registrationDate: { type: 'string', format: 'date-time', nullable: true },
            lastLoginDate: { type: 'string', format: 'date-time', nullable: true },
            salary: { type: 'integer' },
            lastSalaryIncreaseDate: { type: 'string', format: 'date-time' },
            position: { type: 'string', nullable: true },
            mentorName: { type: 'string', nullable: true },
            vacationDates: { 
              type: 'array',
              items: { type: 'string', format: 'date' },
              nullable: true 
            },
            githubLink: { type: 'string', format: 'uri', nullable: true },
            linkedinLink: { type: 'string', format: 'uri', nullable: true },
            adminNote: { type: 'string', nullable: true },
            englishLevel: { type: 'string', nullable: true },
            projects: {
              type: 'array',
              items: { $ref: '#/components/schemas/Project' },
              description: 'List of projects assigned to the user'
            },
            workingHoursPerWeek: { type: 'integer', nullable: true },
            role: { type: 'string', enum: ['employee', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          description: 'User object returned by API. Password field is never included for security reasons.'
        },
        UserUpdate: {
          type: 'object',
          properties: {
            // Employee-allowed fields (can be updated by the user themselves)
            firstName: { 
              type: 'string',
              minLength: 2,
              maxLength: 40,
              description: 'First name - employees can update their own'
            },
            lastName: { 
              type: 'string',
              minLength: 2,
              maxLength: 40,
              description: 'Last name - employees can update their own'
            },
            middleName: { 
              type: 'string',
              minLength: 2,
              maxLength: 40,
              description: 'Middle name - employees can update their own'
            },
            birthDate: { 
              type: 'string', 
              format: 'date',
              description: 'Birth date - employees can update their own'
            },
            phone: { 
              type: 'string',
              maxLength: 50,
              description: 'Phone number - employees can update their own'
            },
            email: { 
              type: 'string', 
              format: 'email',
              description: 'Email address (must be unique) - employees can update their own'
            },
            programmingLanguage: { 
              type: 'string',
              maxLength: 100,
              description: 'Programming language - employees can update their own'
            },
            country: { 
              type: 'string', 
              nullable: true,
              description: 'Country - employees can update their own'
            },
            bankCard: { 
              type: 'string', 
              nullable: true,
              description: 'Bank card info - employees can update their own'
            },
            linkedinLink: { 
              type: 'string', 
              format: 'uri', 
              nullable: true,
              description: 'LinkedIn profile URL - employees can update their own'
            },
            githubLink: { 
              type: 'string', 
              format: 'uri', 
              nullable: true,
              description: 'GitHub profile URL - employees can update their own'
            },
            // Admin-only fields (can only be updated by administrators)
            hireDate: { 
              type: 'string', 
              format: 'date',
              nullable: true,
              description: 'Hire date - ADMIN ONLY'
            },
            adminNote: { 
              type: 'string', 
              nullable: true,
              description: 'Admin notes - ADMIN ONLY'
            },
            projectIds: { 
              type: 'array',
              items: { type: 'integer' },
              nullable: true,
              description: 'Array of project IDs to assign to the user - ADMIN ONLY'
            },
            englishLevel: { 
              type: 'string', 
              nullable: true,
              description: 'English proficiency level - ADMIN ONLY'
            },
            vacationDates: { 
              type: 'array',
              items: { type: 'string', format: 'date' },
              nullable: true,
              description: 'Vacation dates - ADMIN ONLY'
            },
            mentorName: { 
              type: 'string', 
              nullable: true,
              description: 'Assigned mentor - ADMIN ONLY'
            },
            position: { 
              type: 'string', 
              nullable: true,
              description: 'Job position - ADMIN ONLY'
            },
            salary: { 
              type: 'number',
              nullable: true,
              description: 'Salary amount - ADMIN ONLY'
            },
            role: { 
              type: 'string', 
              enum: ['employee', 'admin'],
              description: 'User role - ADMIN ONLY'
            },
            password: { 
              type: 'string', 
              format: 'password',
              minLength: 6,
              maxLength: 20,
              description: 'New password (will be automatically hashed) - ADMIN ONLY'
            },
            workingHoursPerWeek: { 
              type: 'integer', 
              minimum: 0,
              maximum: 100,
              nullable: true,
              description: 'Working hours per week - ADMIN ONLY'
            },
          },
          description: 'Employees can update their own basic profile fields. Admin-only fields can only be updated by administrators. Attempting to update admin-only fields as an employee will result in a 403 error.'
        },
        UserCreate: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: { 
              type: 'string', 
              format: 'email',
              description: 'Email address (must be unique)'
            },
            password: { 
              type: 'string', 
              format: 'password',
              minLength: 6,
              maxLength: 20,
              description: 'Password (6-20 characters, will be hashed)'
            },
            firstName: { 
              type: 'string',
              minLength: 2,
              maxLength: 40,
              description: 'First name (2-40 characters)'
            },
            lastName: { 
              type: 'string',
              minLength: 2,
              maxLength: 40,
              description: 'Last name (2-40 characters)'
            },
            middleName: { 
              type: 'string',
              minLength: 2,
              maxLength: 40,
              nullable: true,
              description: 'Middle name (2-40 characters, optional)'
            },
            birthDate: { 
              type: 'string', 
              format: 'date',
              nullable: true,
              description: 'Birth date (YYYY-MM-DD, optional)'
            },
            phone: { 
              type: 'string',
              maxLength: 50,
              nullable: true,
              description: 'Phone number (optional)'
            },
            programmingLanguage: { 
              type: 'string',
              maxLength: 100,
              nullable: true,
              description: 'Primary programming language (optional)'
            },
            country: { 
              type: 'string', 
              nullable: true,
              description: 'Country (optional)'
            },
            bankCard: { 
              type: 'string', 
              nullable: true,
              description: 'Bank card info (optional)'
            },
            linkedinLink: { 
              type: 'string', 
              format: 'uri', 
              nullable: true,
              description: 'LinkedIn profile URL (optional)'
            },
            githubLink: { 
              type: 'string', 
              format: 'uri', 
              nullable: true,
              description: 'GitHub profile URL (optional)'
            },
            hireDate: { 
              type: 'string', 
              format: 'date',
              nullable: true,
              description: 'Hire date (optional)'
            },
            adminNote: { 
              type: 'string', 
              nullable: true,
              description: 'Admin notes (optional)'
            },
            projectIds: { 
              type: 'array',
              items: { type: 'integer' },
              nullable: true,
              description: 'Array of project IDs to assign to the user (optional)'
            },
            englishLevel: { 
              type: 'string', 
              nullable: true,
              description: 'English proficiency level (optional)'
            },
            vacationDates: { 
              type: 'array',
              items: { type: 'string', format: 'date' },
              nullable: true,
              description: 'Vacation dates (optional)'
            },
            mentorName: { 
              type: 'string', 
              nullable: true,
              description: 'Assigned mentor (optional)'
            },
            position: { 
              type: 'string', 
              nullable: true,
              description: 'Job position (optional)'
            },
            salary: { 
              type: 'number',
              nullable: true,
              description: 'Salary amount (optional)'
            },
            role: { 
              type: 'string', 
              enum: ['employee', 'admin'],
              description: 'User role (defaults to employee if not provided)'
            },
            workingHoursPerWeek: { 
              type: 'integer', 
              minimum: 0,
              maximum: 100,
              nullable: true,
              description: 'Working hours per week (0-100, optional)'
            },
          },
          description: 'Admin-only endpoint to create new employees. Role defaults to "employee" if not specified. A notification is created for audit trail.'
        },
        Notification: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор уведомления',
            },
            message: {
              type: 'string',
              description: 'Текст уведомления',
            },
            userId: {
              type: 'integer',
              description: 'ID пользователя, которому предназначено уведомление',
            },
            relatedUserId: {
              type: 'integer',
              description: 'ID пользователя, про которого уведомление',
            },
            type: {
              type: 'string',
              enum: ['birthday_reminder', 'salary_increase_reminder', 'welcome', 'employee_created', 'user_update'],
              description: 'Тип уведомления: birthday_reminder, salary_increase_reminder, welcome, employee_created (admin created employee), user_update (employee updated profile)',
            },
            eventDate: {
              type: 'string',
              format: 'date',
              description: 'Дата события, связанного с уведомлением',
            },
            isRead: {
              type: 'boolean',
              description: 'Статус прочтения уведомления',
              default: false,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата и время создания уведомления',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата и время последнего обновления уведомления',
            },
          },
        },
        Project: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique project identifier',
            },
            name: {
              type: 'string',
              description: 'Project name',
            },
            description: {
              type: 'string',
              description: 'Project description',
            },
            wage: {
              type: 'number',
              description: 'Project wage/rate (visible to admins only)',
              nullable: true,
            },
            active: {
              type: 'boolean',
              description: 'Whether the project is currently active',
              default: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Project creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Project last update date',
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'], // Путь к файлам с аннотациями Swagger
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
