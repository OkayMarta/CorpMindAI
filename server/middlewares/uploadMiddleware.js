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
		cb(null, 'uploads/'); // Куди класти
	},
	filename: function (req, file, cb) {
		// Робимо ім'я унікальним: timestamp + оригінальне ім'я
		// ВАЖЛИВО: Декодуємо ім'я, щоб кирилиця не ламалась (Buffer.from...latin1...utf8)
		file.originalname = Buffer.from(file.originalname, 'latin1').toString(
			'utf8'
		);
		cb(null, Date.now() + '-' + file.originalname);
	},
});

// Фільтр (приймаємо тільки документи)
const fileFilter = (req, file, cb) => {
	const allowedTypes = [
		'application/pdf',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
		'text/plain',
	];

	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(
			new Error('Invalid file type. Only PDF, DOCX and TXT are allowed.'),
			false
		);
	}
};

const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: { fileSize: 10 * 1024 * 1024 }, // Ліміт 10 МБ
});

module.exports = upload;
