const db = require('../models');
const schedule = require('node-schedule');
const logger = require('../utils/logger'); // Импортируйте вашу систему логирования

// Количество повторных попыток
const RETRIES = 3;

// Функция для нормализации даты до 00:00:00
function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Функция для удаления старых прочитанных уведомлений
async function deleteOldReadNotifications() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  try {
    const deletedCount = await db.Notification.destroy({
      where: {
        isRead: true,
        eventDate: {
          [db.Sequelize.Op.lte]: sixMonthsAgo,
        },
      },
    });
    logger.info(`Удалено ${deletedCount} старых прочитанных уведомлений`);
  } catch (error) {
    logger.error('Ошибка при удалении старых прочитанных уведомлений', { error });
  }
}

// Запланированная проверка
exports.scheduleNotifications = () => {
  // Ежедневная проверка
  schedule.scheduleJob('0 0 * * *', async () => { // Запуск каждый день в полночь
    const today = new Date();
    logger.info('Запуск ежедневной проверки уведомлений');

    try {
      // Получаем всех администраторов
      const admins = await db.User.findAll({ where: { role: 'admin' } });
      logger.info('Администраторы загружены', { count: admins.length });

      // Получаем всех пользователей (включая администраторов и сотрудников)
      const users = await db.User.findAll({ where: { role: ['employee', 'admin'] } });
      logger.info('Пользователи загружены', { count: users.length });

      for (const user of users) {
        // Проверка дня рождения
        await checkBirthdayNotifications(user, admins, today);

        // Проверка повышения зарплаты
        await checkSalaryIncreaseNotifications(user, admins, today);
      }

      // Удаление старых прочитанных уведомлений
      await deleteOldReadNotifications();
    } catch (error) {
      logger.error('Ошибка при выполнении проверки уведомлений', { error });
    }
  });
};

// Функция для проверки и отправки уведомлений о дне рождения
async function checkBirthdayNotifications(user, admins, today) {
  const birthDate = new Date(user.birthDate);
  const currentYear = today.getFullYear();

  // День рождения в текущем году
  let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());

  // Если день рождения уже прошел в этом году, берем следующий год
  if (nextBirthday < today) {
    nextBirthday.setFullYear(currentYear + 1);
  }

  // Нормализация даты сегодняшнего дня и следующего дня рождения
  const normalizedToday = normalizeDate(today);
  const normalizedBirthday = normalizeDate(nextBirthday);

  // Рассчитываем разницу в днях
  const daysUntilBirthday = Math.ceil((normalizedBirthday - normalizedToday) / (1000 * 60 * 60 * 24));

  logger.info(`Проверка дня рождения для ${user.firstName} ${user.lastName}, осталось дней: ${daysUntilBirthday}`);

  // Уведомление за месяц до дня рождения
  if (daysUntilBirthday === 30) {
    try {
      await sendNotificationToAdmins(admins, {
        message: `Через месяц день рождения у ${user.firstName} ${user.lastName}`,
        type: 'birthday_reminder',
        eventDate: nextBirthday,
        userId: user.id,
      });
    } catch (error) {
      logger.error('Ошибка при отправке уведомления о дне рождения', { error });
    }
  }

  // Уведомление в день рождения
  if (daysUntilBirthday === 0) {
    try {
      await sendNotificationToAdmins(admins, {
        message: `Сегодня день рождения у ${user.firstName} ${user.lastName}`,
        type: 'birthday',
        eventDate: nextBirthday,
        userId: user.id,
      });
    } catch (error) {
      logger.error('Ошибка при отправке уведомления о дне рождения', { error });
    }
  }
}

// Функция для проверки и отправки уведомлений о повышении зарплаты
async function checkSalaryIncreaseNotifications(user, admins, today) {
  const lastIncrease = user.lastSalaryIncreaseDate
    ? new Date(user.lastSalaryIncreaseDate)
    : new Date(user.hireDate);

  const nextIncreaseDate = new Date(lastIncrease);
  nextIncreaseDate.setMonth(nextIncreaseDate.getMonth() + 6);

  // Нормализация даты сегодняшнего дня и следующей даты повышения зарплаты
  const normalizedToday = normalizeDate(today);
  const normalizedIncreaseDate = normalizeDate(nextIncreaseDate);

  // Рассчитываем разницу в днях
  const daysUntilNextIncrease = Math.ceil((normalizedIncreaseDate - normalizedToday) / (1000 * 60 * 60 * 24));

  logger.info(`Проверка повышения зарплаты для ${user.firstName} ${user.lastName}, осталось дней: ${daysUntilNextIncrease}`);

  // Уведомление за месяц до повышения зарплаты
  if (daysUntilNextIncrease === 30) {
    try {
      await sendNotificationToAdmins(admins, {
        message: `Через месяц запланировано повышение зарплаты для сотрудника ${user.firstName} ${user.lastName}.`,
        type: 'salary_increase_reminder',
        eventDate: nextIncreaseDate,
        userId: user.id,
      });
    } catch (error) {
      logger.error('Ошибка при отправке уведомления о повышении зарплаты', { error });
    }
  }

  // Время для повышения зарплаты
  if (daysUntilNextIncrease <= 0 && user.salary < 1500) {
    const newSalary = Math.min(user.salary + 200, 1500);
    const transaction = await db.sequelize.transaction();
    
    try {
      // Lock the user row to prevent race conditions
      await user.reload({ 
        lock: transaction.LOCK.UPDATE, 
        transaction 
      });
      
      // Check salary again after lock to prevent double increments
      if (user.salary < 1500) {
        const recalculatedSalary = Math.min(user.salary + 200, 1500);
        
        await user.update({
          salary: recalculatedSalary,
          lastSalaryIncreaseDate: today,
        }, { transaction });

        await transaction.commit();

        // Уведомление об автоматическом повышении зарплаты
        await sendNotificationToAdmins(admins, {
          message: `Зарплата сотрудника ${user.firstName} ${user.lastName} была автоматически увеличена до ${recalculatedSalary} долларов.`,
          type: 'salary_increased',
          eventDate: today,
          userId: user.id,
        });

        // Уведомление о достижении порога зарплаты
        if (recalculatedSalary >= 1400) {
          await sendNotificationToAdmins(admins, {
            message: `Сотрудник ${user.firstName} ${user.lastName} достиг порога зарплаты.`,
            type: 'salary_threshold_reached',
            eventDate: today,
            userId: user.id,
          });
        }
      } else {
        await transaction.rollback();
        logger.info(`Зарплата сотрудника ${user.firstName} ${user.lastName} уже на максимуме`);
      }
    } catch (error) {
      await transaction.rollback();
      logger.error('Ошибка при обновлении зарплаты или отправке уведомления о зарплате', { error });
    }
  }
}

// Функция для отправки уведомлений администраторам с проверкой наличия уведомлений для пользователя
async function sendNotificationToAdmins(admins, notificationData) {
  for (const admin of admins) {
    let attempt = 0;
    let success = false;

    while (attempt < RETRIES && !success) {
      const transaction = await db.sequelize.transaction();
      
      try {
        // Проверяем, было ли уже отправлено уведомление с тем же userId и типом
        // Use transaction lock to prevent race conditions
        const existingNotification = await db.Notification.findOne({
          where: {
            userId: notificationData.userId,
            type: notificationData.type,
            eventDate: notificationData.eventDate,
          },
          lock: transaction.LOCK.UPDATE,
          transaction,
        });

        if (!existingNotification) {
          await db.Notification.create({
            message: notificationData.message,
            userId: admin.id,
            type: notificationData.type,
            eventDate: notificationData.eventDate,
            relatedUserId: notificationData.userId,
          }, { transaction });
          logger.info(`Уведомление для администратора ${admin.id} успешно создано`, { adminId: admin.id, type: notificationData.type });
        } else {
          logger.info(`Уведомление уже существует для пользователя ${notificationData.userId} с типом ${notificationData.type}`);
        }

        await transaction.commit();
        success = true; // Уведомление успешно создано, выходим из цикла
      } catch (error) {
        await transaction.rollback();
        attempt++;
        logger.error(`Ошибка при создании уведомления для администратора ${admin.id}. Попытка ${attempt} из ${RETRIES}`, { error });

        if (attempt === RETRIES) {
          logger.error(`Не удалось создать уведомление для администратора ${admin.id} после ${RETRIES} попыток`);
        }
      }
    }
  }
}
