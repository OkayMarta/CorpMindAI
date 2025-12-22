const router = require('express').Router();
const upload = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const documentController = require('../controllers/documentController');

// Всі роути захищені
router.use(authMiddleware);

// Завантаження (поле у формі має називатися "file")
router.post(
	'/upload',
	upload.single('file'),
	documentController.uploadDocument
);

// Отримати список
router.get('/:workspaceId', documentController.getDocuments);

// DELETE
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
