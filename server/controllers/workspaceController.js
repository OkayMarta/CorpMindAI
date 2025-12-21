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

		// Перевірка: чи має юзер доступ до цього ID?
		const memberCheck = await pool.query(
			'SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
			[id, req.user.id]
		);

		if (memberCheck.rows.length === 0) {
			return res.status(403).json('Access Denied');
		}

		const workspace = await pool.query(
			'SELECT * FROM workspaces WHERE id = $1',
			[id]
		);
		res.json(workspace.rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

module.exports = { createWorkspace, getAllWorkspaces, getWorkspaceById };
