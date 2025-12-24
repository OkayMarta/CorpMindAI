const pool = require('../config/db');

// Створити новий простір
const createWorkspace = async (req, res) => {
	try {
		const { title } = req.body;
		const ownerId = req.user.id; // З токена

		// 1. Створюємо запис у workspaces
		const newWorkspace = await pool.query(
			'INSERT INTO workspaces (title, owner_id) VALUES ($1, $2) RETURNING *',
			[title, ownerId]
		);

		const workspaceID = newWorkspace.rows[0].id;

		// 2. Автоматично додаємо власника у workspace_members як 'owner'
		await pool.query(
			"INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, 'owner')",
			[workspaceID, ownerId]
		);

		res.json(newWorkspace.rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

// Отримати всі простори, де я є учасником
const getAllWorkspaces = async (req, res) => {
	try {
		const query = `
            SELECT w.id, w.title, wm.role, w.created_at 
            FROM workspaces w 
            JOIN workspace_members wm ON w.id = wm.workspace_id 
            WHERE wm.user_id = $1
            ORDER BY w.created_at DESC
        `;
		const workspaces = await pool.query(query, [req.user.id]);
		res.json(workspaces.rows);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

// Отримати один простір (для входу в чат)
const getWorkspaceById = async (req, res) => {
	try {
		const { id } = req.params;

		const query = `
            SELECT w.id, w.title, w.owner_id, w.created_at, wm.role
            FROM workspaces w
            JOIN workspace_members wm ON w.id = wm.workspace_id
            WHERE w.id = $1 AND wm.user_id = $2
        `;

		const workspace = await pool.query(query, [id, req.user.id]);

		if (workspace.rows.length === 0) {
			return res.status(403).json('Access Denied');
		}

		res.json(workspace.rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

const getWorkspaceMembers = async (req, res) => {
	try {
		const { id } = req.params;

		// Перевіряємо, чи має поточний юзер доступ до воркспейсу
		const accessCheck = await pool.query(
			'SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
			[id, req.user.id]
		);

		if (accessCheck.rows.length === 0) {
			return res.status(403).json('Access Denied');
		}

		// Отримуємо список учасників + дані з таблиці users
		const query = `
            SELECT u.id, u.nickname, u.email, u.avatar_url, wm.role, wm.joined_at
            FROM workspace_members wm
            JOIN users u ON wm.user_id = u.id
            WHERE wm.workspace_id = $1
            ORDER BY wm.role DESC, wm.joined_at ASC
        `;

		const members = await pool.query(query, [id]);
		res.json(members.rows);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

// Видалити воркспейс (Тільки власник)
const deleteWorkspace = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		// Перевіряємо, чи юзер є власником
		const check = await pool.query(
			'SELECT * FROM workspaces WHERE id = $1 AND owner_id = $2',
			[id, userId]
		);

		if (check.rows.length === 0) {
			return res
				.status(403)
				.json('Not authorized to delete this workspace');
		}

		// Видаляємо воркспейс
		await pool.query('DELETE FROM workspaces WHERE id = $1', [id]);

		res.json({ message: 'Workspace deleted successfully' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

// Покинути воркспейс (Для учасника)
const leaveWorkspace = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		// Видаляємо запис про членство
		await pool.query(
			'DELETE FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
			[id, userId]
		);

		res.json({ message: 'Left workspace successfully' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

module.exports = {
	createWorkspace,
	getAllWorkspaces,
	getWorkspaceById,
	getWorkspaceMembers,
	deleteWorkspace,
	leaveWorkspace,
};
