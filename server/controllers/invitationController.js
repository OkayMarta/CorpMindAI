const pool = require('../config/db');
const crypto = require('crypto');

// 1. Створити запрошення (POST /api/workspaces/:id/invite)
const createInvitation = async (req, res) => {
	try {
		const { id } = req.params; // workspaceId
		const { email } = req.body;
		const senderId = req.user.id;

		// Перевірка 1: Чи існує воркспейс і чи є відправник його учасником (бажано адміном/власником)
		const workspaceCheck = await pool.query(
			"SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2 AND role IN ('owner', 'admin')",
			[id, senderId]
		);

		if (workspaceCheck.rows.length === 0) {
			return res
				.status(403)
				.json('Not authorized to invite to this workspace');
		}

		// Перевірка 2: Чи існує користувач з таким email
		const userCheck = await pool.query(
			'SELECT * FROM users WHERE email = $1',
			[email]
		);
		if (userCheck.rows.length === 0) {
			return res.status(404).json('User with this email not found');
		}
		const receiverId = userCheck.rows[0].id;

		// Перевірка 3: Чи користувач вже є в команді
		const memberCheck = await pool.query(
			'SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
			[id, receiverId]
		);
		if (memberCheck.rows.length > 0) {
			return res.status(400).json('User is already a member');
		}

		// Перевірка 4: Чи вже є активне запрошення
		const inviteCheck = await pool.query(
			"SELECT * FROM invitations WHERE workspace_id = $1 AND email = $2 AND status = 'pending'",
			[id, email]
		);
		if (inviteCheck.rows.length > 0) {
			return res.status(400).json('Invitation already sent');
		}

		// Генерація токена
		const token = crypto.randomBytes(32).toString('hex');

		// Створення запису
		const newInvite = await pool.query(
			'INSERT INTO invitations (token, workspace_id, sender_id, email) VALUES ($1, $2, $3, $4) RETURNING *',
			[token, id, senderId, email]
		);

		res.json(newInvite.rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

// 2. Отримати мої запрошення (GET /api/invitations) - для "Notification Center"
const getMyInvitations = async (req, res) => {
	try {
		const userEmail = await pool.query(
			'SELECT email FROM users WHERE id = $1',
			[req.user.id]
		);
		const email = userEmail.rows[0].email;

		// Отримуємо запрошення разом з назвою воркспейсу та нікнеймом відправника
		const query = `
            SELECT i.id, i.token, i.status, w.title as workspace_title, u.nickname as sender_nickname 
            FROM invitations i
            JOIN workspaces w ON i.workspace_id = w.id
            JOIN users u ON i.sender_id = u.id
            WHERE i.email = $1 AND i.status = 'pending'
            ORDER BY i.created_at DESC
        `;

		const invitations = await pool.query(query, [email]);
		res.json(invitations.rows);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

// 3. Прийняти або відхилити запрошення (POST /api/invitations/respond)
const respondToInvitation = async (req, res) => {
	try {
		const { token, action } = req.body; // action: 'accept' або 'decline'
		const userId = req.user.id;

		// Знаходимо запрошення
		const inviteResult = await pool.query(
			'SELECT * FROM invitations WHERE token = $1',
			[token]
		);

		if (inviteResult.rows.length === 0) {
			return res.status(404).json('Invitation not found');
		}

		const invite = inviteResult.rows[0];

		if (invite.status !== 'pending') {
			return res.status(400).json('Invitation is no longer valid');
		}

		// Перевіряємо, чи це запрошення для поточного юзера (по email)
		const userResult = await pool.query(
			'SELECT email FROM users WHERE id = $1',
			[userId]
		);
		if (userResult.rows[0].email !== invite.email) {
			return res.status(403).json('This invitation is not for you');
		}

		if (action === 'accept') {
			// Транзакція: оновити статус + додати в members
			const client = await pool.connect();
			try {
				await client.query('BEGIN');

				// 1. Оновлюємо статус
				await client.query(
					"UPDATE invitations SET status = 'accepted' WHERE id = $1",
					[invite.id]
				);

				// 2. Додаємо в workspace_members
				await client.query(
					"INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, 'member')",
					[invite.workspace_id, userId]
				);

				await client.query('COMMIT');
				res.json({
					message: 'Invitation accepted',
					workspaceId: invite.workspace_id,
				});
			} catch (e) {
				await client.query('ROLLBACK');
				throw e;
			} finally {
				client.release();
			}
		} else if (action === 'decline') {
			await pool.query(
				"UPDATE invitations SET status = 'declined' WHERE id = $1",
				[invite.id]
			);
			res.json({ message: 'Invitation declined' });
		} else {
			res.status(400).json('Invalid action');
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

module.exports = { createInvitation, getMyInvitations, respondToInvitation };
