const pool = require('../config/db');
const fs = require('fs'); // Для роботи з файлами
const { chromaClient } = require('../config/ai'); // Для очищення векторної бази

// Створити новий простір
const createWorkspace = async (req, res) => {
	try {
		const { title } = req.body;
		const ownerId = req.user.id;

		const newWorkspace = await pool.query(
			'INSERT INTO workspaces (title, owner_id) VALUES ($1, $2) RETURNING *',
			[title, ownerId]
		);

		const workspaceID = newWorkspace.rows[0].id;

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

// Отримати всі простори
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

// Отримати один простір
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

// Отримати учасників
const getWorkspaceMembers = async (req, res) => {
	try {
		const { id } = req.params;

		const accessCheck = await pool.query(
			'SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
			[id, req.user.id]
		);

		if (accessCheck.rows.length === 0) {
			return res.status(403).json('Access Denied');
		}

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

// --- Функція видалення ---
const deleteWorkspace = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		// 1. Перевірка прав
		const check = await pool.query(
			'SELECT * FROM workspaces WHERE id = $1 AND owner_id = $2',
			[id, userId]
		);

		if (check.rows.length === 0) {
			return res
				.status(403)
				.json('Not authorized to delete this workspace');
		}

		// 2. Отримуємо список файлів, щоб видалити їх фізично
		const filesResult = await pool.query(
			'SELECT filepath FROM documents WHERE workspace_id = $1',
			[id]
		);

		// 3. Видаляємо фізичні файли з папки uploads
		filesResult.rows.forEach((doc) => {
			if (fs.existsSync(doc.filepath)) {
				try {
					fs.unlinkSync(doc.filepath);
					console.log(`Deleted file: ${doc.filepath}`);
				} catch (e) {
					console.error(`Failed to delete file: ${doc.filepath}`, e);
				}
			}
		});

		// 4. Очищаємо векторну базу (ChromaDB)
		try {
			const collectionName = `workspace_${id}`;
			await chromaClient.deleteCollection({ name: collectionName });
			console.log(`Deleted Chroma collection: ${collectionName}`);
		} catch (e) {
			console.warn(`Chroma collection cleanup skipped for ${id}`);
		}

		// 5. Видаляємо запис з БД (PostgreSQL)
		await pool.query('DELETE FROM workspaces WHERE id = $1', [id]);

		res.json({
			message: 'Workspace and all associated data deleted successfully',
		});
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

// Покинути воркспейс
const leaveWorkspace = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

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

// Змінити назву
const updateWorkspace = async (req, res) => {
	try {
		const { id } = req.params;
		const { title } = req.body;
		const userId = req.user.id;

		const check = await pool.query(
			'SELECT * FROM workspaces WHERE id = $1 AND owner_id = $2',
			[id, userId]
		);

		if (check.rows.length === 0) {
			return res.status(403).json('Not authorized');
		}

		const updated = await pool.query(
			'UPDATE workspaces SET title = $1 WHERE id = $2 RETURNING *',
			[title, id]
		);

		res.json(updated.rows[0]);
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
	updateWorkspace,
};
