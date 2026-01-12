// controllers/userController.js
const db = require("../models");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

// Get current authenticated user's profile
exports.getCurrentUserProfile = async (req, res) => {
  try {
    const includeOptions = [];
    
    // Only include projects if the model exists
    if (db.Project) {
      includeOptions.push({
        model: db.Project,
        as: 'projects',
        attributes: req.user.role === 'admin' 
          ? ['id', 'name', 'description', 'wage', 'active']
          : ['id', 'name', 'description', 'active'],
        through: { attributes: [] },
      });
    }
    
    const user = await db.User.findByPk(req.user.userId, {
      include: includeOptions,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Получить пользователя по ID
exports.getEmploye = async (req, res) => {
  try {
    const includeOptions = [];
    
    // Only include projects if the model exists
    if (db.Project) {
      includeOptions.push({
        model: db.Project,
        as: 'projects',
        attributes: req.user.role === 'admin' 
          ? ['id', 'name', 'description', 'wage', 'active']
          : ['id', 'name', 'description', 'active'],
        through: { attributes: [] },
      });
    }
    
    const user = await db.User.findByPk(req.params.id, {
      include: includeOptions,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getEmployees = async (req, res, next) => {
  try {
    // Получение параметров запроса
    // Validate and sanitize pagination parameters
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    
    // Ensure positive values and reasonable limits
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(100, limit));
    
    const { firstName, lastName, sortBy, order } = req.query;

    const offset = (page - 1) * limit;

    // Фильтрация по имени и фамилии
    const where = {};
    if (firstName) {
      where.firstName = { [Op.iLike]: `%${firstName}%` };
    }
    if (lastName) {
      where.lastName = { [Op.iLike]: `%${lastName}%` };
    }

    // Сортировка
    const validSortFields = [
      "registrationDate",
      "programmingLanguage",
      "country",
      "mentorName",
      "englishLevel",
      "position",
    ];
    const sortField = validSortFields.includes(sortBy)
      ? sortBy
      : "registrationDate";
    const sortOrder = order === "DESC" ? "DESC" : "ASC";

    // Выбор полей для отображения
    const attributes =
      req.user.role === "admin"
        ? undefined
        : [
            "id",
            "firstName",
            "lastName",
            "middleName",
            "birthDate",
            "phone",
            "email",
            "programmingLanguage",
            "position",
            "registrationDate",
            "country",
            "mentorName",
            "englishLevel",
            // Добавьте другие поля, которые сотрудник может видеть
          ];

    // Build include options
    const includeOptions = [];
    if (db.Project) {
      includeOptions.push({
        model: db.Project,
        as: 'projects',
        attributes: req.user.role === 'admin' 
          ? ['id', 'name', 'description', 'wage', 'active']
          : ['id', 'name', 'description', 'active'],
        through: { attributes: [] },
      });
    }

    // Получение данных из базы данных
    const { count, rows } = await db.User.findAndCountAll({
      where,
      attributes,
      include: includeOptions,
      order: [[sortField, sortOrder]],
      limit,
      offset,
    });

    res.json({
      users: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Проверяем, что пользователь имеет права для редактирования (если это не администратор, он может редактировать только себя)
    if (req.user.userId !== parseInt(userId) && req.user.role !== "admin") {
      return res.status(403).json({ error: "Доступ запрещен" });
    }

    // Поля, которые могут быть обновлены обычными сотрудниками
    const employeeAllowedFields = [
      "firstName",
      "lastName",
      "middleName",
      "birthDate",
      "phone",
      "email",
      "programmingLanguage",
      "country",
      "bankCard",
      "linkedinLink",
      "githubLink",
    ];

    // Поля, которые могут быть обновлены только администратором
    const adminOnlyFields = [
      "hireDate",
      "adminNote",
      "englishLevel",
      "vacationDates",
      "mentorName",
      "position",
      "salary",
      "role",
      "password",
      "workingHoursPerWeek",
    ];

    const updateData = {};

    // Если пользователь - администратор, разрешаем обновление всех полей
    if (req.user.role === "admin") {
      const allFields = [...adminOnlyFields, ...employeeAllowedFields];
      allFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
    } else {
      // Для обычных сотрудников разрешаем только определенные поля
      employeeAllowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      // Проверяем, что сотрудник не пытается обновить запрещенные поля
      for (const field of adminOnlyFields) {
        if (req.body[field] !== undefined) {
          return res.status(403).json({
            error: `Только администратор может обновлять поле ${field}`,
          });
        }
      }
    }

    // Проверка на наличие другого пользователя с таким же email
    if (updateData.email) {
      // Normalize email to lowercase
      updateData.email = updateData.email.toLowerCase();
      const existingUser = await db.User.findOne({
        where: { email: updateData.email, id: { [Op.ne]: userId } },
      });

      if (existingUser) {
        return res
          .status(400)
          .json({ error: "Пользователь с таким email уже существует" });
      }
    }

    if (updateData.vacationDates) {
      if (!Array.isArray(updateData.vacationDates)) {
        updateData.vacationDates = [updateData.vacationDates];
      }
    }

    // Хеширование пароля, если он обновляется
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Обновление данных пользователя
    const user = await db.User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Start transaction for project assignment
    const transaction = await db.sequelize.transaction();
    
    try {
      await user.update(updateData, { transaction });

      // Handle project assignments (admin only)
      if (req.body.projectIds !== undefined && req.user.role === "admin") {
        if (!Array.isArray(req.body.projectIds)) {
          await transaction.rollback();
          return res.status(400).json({ error: "projectIds must be an array" });
        }

        // Only process project assignments if Project model exists
        if (db.Project) {
          // Validate all project IDs are positive integers
          const validIds = req.body.projectIds.every(id => Number.isInteger(id) && id > 0);
          if (!validIds) {
            await transaction.rollback();
            return res.status(400).json({ error: "All project IDs must be positive integers" });
          }

          // Verify all projects exist
          if (req.body.projectIds.length > 0) {
            const projects = await db.Project.findAll({
              where: { id: req.body.projectIds },
              transaction
            });

            if (projects.length !== req.body.projectIds.length) {
              await transaction.rollback();
              return res.status(400).json({ error: "Some projects not found" });
            }
          }

          await user.setProjects(req.body.projectIds, { transaction });
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    // Reload user to get fresh data (password will be excluded by default scope)
    const includeOptions = [];
    
    // Only include projects if the model exists (to avoid test failures)
    if (db.Project) {
      includeOptions.push({
        model: db.Project,
        as: 'projects',
        attributes: req.user.role === 'admin' 
          ? ['id', 'name', 'description', 'wage', 'active']
          : ['id', 'name', 'description', 'active'],
        through: { attributes: [] },
      });
    }
    
    await user.reload({
      include: includeOptions,
    });

    // Создаем уведомление для администратора, если данные обновляет не администратор
    if (req.user.role !== "admin") {
      const admins = await db.User.findAll({ where: { role: "admin" } });
      for (const admin of admins) {
        await db.Notification.create({
          message: `Employee ${user.firstName} ${
            user.lastName
          } updated their data: ${Object.keys(updateData).join(", ")}`,
          userId: admin.id, // Администратор — получатель уведомления
          relatedUserId: user.id, // Сотрудник — инициатор уведомления
          type: "user_update",
          eventDate: new Date(), // Текущая дата
        });
      }
    }

    res.json({ message: "Data updated successfully", user });
  } catch (err) {
    next(err);
  }
};

// Метод для администратора по созданию сотрудника
exports.createEmployee = async (req, res, next) => {
  try {
    // Проверка роли пользователя
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Доступ запрещен" });
    }

    // Извлечение данных из тела запроса
    const {
      email,
      password,
      firstName,
      lastName,
      middleName,
      birthDate,
      phone,
      programmingLanguage,
      country,
      bankCard,
      linkedinLink,
      hireDate,
      adminNote,
      englishLevel,
      githubLink,
      vacationDates,
      mentorName,
      position,
      salary,
      role,
      workingHoursPerWeek,
      projectIds,
      // Добавьте другие поля по необходимости
    } = req.body;

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();

    // Проверка на существование пользователя с таким email
    const existingUser = await db.User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Пользователь с таким email уже существует" });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Ensure vacationDates is always an array if provided
    let processedVacationDates = vacationDates;
    if (vacationDates && !Array.isArray(vacationDates)) {
      processedVacationDates = [vacationDates];
    }

    // Создание нового сотрудника
    const newUser = await db.User.create({
      email: normalizedEmail,
      password: hashedPassword,
      firstName,
      lastName,
      middleName,
      birthDate,
      phone,
      programmingLanguage,
      country,
      bankCard,
      linkedinLink,
      hireDate,
      adminNote,
      englishLevel,
      githubLink,
      vacationDates: processedVacationDates,
      mentorName,
      position,
      salary,
      role: role || 'employee',
      workingHoursPerWeek,
      // Добавьте другие поля по необходимости
    });

    // Assign projects if provided and Project model exists
    if (db.Project && projectIds && Array.isArray(projectIds) && projectIds.length > 0) {
      await newUser.setProjects(projectIds);
    }

    // Reload to apply default scope (exclude password) and include projects
    const includeOptions = [];
    if (db.Project) {
      includeOptions.push({
        model: db.Project,
        as: 'projects',
        attributes: ['id', 'name', 'description', 'wage', 'active'],
        through: { attributes: [] },
      });
    }
    
    await newUser.reload({
      include: includeOptions,
    });

    // Создаем уведомление для администратора о создании нового сотрудника
    await db.Notification.create({
      message: `Administrator created new employee: ${newUser.firstName} ${newUser.lastName}`,
      userId: req.user.userId, // Администратор — инициатор уведомления
      relatedUserId: newUser.id, // Новый сотрудник — связанный пользователь
      type: "employee_created",
      eventDate: new Date(), // Текущая дата
    });

    res
      .status(201)
      .json({ message: "Сотрудник успешно создан", user: newUser });
  } catch (err) {
    next(err);
  }
};

// Метод для администратора по удалению сотрудника
exports.deleteEmployee = async (req, res, next) => {
  try {
    // Проверка роли пользователя
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Доступ запрещен" });
    }

    const userId = req.params.id;

    // Предотвращение удаления самого себя
    if (req.user.userId === parseInt(userId)) {
      return res.status(400).json({ error: "Нельзя удалить самого себя" });
    }

    // Проверка, что пользователь существует и является сотрудником
    const user = await db.User.findOne({
      where: { id: userId, role: "employee" },
    });
    if (!user) {
      return res.status(404).json({ error: "Сотрудник не найден" });
    }

    // Удаление сотрудника

    await user.destroy();

    // Не надо создавать уведомление для администратора о удалении сотрудника

    res.json({ message: "Сотрудник успешно удален" });
  } catch (err) {
    next(err);
  }
};
