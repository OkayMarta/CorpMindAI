const router = require('express').Router();
const createUpload = require('../middlewares/uploadMiddleware'); // Імпорт функції
const authMiddleware = require('../middlewares/authMiddleware');
const documentController = require('../controllers/documentController');

// Створюємо "документний" завантажувач
const documentUpload = createUpload([
	'application/pdf',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
	'text/plain',
]);

router.use(authMiddleware);

// Використовуємо documentUpload
router.post(
	'/upload',
	documentUpload.single('file'),
	documentController.uploadDocument
);

router.get('/:workspaceId', documentController.getDocuments);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
