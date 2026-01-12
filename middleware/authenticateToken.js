// middleware/authenticateToken.js
const jwt = require('jsonwebtoken');
const config = require('../config/appConfig');
const db = require('../models');

module.exports = async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ error: 'Токен не предоставлен' });

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        console.log('Decoded JWT:', decoded); // Для отладки, выводим декодированный токен
        const user = await db.User.findByPk(decoded.userId); // Убедитесь, что userId здесь правильный

        if (!user) {
            return res.status(401).json({ error: 'Пользователь не найден' });
        }

        req.user = { userId: user.id, role: user.role }; // Добавляем userId в req.user
        next();
    } catch (err) {
        console.error('JWT verification error:', err); // Отладка: выводим ошибку
        
        // Handle specific JWT errors
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Токен истек', expiredAt: err.expiredAt });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({ error: 'Недействительный токен' });
        } else if (err.name === 'NotBeforeError') {
            return res.status(403).json({ error: 'Токен еще не активен' });
        }
        
        return res.status(403).json({ error: 'Недействительный токен' });
    }
};
