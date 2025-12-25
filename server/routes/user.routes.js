const router = require('express').Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const createUpload = require('../middlewares/uploadMiddleware');

// Створюємо "картинковий" завантажувач
const imageUpload = createUpload(['image/jpeg', 'image/png', 'image/webp']);

router.use(authMiddleware);

// Використовуємо imageUpload
router.put(
	'/profile',
	imageUpload.single('avatar'),
	userController.updateProfile
);

router.delete('/profile', userController.deleteAccount);

module.exports = router;
