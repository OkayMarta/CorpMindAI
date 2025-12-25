const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

const updateProfile = async (req, res) => {
	try {
		const userId = req.user.id;
		const { nickname, removeAvatar } = req.body;
		const file = req.file;

		// 1. Перевірка унікальності нікнейму
		if (nickname) {
			const nickCheck = await pool.query(
				'SELECT * FROM users WHERE nickname = $1 AND id != $2',
				[nickname, userId]
			);
			if (nickCheck.rows.length > 0) {
				if (file) fs.unlinkSync(file.path);
				return res.status(409).json('Nickname is already taken');
			}
		}

		// 2. Логіка видалення старого файлу (якщо завантажуємо новий АБО видаляємо старий)
		if (file || removeAvatar === 'true') {
			const oldUser = await pool.query(
				'SELECT avatar_url FROM users WHERE id = $1',
				[userId]
			);
			const oldAvatarPath = oldUser.rows[0].avatar_url;

			if (oldAvatarPath) {
				// oldAvatarPath виглядає як "/uploads/123.jpg", треба отримати повний шлях
				const filename = oldAvatarPath.split('/').pop();
				const fullPath = path.join(__dirname, '../uploads', filename);
				if (fs.existsSync(fullPath)) {
					fs.unlinkSync(fullPath); // Видаляємо фізичний файл
				}
			}
		}

		// 3. Формуємо SQL запит
		let query = 'UPDATE users SET ';
		const values = [];
		let paramIndex = 1;

		if (nickname) {
			query += `nickname = $${paramIndex}, `;
			values.push(nickname);
			paramIndex++;
		}

		if (file) {
			const avatarUrl = `/uploads/${file.filename}`;
			query += `avatar_url = $${paramIndex}, `;
			values.push(avatarUrl);
			paramIndex++;
		} else if (removeAvatar === 'true') {
			// Якщо прапорець стоїть - очищаємо поле в БД
			query += `avatar_url = NULL, `;
		}

		// Завершуємо запит
		query = query.slice(0, -2);
		query += ` WHERE id = $${paramIndex} RETURNING id, nickname, email, avatar_url`;
		values.push(userId);

		const updatedUser = await pool.query(query, values);
		res.json(updatedUser.rows[0]);
	} catch (err) {
		console.error(err);
		if (req.file) fs.unlinkSync(req.file.path);
		res.status(500).send('Server Error');
	}
};

// Видалення акаунту
const deleteAccount = async (req, res) => {
	try {
		const userId = req.user.id;

		// Видаляємо користувача
		await pool.query('DELETE FROM users WHERE id = $1', [userId]);

		res.json({ message: 'Account deleted successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).send('Server Error');
	}
};

module.exports = { updateProfile, deleteAccount };
