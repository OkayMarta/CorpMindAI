const router = require('express').Router();
const createUpload = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const documentController = require('../controllers/documentController');
const multer = require('multer');

// Створюємо "документний" завантажувач
const documentUpload = createUpload([
	'application/pdf',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
	'text/plain',
]);

router.use(authMiddleware);

router.post(
	'/upload',
	(req, res, next) => {
		documentUpload.single('file')(req, res, (err) => {
			if (err instanceof multer.MulterError) {
				// Специфічні помилки Multer
				if (err.code === 'LIMIT_FILE_SIZE') {
					return res
						.status(400)
						.json('File size exceeds the 10MB limit');
				}
				return res.status(400).json(err.message);
			} else if (err) {
				// Інші помилки (наприклад, неправильний тип файлу)
				return res.status(400).json(err.message);
			}
			// Якщо помилок немає - йдемо далі до контролера
			next();
		});
	},
	documentController.uploadDocument
);
router.get('/:workspaceId', documentController.getDocuments);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
