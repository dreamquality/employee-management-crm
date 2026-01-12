// controllers/projectController.js
const db = require("../models");
const { Op } = require("sequelize");

// Get all projects (with optional filtering for active only)
exports.getProjects = async (req, res, next) => {
  try {
    // Validate and sanitize pagination parameters
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 100;
    
    // Ensure positive values and reasonable limits
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(100, limit));
    
    const offset = (page - 1) * limit;
    const { active, search } = req.query;

    const where = {};
    
    // Filter by active status if specified
    if (active !== undefined) {
      where.active = active === 'true';
    }

    // Search by name if provided (already sanitized by validation)
    if (search && search.trim()) {
      where.name = { [Op.iLike]: `%${search.trim()}%` };
    }

    const { count, rows } = await db.Project.findAndCountAll({
      where,
      limit,
      offset,
      order: [['name', 'ASC']],
    });

    // Hide wage field for non-admin users
    const projects = rows.map(project => {
      const projectData = project.toJSON();
      if (req.user.role !== 'admin') {
        delete projectData.wage;
      }
      return projectData;
    });

    res.json({
      projects,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (err) {
    next(err);
  }
};

// Get a single project by ID
exports.getProject = async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id);
    
    // Validate project ID
    if (!Number.isInteger(projectId) || projectId < 1) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    const project = await db.Project.findByPk(projectId, {
      include: [
        {
          model: db.User,
          as: 'employees',
          attributes: ['id', 'firstName', 'lastName', 'email', 'position'],
          through: { attributes: [] }, // Exclude junction table data
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const projectData = project.toJSON();
    
    // Hide wage field for non-admin users
    if (req.user.role !== 'admin') {
      delete projectData.wage;
    }

    res.json(projectData);
  } catch (err) {
    next(err);
  }
};

// Create a new project (admin only)
exports.createProject = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    if (req.user.role !== "admin") {
      await transaction.rollback();
      return res.status(403).json({ error: "Access denied" });
    }

    const { name, description, wage, active } = req.body;

    // Check if project with same name exists (with transaction lock)
    const existingProject = await db.Project.findOne({ 
      where: { name },
      lock: transaction.LOCK.UPDATE,
      transaction
    });
    
    if (existingProject) {
      await transaction.rollback();
      return res.status(400).json({ error: "Project with this name already exists" });
    }

    const newProject = await db.Project.create({
      name,
      description,
      wage: wage !== undefined ? wage : 0,
      active: active !== undefined ? active : true,
    }, { transaction });

    await transaction.commit();
    res.status(201).json({ message: "Project created successfully", project: newProject });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};

// Update a project (admin only)
exports.updateProject = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    if (req.user.role !== "admin") {
      await transaction.rollback();
      return res.status(403).json({ error: "Access denied" });
    }

    const projectId = parseInt(req.params.id);
    
    // Validate project ID
    if (!Number.isInteger(projectId) || projectId < 1) {
      await transaction.rollback();
      return res.status(400).json({ error: "Invalid project ID" });
    }

    const { name, description, wage, active } = req.body;

    const project = await db.Project.findByPk(projectId, {
      lock: transaction.LOCK.UPDATE,
      transaction
    });
    
    if (!project) {
      await transaction.rollback();
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if another project with same name exists (with transaction lock)
    if (name && name !== project.name) {
      const existingProject = await db.Project.findOne({
        where: { name, id: { [Op.ne]: projectId } },
        lock: transaction.LOCK.UPDATE,
        transaction
      });
      
      if (existingProject) {
        await transaction.rollback();
        return res.status(400).json({ error: "Project with this name already exists" });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (wage !== undefined) updateData.wage = wage;
    if (active !== undefined) updateData.active = active;

    await project.update(updateData, { transaction });
    await project.reload({ transaction });

    await transaction.commit();
    res.json({ message: "Project updated successfully", project });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};

// Delete a project (admin only)
exports.deleteProject = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const projectId = parseInt(req.params.id);
    
    // Validate project ID
    if (!Number.isInteger(projectId) || projectId < 1) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    const project = await db.Project.findByPk(projectId);
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    await project.destroy();

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Assign employees to a project (admin only)
exports.assignEmployees = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    if (req.user.role !== "admin") {
      await transaction.rollback();
      return res.status(403).json({ error: "Access denied" });
    }

    const projectId = parseInt(req.params.id);
    
    // Validate project ID
    if (!Number.isInteger(projectId) || projectId < 1) {
      await transaction.rollback();
      return res.status(400).json({ error: "Invalid project ID" });
    }

    const { employeeIds } = req.body;

    if (!Array.isArray(employeeIds)) {
      await transaction.rollback();
      return res.status(400).json({ error: "employeeIds must be an array" });
    }

    const project = await db.Project.findByPk(projectId, { transaction });
    
    if (!project) {
      await transaction.rollback();
      return res.status(404).json({ error: "Project not found" });
    }

    // Allow empty array to remove all assignments
    if (employeeIds.length === 0) {
      await project.setEmployees([], { transaction });
      await transaction.commit();
      return res.json({ message: "All employees removed from project" });
    }

    // Verify all employee IDs are valid integers
    const validIds = employeeIds.every(id => Number.isInteger(id) && id > 0);
    if (!validIds) {
      await transaction.rollback();
      return res.status(400).json({ error: "All employee IDs must be positive integers" });
    }

    // Verify all employees exist
    const employees = await db.User.findAll({
      where: { id: employeeIds },
      transaction
    });

    if (employees.length !== employeeIds.length) {
      await transaction.rollback();
      return res.status(400).json({ error: "Some employees not found" });
    }

    // Set the employees (this will replace existing associations)
    await project.setEmployees(employeeIds, { transaction });

    await transaction.commit();
    res.json({ message: "Employees assigned to project successfully" });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};

// Add a single employee to a project (admin only)
exports.addEmployee = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const projectId = parseInt(req.params.id);
    const { employeeId } = req.body;
    
    // Validate IDs
    if (!Number.isInteger(projectId) || projectId < 1) {
      return res.status(400).json({ error: "Invalid project ID" });
    }
    
    if (!Number.isInteger(employeeId) || employeeId < 1) {
      return res.status(400).json({ error: "Invalid employee ID" });
    }

    const project = await db.Project.findByPk(projectId);
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const employee = await db.User.findByPk(employeeId);
    
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    await project.addEmployee(employee);

    res.json({ message: "Employee added to project successfully" });
  } catch (err) {
    next(err);
  }
};

// Get employees assigned to a project
exports.getProjectEmployees = async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id);

    const project = await db.Project.findByPk(projectId, {
      include: [
        {
          model: db.User,
          as: 'employees',
          attributes: req.user.role === 'admin' 
            ? ['id', 'firstName', 'lastName', 'email', 'position', 'salary', 'programmingLanguage']
            : ['id', 'firstName', 'lastName', 'email', 'position', 'programmingLanguage'],
          through: { attributes: [] },
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ employees: project.employees });
  } catch (err) {
    next(err);
  }
};

// Remove an employee from a project (admin only)
exports.removeEmployee = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const projectId = parseInt(req.params.id);
    const employeeId = parseInt(req.params.employeeId);
    
    // Validate IDs
    if (!Number.isInteger(projectId) || projectId < 1) {
      return res.status(400).json({ error: "Invalid project ID" });
    }
    
    if (!Number.isInteger(employeeId) || employeeId < 1) {
      return res.status(400).json({ error: "Invalid employee ID" });
    }

    const project = await db.Project.findByPk(projectId);
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const employee = await db.User.findByPk(employeeId);
    
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    await project.removeEmployee(employee);

    res.json({ message: "Employee removed from project successfully" });
  } catch (err) {
    next(err);
  }
};
