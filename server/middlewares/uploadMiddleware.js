const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Переконуємось, що папка існує
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir);
}

// Налаштування сховища
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/');
	},
	filename: function (req, file, cb) {
		// Декодуємо ім'я (utf8)
		file.originalname = Buffer.from(file.originalname, 'latin1').toString(
			'utf8'
		);
		// Унікальне ім'я
		cb(null, Date.now() + '-' + file.originalname);
	},
});

const createUploadMiddleware = (allowedTypes) => {
	const fileFilter = (req, file, cb) => {
		if (allowedTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(
				new Error(
					`Invalid file type. Allowed: ${allowedTypes.join(', ')}`
				),
				false
			);
		}
	};

	return multer({
		storage: storage,
		fileFilter: fileFilter,
		limits: { fileSize: 10 * 1024 * 1024 }, // 10 МБ
	});
};

module.exports = createUploadMiddleware;
