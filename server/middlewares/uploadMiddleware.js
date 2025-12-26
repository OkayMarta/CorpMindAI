const multer = require('multer');
const fs = require('fs');

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
		// 1. Декодуємо ім'я (для коректного відображення кирилиці при завантаженні)
		const utf8Name = Buffer.from(file.originalname, 'latin1').toString(
			'utf8'
		);

		// 2. Санітизація:
		// - Замінюємо всі пробіли на підкреслення (_)
		// - Видаляємо все, що НЕ є буквами (укр/анг), цифрами, крапкою, тире або підкресленням
		const sanitizedName = utf8Name
			.replace(/\s+/g, '_')
			.replace(/[^a-zA-Z0-9а-яА-ЯіїєґІЇЄҐ.\-_]/g, '');

		// 3. Додаємо timestamp для унікальності
		cb(null, Date.now() + '-' + sanitizedName);
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
