const pool = require('../config/db');
const { askAI } = require('../services/chatService');

// Надіслати повідомлення
const sendMessage = async (req, res) => {
	try {
		const { workspaceId, content } = req.body;
		const userId = req.user.id;

		// 1. Зберігаємо питання юзера
		await pool.query(
			"INSERT INTO messages (workspace_id, user_id, role, content) VALUES ($1, $2, 'user', $3)",
			[workspaceId, userId, content]
		);

		// 2. Отримуємо відповідь від ШІ
		const aiResponse = await askAI(workspaceId, content);

		// 3. Зберігаємо відповідь ШІ
		const savedMsg = await pool.query(
			"INSERT INTO messages (workspace_id, user_id, role, content) VALUES ($1, $2, 'assistant', $3) RETURNING *",
			[workspaceId, userId, aiResponse]
		);

		res.json(savedMsg.rows[0]);
	} catch (err) {
		console.error(err);
		res.status(500).send('Chat Error');
	}
};

// Отримати історію
const getHistory = async (req, res) => {
	try {
		const { workspaceId } = req.params;
		const userId = req.user.id;

		const messages = await pool.query(
			'SELECT * FROM messages WHERE workspace_id = $1 AND user_id = $2 ORDER BY created_at ASC',
			[workspaceId, userId]
		);

		res.json(messages.rows);
	} catch (err) {
		console.error(err);
		res.status(500).send('Server Error');
	}
};

module.exports = { sendMessage, getHistory };
