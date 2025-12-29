const pool = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const sendEmail = async (email, link) => {
	let transporter = nodemailer.createTransport({
		service: 'gmail', // Використовуємо вбудований пресет для Gmail
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});

	let info = await transporter.sendMail({
		from: '"CorpMind Support" <no-reply@corpmind.ai>', // Ім'я відправника
		to: email, // Реальна пошта юзера
		subject: 'Reset Your CorpMind Password',
		html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password for your CorpMindAI account.</p>
                <p>Click the button below to set a new password:</p>
                <a href="${link}" style="background-color: #665DCD; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Reset Password</a>
                <p>This link is valid for 1 hour.</p>
                <p style="font-size: 12px; color: #777;">If you didn't request this, please ignore this email.</p>
            </div>
        `,
	});

	console.log('Email sent: %s', info.messageId);
};

// 1. Запит на відновлення
const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;

		// Перевіряємо юзера
		const user = await pool.query('SELECT * FROM users WHERE email = $1', [
			email,
		]);
		if (user.rows.length === 0) {
			return res.status(404).json('User with this email does not exist');
		}

		// Генеруємо токен
		const resetToken = crypto.randomBytes(32).toString('hex');
		const expireDate = new Date();
		expireDate.setHours(expireDate.getHours() + 1); // +1 година

		// Зберігаємо в БД (хешувати токен тут необов'язково для курсової, але можна)
		await pool.query(
			'UPDATE users SET reset_token = $1, reset_token_exp = $2 WHERE email = $3',
			[resetToken, expireDate, email]
		);

		// Використовуємо змінну середовища
		const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
		const link = `${clientUrl}/reset-password/${resetToken}`;

		// Відправляємо лист
		await sendEmail(email, link);

		res.json({ message: 'Check your email for the reset link' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

// 2. Скидання паролю
const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		// Шукаємо юзера з таким токеном і щоб час не вийшов
		const user = await pool.query(
			'SELECT * FROM users WHERE reset_token = $1 AND reset_token_exp > NOW()',
			[token]
		);

		if (user.rows.length === 0) {
			return res.status(400).json('Invalid or expired token');
		}

		// Хешуємо новий пароль
		const salt = await bcrypt.genSalt(10);
		const bcryptPassword = await bcrypt.hash(password, salt);

		// Оновлюємо пароль і очищаємо токен
		await pool.query(
			'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_exp = NULL WHERE id = $2',
			[bcryptPassword, user.rows[0].id]
		);

		res.json({ message: 'Password updated successfully' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

module.exports = { forgotPassword, resetPassword };
