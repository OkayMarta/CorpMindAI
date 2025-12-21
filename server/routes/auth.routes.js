const router = require('express').Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const passwordController = require('../controllers/passwordController');

// /api/auth/register
router.post('/register', authController.register);

// /api/auth/login
router.post('/login', authController.login);

// /api/auth/me
router.get('/me', authMiddleware, authController.getMe);

// Роути для паролів
router.post('/forgot-password', passwordController.forgotPassword);
router.post('/reset-password/:token', passwordController.resetPassword);

module.exports = router;
