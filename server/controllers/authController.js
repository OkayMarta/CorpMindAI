const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwtGenerator = require('../utils/jwtGenerator');

// Реєстрація
const register = async (req, res) => {
	try {
		const { nickname, email, password } = req.body;

		// --- 1. ВАЛІДАЦІЯ ВХІДНИХ ДАНИХ ---

		// Валідація Email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json('Invalid email format');
		}

		// Валідація Пароля (мін 8, 1 літера, 1 цифра, без пробілів)
		const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[^\s]{8,}$/;
		if (!passwordRegex.test(password)) {
			return res
				.status(400)
				.json(
					'Password must be at least 8 chars, contain a letter and a number, and no spaces.'
				);
		}

		// --- 2. ПЕРЕВІРКА УНІКАЛЬНОСТІ ---

		// Перевіряємо Email
		const emailCheck = await pool.query(
			'SELECT * FROM users WHERE email = $1',
			[email]
		);
		if (emailCheck.rows.length > 0) {
			// Повертаємо специфічний код/повідомлення для Email
			return res.status(409).json('Email already registered');
		}

		// Перевіряємо Nickname
		const nicknameCheck = await pool.query(
			'SELECT * FROM users WHERE nickname = $1',
			[nickname]
		);
		if (nicknameCheck.rows.length > 0) {
			return res.status(409).json('Nickname is taken');
		}

		// --- 3. СТВОРЕННЯ КОРИСТУВАЧА ---

		const saltRound = 10;
		const salt = await bcrypt.genSalt(saltRound);
		const bcryptPassword = await bcrypt.hash(password, salt);

		const newUser = await pool.query(
			'INSERT INTO users (nickname, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
			[nickname, email, bcryptPassword]
		);

		const token = jwtGenerator(newUser.rows[0].id);
		res.json({ token });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

// Логін
const login = async (req, res) => {
	try {
		// Отримуємо rememberMe з тіла запиту
		const { email, password, rememberMe } = req.body;

		const user = await pool.query('SELECT * FROM users WHERE email = $1', [
			email,
		]);
		if (user.rows.length === 0) {
			return res.status(401).json('Password or Email is incorrect');
		}

		const validPassword = await bcrypt.compare(
			password,
			user.rows[0].password_hash
		);
		if (!validPassword) {
			return res.status(401).json('Password or Email is incorrect');
		}

		// Логіка часу життя
		const expiresIn = rememberMe ? '7d' : '1h'; // 7 днів або 1 година

		// Передаємо час у генератор
		const token = jwtGenerator(user.rows[0].id, expiresIn);

		res.json({ token });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

// Отримання профілю
const getMe = async (req, res) => {
	try {
		const user = await pool.query(
			'SELECT id, nickname, email, avatar_url FROM users WHERE id = $1',
			[req.user.id]
		);
		res.json(user.rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

module.exports = { register, login, getMe };
